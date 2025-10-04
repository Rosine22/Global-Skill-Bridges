# Global Skills Bridge - Backend API

A comprehensive Node.js backend server built with Express.js and MongoDB to support the Global Skills Bridge platform. This API serves 5 different user dashboards and provides complete functionality for job management, application tracking, mentorship programs, skills verification, messaging, and administrative controls.

## 🚀 Features

### Core Functionality

- **Multi-Role Authentication**: JWT-based auth supporting 5 user types (Job Seeker, Employer, Mentor, Admin, RTB Admin)
- **Job Management**: Complete CRUD operations with advanced search, filtering, and matching
- **Application Tracking**: Full application lifecycle management with status updates and interview scheduling
- **Mentorship System**: Mentor-mentee matching, session scheduling, and progress tracking
- **Skills Verification**: Comprehensive skills assessment and verification system
- **Real-time Messaging**: Direct messaging between users with file sharing and job sharing
- **Notifications System**: In-app notifications with email integration
- **Analytics Dashboard**: Comprehensive analytics for platform insights
- **RTB Graduate Tracking**: Specialized system for tracking graduate employment outcomes

### Technical Features

- **Security**: Helmet, CORS, rate limiting, input validation, password hashing
- **Database**: MongoDB with Mongoose ODM, optimized schemas and indexes
- **File Upload**: Support for profile pictures, documents, and certificates
- **Email Service**: Transactional emails for notifications and verification
- **Error Handling**: Comprehensive error handling with detailed logging
- **API Documentation**: Well-structured RESTful API design

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, bcryptjs, express-rate-limit
- **File Upload**: Multer with Cloudinary integration
- **Email**: Nodemailer
- **Real-time**: Socket.io (configured)
- **Environment**: dotenv for configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## ⚡ Quick Start

### 1. Clone and Install

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/global-skills-bridge

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
FROM_EMAIL=noreply@globalskillsbridge.com
FROM_NAME=Global Skills Bridge

# File Upload (Optional - for Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Encryption (for sensitive data)
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

### 3. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if using local installation)
mongod

# Or start MongoDB service (Linux/macOS)
sudo systemctl start mongod
```

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register          # Register new user
POST /api/auth/login             # User login
POST /api/auth/refresh           # Refresh JWT token
POST /api/auth/forgot-password   # Request password reset
POST /api/auth/reset-password    # Reset password with token
POST /api/auth/verify-email      # Verify email address
GET  /api/auth/me               # Get current user info
POST /api/auth/logout           # Logout user
```

### User Management

```
GET    /api/users/profile             # Get current user profile
PUT    /api/users/profile             # Update user profile
PUT    /api/users/password            # Change password
GET    /api/users/search              # Search users
GET    /api/users/:id                 # Get user by ID
POST   /api/users/skills              # Add skill to profile
DELETE /api/users/skills/:skillId     # Remove skill
POST   /api/users/experience          # Add work experience
PUT    /api/users/experience/:id      # Update experience
DELETE /api/users/experience/:id      # Delete experience
GET    /api/users/dashboard-stats     # Get dashboard statistics
```

### Job Management

```
GET    /api/jobs                 # Get all jobs (with filtering)
POST   /api/jobs                 # Create new job
GET    /api/jobs/:id              # Get job by ID
PUT    /api/jobs/:id              # Update job
DELETE /api/jobs/:id              # Delete job
GET    /api/jobs/search           # Advanced job search
POST   /api/jobs/:id/save         # Save/unsave job
GET    /api/jobs/saved            # Get saved jobs
GET    /api/jobs/recommended      # Get job recommendations
```

### Application Management

```
GET    /api/applications          # Get user's applications
POST   /api/applications          # Submit job application
GET    /api/applications/:id      # Get application details
PUT    /api/applications/:id      # Update application
DELETE /api/applications/:id      # Withdraw application
PUT    /api/applications/:id/status # Update application status
```

### Mentorship System

```
GET    /api/mentorship/requests   # Get mentorship requests
POST   /api/mentorship/requests   # Create mentorship request
PUT    /api/mentorship/requests/:id # Update request status
GET    /api/mentorship/mentors    # Find available mentors
GET    /api/mentorship/sessions   # Get mentorship sessions
POST   /api/mentorship/sessions   # Schedule session
```

### Skills & Verification

```
GET    /api/skills                      # Get all skills
POST   /api/skills                      # Create new skill
GET    /api/skills/verification/:userId # Get user's skill verifications
POST   /api/skills/verify/:skillId      # Submit/verify skill
POST   /api/skills/endorse/:skillId     # Endorse a skill
GET    /api/skills/pending-verifications # Get pending verifications
```

### Messaging System

```
GET    /api/messages/conversations     # Get all conversations
GET    /api/messages/conversation/:id  # Get conversation messages
POST   /api/messages/send              # Send message
PUT    /api/messages/:id/read          # Mark message as read
DELETE /api/messages/:id               # Delete message
GET    /api/messages/search            # Search messages
```

