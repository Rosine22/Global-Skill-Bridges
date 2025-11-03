const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.log(err)

  // Log error for debugging
  console.error("Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      message,
      statusCode: 404,
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    let field = Object.keys(err.keyValue)[0];
    let value = err.keyValue[field];

    // Custom messages for specific fields
    const fieldMessages = {
      email: "An account with this email address already exists",
      phone: "An account with this phone number already exists",
      "companyInfo.registrationNumber":
        "A company with this registration number already exists",
    };

    const message = fieldMessages[field] || `Duplicate field value: ${value}`;
    error = {
      message,
      statusCode: 400,
      field,
      value,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = {
      message,
      statusCode: 400,
      validationErrors: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {}),
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please login again.";
    error = {
      message,
      statusCode: 401,
    };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token has expired. Please login again.";
    error = {
      message,
      statusCode: 401,
    };
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File size too large. Maximum size allowed is 5MB.";
    error = {
      message,
      statusCode: 400,
    };
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Unexpected file field or too many files uploaded.";
    error = {
      message,
      statusCode: 400,
    };
  }

  // Database connection errors
  if (err.name === "MongoNetworkError") {
    const message = "Database connection error. Please try again later.";
    error = {
      message,
      statusCode: 503,
    };
  }

  // Custom application errors
  if (err.isOperational) {
    error = {
      message: err.message,
      statusCode: err.statusCode || 500,
    };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || "Server Error";

  // Prepare error response
  let errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
    }),
  };

  // Add additional error details for validation errors
  if (error.validationErrors) {
    errorResponse.validationErrors = error.validationErrors;
  }

  if (error.field && error.value) {
    errorResponse.field = error.field;
    errorResponse.value = error.value;
  }

  // Add request ID for tracking (if available)
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  // Log error details for monitoring
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: req.user?.id,
    ...(req.requestId && { requestId: req.requestId }),
  };

  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === "production") {
    console.error("Error Log:", JSON.stringify(logData));
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
