const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");
const mentorshipRoutes = require("./routes/mentorship");
const skillsRoutes = require("./routes/skills");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const rtbRoutes = require("./routes/rtb");
const analyticsRoutes = require("./routes/analytics");
const publicRoutes = require("./routes/public");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();

// Trust proxy (important for rate limiting behind proxies)
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// CORS Configuration
// Default FRONTEND_URL fallback uses the deployed Vercel frontend so links and CORS
// allow the production frontend by default when environment variables are not set.
const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://global-skills-br.netlify.app/",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Global Skills Bridge API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rtb", rtbRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/public", publicRoutes);

// Welcome Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Global Skills Bridge API",
    version: "1.0.0",
    documentation: "/api/docs",
    health: "/health",
  });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await mongoose.connection.close();
  process.exit(0);
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`
🚀 Global Skills Bridge API Server Started
📍 Environment: ${process.env.NODE_ENV}
🔗 URL: http://localhost:${PORT}
💾 Database: ${mongoose.connection.name}
⏰ Started at: ${new Date().toLocaleString()}
    `);
  });
};

// Initialize Server
if (require.main === module) {
  startServer().catch(console.error);
}

module.exports = app;
