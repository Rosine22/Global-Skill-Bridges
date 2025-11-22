const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const RtbInvite = require('../models/RtbInvite');
const { protect, rateLimitByUser } = require("../middleware/auth");
const EmailService = require("../services/emailService");
// Import in-app notification helper
const { createNotification } = require("./notifications");

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
const sendTokenResponse = (user, statusCode, res, message = "Success", extra = {}) => {
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

  const payload = {
    success: true,
    message,
    token,
    refreshToken,
    // Include approval and status fields so frontend can make correct routing decisions
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      profileCompletion: user.profileCompletion,
      isApproved: user.isApproved,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      approvalDate: user.approvalDate,
    },
    ...extra,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .cookie("refreshToken", refreshToken, {
      ...options,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .json(payload);
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
    .isIn(["job-seeker", "employer", "mentor", "rtb-admin"])
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
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { name, email, password, role, phone, companyInfo, avatar } = req.body;
    console.log(req.body);
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
      // Copy common company fields to top-level aliases for backward compatibility
      // and to make sure admin/frontend can easily read them regardless of
      // whether they expect `companyInfo.*` or top-level fields.
      const ci = companyInfo || {};
      if (ci.name) userData.companyName = ci.name;
      if (ci.registrationNumber) userData.companyRegistration = ci.registrationNumber;
      if (ci.website) userData.website = ci.website;
      if (ci.size) userData.companySize = ci.size;
      if (ci.industry) userData.companyIndustry = ci.industry;
      if (ci.description) userData.description = ci.description;
      if (ci.contactPerson) userData.contactPerson = ci.contactPerson;
      if (ci.taxId) userData.taxId = ci.taxId;
      // If phone provided at company level and not already set at top-level, copy it
      if (ci.phone && !userData.phone) userData.phone = ci.phone;
      
      // If avatar/logo is provided for employer, save it both as avatar and in companyInfo.logo
      if (avatar) {
        const logoData = {
          url: avatar,
          public_id: `company_logo_${Date.now()}`
        };
        userData.avatar = logoData; // For general avatar display
        userData.companyInfo.logo = logoData; // For company-specific logo
      }
    } else {
      // For non-employers, just save as avatar
      if (avatar) {
        userData.avatar = {
          url: avatar,
          public_id: `avatar_${Date.now()}`
        };
      }
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

    // If this is an employer registration, only notify admins if company profile
    // information has been provided. Otherwise the employer should be directed
    // to complete the company profile first (frontend will handle redirecting
    // based on the `nextStep` flag we return below).
    try {
      if (user.role === 'employer') {
        const hasCompanyProfile = !!(user.companyInfo && user.companyInfo.name);
        if (hasCompanyProfile) {
          // Notify admin(s) by email
          const adminNotifyResult = await emailService.sendNewEmployerNotificationToAdmin(user);
          if (!adminNotifyResult.success) {
            console.error('Failed to notify admin about new employer (email):', adminNotifyResult.error);
          }

          // Create in-app notification for admins (find all admin users)
          try {
            const admins = await User.find({ role: { $in: ['admin', 'rtb-admin'] } }).select('_id');
            await Promise.all(admins.map(a => createNotification(a._id, 'employer-registration', 'New Employer Registration', `A new employer (${user.companyInfo?.name || user.name}) registered and requires approval.`, { userId: user._id })));
          } catch (notifErr) {
            console.error('Failed to create in-app admin notification:', notifErr);
          }
        } else {
          // No company profile yet; do not notify admins. Frontend should redirect
          // the employer to the company-profile page to complete onboarding.
          console.log('Employer registered without company profile; skipping admin notification until profile completed.');
        }
      }
    } catch (notifyErr) {
      console.error('Error during employer/admin notification:', notifyErr);
      // Do not fail registration if notification fails
    }

    // If employer and company profile is missing, instruct frontend to show
    // company profile onboarding as the next step.
    const extra = {};
    if (user.role === 'employer' && !(user.companyInfo && user.companyInfo.name)) {
      extra.nextStep = 'company-profile';
    }

    sendTokenResponse(user, 201, res, "User registered successfully", extra);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user's email using token sent by email
// @access  Public
// @route   GET /api/auth/verify-email
// @desc    Verify user's email via one-click link and redirect to frontend
// @access  Public
router.get('/verify-email', async (req, res, next) => {
  try {
    // Accept token/email from query params (supports either 'token' or 'verifyToken')
    const token = req.query.token || req.query.verifyToken;
    const email = (req.query.email || '').toLowerCase();
    const postLoginRedirect = req.query.postLoginRedirect || '';

    if (!token || !email) {
      // Redirect to frontend login with an error flag if missing
      const frontend = process.env.FRONTEND_URL || 'https://global-skills-br.netlify.app';
      const frontendBase = String(frontend).replace(/\/+$/, '');
      const redirectUrl = `${frontendBase}/login?verified=false`;
      return res.redirect(302, redirectUrl);
    }

    // Find user by email and token
    const user = await User.findOne({ email: email, emailVerificationToken: token });

    if (!user) {
      const frontend = process.env.FRONTEND_URL || 'https://global-skills-br.netlify.app';
      const frontendBase = String(frontend).replace(/\/+$/, '');
      const redirectUrl = `${frontendBase}/login?verified=false`;
      return res.redirect(302, redirectUrl);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    const frontend = process.env.FRONTEND_URL || 'https://global-skills-br.netlify.app';
    const frontendBase = String(frontend).replace(/\/+$/, '');
    const redirectUrl = `${frontendBase}/login?verified=true&email=${encodeURIComponent(email)}${postLoginRedirect ? `&postLoginRedirect=${encodeURIComponent(postLoginRedirect)}` : ''}`;

    return res.redirect(302, redirectUrl);
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    // Accept token/email from body or query, and accept either 'token' or 'verifyToken'
    const token = req.body.token || req.body.verifyToken || req.query.token || req.query.verifyToken;
    const email = (req.body.email || req.query.email || '').toLowerCase();

    if (!token || !email) {
      return res.status(400).json({ success: false, message: 'Token and email are required' });
    }

    // Helpful debug log when tokens fail in dev — safe to remove later
    console.debug(`verify-email called for ${email} with token: ${token}`);

    // Find user by email and token
    const user = await User.findOne({ email: email, emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
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

    // Prevent employers who are not approved from logging in
    if (user.role === 'employer' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Employer account is pending approval. You will be notified once an admin reviews your application.'
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

/**
 * @route POST /api/auth/rtb/request-code
 * @desc  Request a one-time code to sign in as RTB admin (sends code to email)
 * @access Public
 */
router.post('/rtb/request-code', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Generate 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash code before saving
    const tokenHash = crypto.createHash('sha256').update(code).digest('hex');
    const expireMinutes = parseInt(process.env.RTB_CODE_EXPIRE_MINUTES || '60', 10);
    const expiresAt = new Date(Date.now() + expireMinutes * 60 * 1000); // configurable minutes

    // Invalidate previous invites for this email
    await RtbInvite.updateMany({ email: email.toLowerCase(), used: false }, { used: true });

    // Save invite
    await RtbInvite.create({ email: email.toLowerCase(), tokenHash, expiresAt });

    // Send email with code
    const emailResult = await emailService.sendRtbInviteCodeEmail(email, code);

    if (!emailResult.success) {
      console.error('Failed to send RTB invite code:', emailResult.error);
      return res.status(500).json({ success: false, message: 'Failed to send code' });
    }

    return res.status(200).json({ success: true, message: 'Sign-in code sent to email' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/rtb/verify-code
 * @desc  Verify code and create/login rtb-admin user
 * @access Public
 */
router.post('/rtb/verify-code', async (req, res, next) => {
  try {
    const { email, code, name } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const tokenHash = crypto.createHash('sha256').update(String(code)).digest('hex');

    // Find invite
    const invite = await RtbInvite.findOne({ email: email.toLowerCase(), tokenHash, used: false, expiresAt: { $gt: new Date() } });
    if (!invite) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    // Mark invite used
    invite.used = true;
    await invite.save();

    // Find existing user
    let user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (user) {
      // If user exists but is not rtb-admin, deny (to avoid role hijacking)
      if (user.role !== 'rtb-admin' && user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'This email is already registered with a different role' });
      }

      // Ensure email verified and approved
      user.isEmailVerified = true;
      user.isApproved = true;
      await user.save();

      // Send tokens
      return sendTokenResponse(user, 200, res, 'Login successful');
    }

    // Create new rtb-admin user
    const randomPassword = crypto.randomBytes(12).toString('hex');
    const hashed = await bcrypt.hash(randomPassword, 10);

    const newUser = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: hashed,
      role: 'rtb-admin',
      isEmailVerified: true,
      isActive: true,
      isBlocked: false,
      isApproved: true,
      profileCompletion: 100,
    });

    // Immediately login the new user
    return sendTokenResponse(newUser, 201, res, 'RTB admin account created and logged in');
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
      "avatar",
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

    // Load existing user to check previous companyInfo state
    const existingUser = await User.findById(req.user.id).select('-password');

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    // If employer completed/updated company profile now, notify admins so they can review
    try {
      if (user && user.role === 'employer' && fieldsToUpdate.companyInfo) {
        const prevHasCompany = !!(existingUser && existingUser.companyInfo && existingUser.companyInfo.name);
        const newHasCompany = !!(user.companyInfo && user.companyInfo.name);
        if (!prevHasCompany && newHasCompany) {
          // Notify admins by email
          const adminNotifyResult = await emailService.sendNewEmployerNotificationToAdmin(user);
          if (!adminNotifyResult.success) {
            console.error('Failed to notify admin about new employer (email) on profile update:', adminNotifyResult.error);
          }

          // Create in-app admin notifications
          try {
            const admins = await User.find({ role: { $in: ['admin', 'rtb-admin'] } }).select('_id');
            await Promise.all(admins.map(a => createNotification(a._id, 'employer-registration', 'New Employer Registration', `A new employer (${user.companyInfo?.name || user.name}) completed profile and requires approval.`, { userId: user._id })));
          } catch (notifErr) {
            console.error('Failed to create in-app admin notification on profile update:', notifErr);
          }
        }
      }
    } catch (notifyErr) {
      console.error('Error notifying admins after profile update:', notifyErr);
    }

    // Recalculate profile completion and save
    if (user) {
      try {
        user.calculateProfileCompletion();
        await user.save();
      } catch (e) {
        console.error('Failed to save profile completion after update:', e);
      }
    }

    // Return updated user
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token and send email
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });

    // Always respond with 200 to avoid email enumeration
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token (unhashed) and save hashed token on user
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email
    const emailResult = await emailService.sendPasswordResetEmail(user.email, resetToken, user);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return res.status(500).json({ success: false, message: 'Failed to send password reset email' });
    }

    return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.put('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password' });
    }

    // Hash token to compare with stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password (pre-save middleware will hash)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Optionally log the user in by sending tokens
    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
});


// Export model safely to prevent OverwriteModelError
module.exports = router;
