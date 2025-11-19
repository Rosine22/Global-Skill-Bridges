const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const mentorshipRoutes = require('./routes/mentorship');
const skillsRoutes = require('./routes/skills');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const rtbRoutes = require('./routes/rtb');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  }
});

// Initialize Multer
const upload = multer({ storage: storage });

// Route to handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.send(`File uploaded successfully: ${req.file.filename}`);
});

app.use('/uploads', express.static('uploads'));


// Trust proxy (important for rate limiting behind proxies)
app.set('trust proxy', 1);

// MongoDB Atlas Connection
const connectDB = async () => {
  try {
    // MongoDB Atlas connection string
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Global-skills';
    //mongodb+srv://rosine:<db_password>@cluster0.o0f0hb5.mongodb.net/global-skills-bridge?retryWrites=true&w=majority
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(` MongoDB Atlas Connected Successfully!`);
    console.log(` Database Host: ${conn.connection.host}`);
    console.log(` Database Name: ${conn.connection.name}`);
    console.log(` Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(' MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error(' Database connection failed:', error.message);
    console.log(' Connection troubleshooting tips:');
    console.log('   1. Check if your IP address is whitelisted in MongoDB Atlas');
    console.log('   2. Verify your database password is correct');
    console.log('   3. Ensure network connectivity to MongoDB Atlas');
    console.log('   4. Check if your MongoDB Atlas cluster is active');
    process.exit(1);
  }
};

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Normalize configured frontend URL to avoid trailing-slash mismatches
    const rawFront = process.env.FRONTEND_URL || 'http://localhost:3000';
    const frontendUrl = String(rawFront).replace(/\/+$/, '');

    // Allow requests from your frontend and other authorized origins
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ].map(o => String(o).replace(/\/+$/, ''));

    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = String(origin).replace(/\/+$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Route
app.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'Connected' : dbState === 2 ? 'Connecting' : 'Disconnected';
  
  res.status(200).json({
    success: true,
    message: 'Global Skills Bridge API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'Not connected'
    },
    version: '1.0.0'
  });
});

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.status(200).json({
      success: true,
      database: {
        status: dbState === 1 ? 'Connected' : 'Disconnected',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: collections.map(col => col.name),
        totalCollections: collections.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database status check failed',
      error: error.message
    });
  }
});

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    message: '🌟 Welcome to Global Skills Bridge API',
    version: '1.0.0',
    description: 'Backend API for TVET job matching and skills development platform',
    endpoints: {
      health: '/health',
      apiDocs: '/api/docs',
      dbStatus: '/api/db-status'
    },
    features: [
      'Multi-role Authentication (Job Seekers, Employers, Mentors, Admins, RTB)',
      'Job Management & Applications',
      'Skills Verification & Assessment',
      'Mentorship Programs',
      'Real-time Messaging',
      'Analytics & Reporting',
      'RTB Graduate Tracking'
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rtb', rtbRoutes);
app.use('/api/analytics', analyticsRoutes);
app.post("/api/uploads", )
// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Global Skills Bridge API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Error Handling Middleware (must be after routes)
app.use("*", notFound);
app.use(errorHandler);

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    console.log('👋 Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled Promise Rejection Handler
process.on('unhandledRejection', (err, promise) => {
  console.error('💥 Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 Global Skills Bridge API Server Started Successfully!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server URL: http://localhost:${PORT}
🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
💾 Database: MongoDB Atlas
📊 Health Check: http://localhost:${PORT}/health
📚 API Docs: http://localhost:${PORT}/api/docs
⏰ Started at: ${new Date().toLocaleString()}
      `);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`💥 Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`💥 Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
};

// Initialize Server
if (require.main === module) {
  startServer().catch(console.error);
}

module.exports = app;