### Notifications

```
GET    /api/notifications              # Get notifications
POST   /api/notifications/mark-read   # Mark notifications as read
DELETE /api/notifications/:id         # Delete notification
GET    /api/notifications/unread-count # Get unread count
```

### Admin Routes (Admin Only)

```
GET    /api/admin/dashboard           # Admin dashboard stats
GET    /api/admin/users               # Manage users
PUT    /api/admin/users/:id/status    # Update user status
GET    /api/admin/jobs                # Manage jobs
PUT    /api/admin/jobs/:id/status     # Update job status
GET    /api/admin/applications        # View all applications
GET    /api/admin/analytics           # Platform analytics
```

### RTB Administration (RTB Admin Only)

```
GET    /api/rtb/dashboard             # RTB dashboard
GET    /api/rtb/graduates             # Manage graduates
POST   /api/rtb/graduates             # Add graduate
PUT    /api/rtb/graduates/:id         # Update graduate info
GET    /api/rtb/analytics             # RTB analytics
GET    /api/rtb/reports/employment    # Employment reports
```

### Analytics (Admin Only)

```
GET    /api/analytics/overview        # Platform overview
GET    /api/analytics/trends          # Usage trends
GET    /api/analytics/geographic      # Geographic distribution
GET    /api/analytics/skills          # Skills analytics
GET    /api/analytics/employment      # Employment analytics
```

## 🗄️ Database Schema

### User Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: Enum ['job-seeker', 'employer', 'mentor', 'admin', 'rtb-admin'],
  avatar: String (URL),
  location: {
    city: String,
    country: String,
    coordinates: [Number]
  },
  skills: [{
    skill: ObjectId (ref: 'Skill'),
    proficiencyLevel: Enum ['beginner', 'intermediate', 'advanced', 'expert'],
    yearsOfExperience: Number
  }],
  experience: [{
    position: String,
    company: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String
  }],
  education: [EducationSchema],
  preferences: Object,
  notifications: [NotificationSchema],
  // ... and more fields
}
```

### Job Schema

```javascript
{
  title: String (required),
  company: {
    name: String (required),
    logo: String,
    website: String
  },
  description: String (required),
  location: LocationSchema,
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  requirements: {
    skills: [String],
    experience: String,
    education: String
  },
  benefits: [String],
  jobType: Enum ['full-time', 'part-time', 'contract', 'internship'],
  status: Enum ['active', 'closed', 'draft'],
  // ... and more fields
}
```

### Application Schema

```javascript
{
  applicant: ObjectId (ref: 'User', required),
  job: ObjectId (ref: 'Job', required),
  status: Enum ['submitted', 'under-review', 'interview-scheduled', 'hired', 'rejected'],
  coverLetter: String,
  resume: String (URL),
  matchScore: Number,
  interviewDetails: Object,
  // ... and more fields
}
```

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based authentication with refresh tokens
2. **Password Hashing**: bcryptjs with salt rounds for secure password storage
3. **Rate Limiting**: Prevents API abuse with configurable limits
4. **Input Validation**: Comprehensive validation using express-validator
5. **Helmet**: Sets various HTTP headers for security
6. **CORS**: Configurable Cross-Origin Resource Sharing
7. **MongoDB Injection Prevention**: Mongoose helps prevent NoSQL injection

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-production-jwt-secret
# ... other production variables
```

### Docker Deployment (Optional)

```dockerfile
# Create Dockerfile in backend directory
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Heroku Deployment

```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-connection-string
# ... set other environment variables
git push heroku main
```

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging in development and production
- **Error Handling**: Centralized error handling middleware
- **Health Check**: `/health` endpoint for monitoring service status
- **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT signals

## 🔧 Development

### Project Structure

```
backend/
├── models/          # MongoDB/Mongoose schemas
├── routes/          # Express route handlers
├── middleware/      # Custom middleware functions
├── utils/           # Utility functions
├── config/          # Configuration files
├── uploads/         # File upload directory (if local storage)
├── package.json     # Dependencies and scripts
├── server.js        # Main application entry point
└── .env            # Environment variables
```

### Available Scripts

```bash
npm start           # Start production server
npm run dev         # Start development server with nodemon
npm test            # Run tests (when implemented)
npm run lint        # Run ESLint (if configured)
```

### Development Guidelines

1. Use meaningful commit messages
2. Implement proper error handling for all routes
3. Add input validation for all user inputs
4. Follow RESTful API conventions
5. Write comments for complex business logic
6. Test API endpoints before deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@globalskillsbridge.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - Multi-role authentication system
  - Job management and application tracking
  - Mentorship system
  - Skills verification
  - Messaging and notifications
  - Admin and RTB administration panels
  - Comprehensive analytics

---

**Note**: This backend is designed to work seamlessly with the Global Skills Bridge React frontend. Make sure both applications are properly configured and running for full functionality.
