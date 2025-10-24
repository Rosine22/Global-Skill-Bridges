const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect, rateLimitByUser } = require("../middleware/auth");
const EmailService = require("../services/emailService");

const router = express.Router();

// Initialize email service
const emailService = new EmailService();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

// Send Token Response
const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  // Remove password from response
  user.password = undefined;

  res
    .status(statusCode)
    .cookie("token", token, options)
    .cookie("refreshToken", refreshToken, {
      ...options,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      message,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        profileCompletion: user.profileCompletion,
      },
    });
};

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["job-seeker", "employer", "mentor"])
    .withMessage("Invalid role specified"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             name: "John Doe"
 *             email: "john@example.com"
 *             password: "password123"
 *             role: "job-seeker"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerValidation, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, email, password, role, phone, companyInfo, avatar } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      role: role || "job-seeker",
      phone,
    };

    // Add company info for employers
    if (role === "employer" && companyInfo) {
      userData.companyInfo = companyInfo;
    }

    // Add avatar/logo if provided (base64 or URL)
    if (avatar) {
      userData.avatar = {
        url: avatar,
        public_id: `avatar_${Date.now()}` // Generate a simple ID
      };
    }

    // Create user
    user = await User.create(userData);

    // Calculate initial profile completion
    user.calculateProfileCompletion();
    await user.save();

    // Send verification email
    try {
      // Generate email verification token (you may need to add this method to User model)
      const verificationToken = crypto.randomBytes(20).toString('hex');
      user.emailVerificationToken = verificationToken;
      await user.save({ validateBeforeSave: false });

      const emailResult = await emailService.sendEmailVerificationEmail(
        user.email,
        verificationToken,
        user
      );

      if (emailResult.success) {
        console.log(`Verification email sent to ${user.email}: ${emailResult.messageId}`);
      } else {
        console.error(`Failed to send verification email to ${user.email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email fails
    }

    sendTokenResponse(user, 201, res, "User registered successfully");
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "john@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", loginValidation, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Check for user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated. Contact support.",
      });
    }

    // Check if account is blocked
    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: "Account has been blocked. Contact support.",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, "Login successful");
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookies
// @access  Public
router.post("/logout", (req, res) => {
  res
    .cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .cookie("refreshToken", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("activeMentees");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    const allowedFields = [
      "name",
      "phone",
      "location",
      "dateOfBirth",
      "gender",
      "education",
      "experience",
      "skills",
      "companyInfo",
      "mentorInfo",
      "rtbInfo",
      "socialLinks",
      "preferences",
    ];

    // Only update allowed fields that are present in request
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    // Recalculate profile completion
    user.calculateProfileCompletion();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put(
  "/change-password",
  protect,
  rateLimitByUser(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user.id).select("+password");

      // Check current password
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Send reset password email
// @access  Public
router.post(
  "/forgot-password",
  rateLimitByUser(3, 15 * 60 * 1000),
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email",
          errors: errors.array(),
        });
      }

      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        // Don't reveal if email exists or not
        return res.status(200).json({
          success: true,
          message:
            "If an account with that email exists, a password reset link has been sent",
        });
      }

      // Generate reset token
      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      try {
        // Send password reset email
        const emailResult = await emailService.sendPasswordResetEmail(
          user.email,
          resetToken,
          user
        );

        if (emailResult.success) {
          console.log(`Password reset email sent to ${user.email}: ${emailResult.messageId}`);
        } else {
          console.error(`Failed to send password reset email to ${user.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        // Don't fail the request if email fails - still return success for security
      }

      res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent",
        resetToken:
          process.env.NODE_ENV === "development" ? resetToken : undefined,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/auth/reset-password/:resettoken
// @desc    Reset password
// @access  Public
router.put(
  "/reset-password/:resettoken",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      // Get hashed token
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex");

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      // Set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      sendTokenResponse(user, 200, res, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.post("/verify-email/:token", async (req, res, next) => {
  try {
    // In a real implementation, you'd verify the token and update the user
    // For now, we'll just find by token and update
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.calculateProfileCompletion();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token using refresh token
// @access  Public
router.post("/refresh-token", async (req, res, next) => {
  try {
    let refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive || user.isBlocked) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      sendTokenResponse(user, 200, res, "Token refreshed successfully");
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
