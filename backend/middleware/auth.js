const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - Verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists in cookies (alternative method)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. No token provided.",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID and attach to request
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is valid but user no longer exists",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account has been deactivated",
        });
      }

      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(401).json({
          success: false,
          message: "Account has been blocked. Contact support.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
        });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please login again.",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Token verification failed",
        });
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(
          ", "
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Resource ownership check (for user-specific resources)
const checkOwnership = (resourceField = "user") => {
  return (req, res, next) => {
    // This middleware should be used after protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Skip ownership check for admins
    if (req.user.role === "admin" || req.user.role === "rtb-admin") {
      return next();
    }

    // The actual ownership check will be done in the route handler
    // since we need to fetch the resource first
    next();
  };
};

// Email verification required
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message:
        "Email verification required. Please verify your email to access this resource.",
      requiresEmailVerification: true,
    });
  }

  next();
};

// Profile completion check
const requireProfileCompletion = (minimumCompletion = 50) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const completion = req.user.profileCompletion || 0;

    if (completion < minimumCompletion) {
      return res.status(403).json({
        success: false,
        message: `Profile completion required. Your profile is ${completion}% complete. Minimum required: ${minimumCompletion}%`,
        currentCompletion: completion,
        requiredCompletion: minimumCompletion,
      });
    }

    next();
  };
};

// Rate limiting for sensitive operations
const rateLimitByUser = (maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(userId)) {
      const userRequests = requests
        .get(userId)
        .filter((time) => time > windowStart);
      requests.set(userId, userRequests);
    } else {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    // Add current request
    userRequests.push(now);
    requests.set(userId, userRequests);

    next();
  };
};

// Optional authentication (for public routes that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (user && user.isActive && !user.isBlocked) {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  requireEmailVerification,
  requireProfileCompletion,
  rateLimitByUser,
  optionalAuth,
};
