# 🌍 Global Skills Bridge

**Global Skills Bridge** is a modern web platform that connects skilled professionals, job seekers, and mentors across the globe. The platform enables users to showcase their skills, find job opportunities, and engage in mentorship programs designed to promote global career growth and collaboration.

🔗 **Live Demo:** [https://global-skills-br.netlify.app/](https://global-skills-br.netlify.app/)  
📁 **GitHub Repository:** [https://github.com/Rosine22/Global-Skill-Bridges]  
🚀 **Deployment Plan:** [Netlify Deployment Plan — https://global-skills-br.netlify.app/]

---

## 📘 Project Overview

**Global Skills Bridge** bridges the gap between **employers, job seekers, and mentors** through a unified ecosystem that supports recruitment, career development, and skill exchange. It provides real-time job listings, mentorship scheduling, and direct messaging between users.

### 👥 User Roles

1. **Job Seeker**
   - Create and update a professional profile.
   - Search and apply for job opportunities.
   - Request mentorship sessions.
   - Receive notifications about application status and messages.

2. **Employer**
   - Post and manage job listings.
   - Review and shortlist candidates.
   - Send direct messages to applicants.
   - Schedule mentorship or informational sessions.

3. **Mentor**
   - Offer one-on-one mentorship sessions.
   - Manage mentee bookings and availability.
   - Exchange messages with mentees.
   - Track mentorship outcomes.

4. **Admin**
   - Manage user accounts and content moderation.
   - Oversee job postings and mentorship activities.
   - Handle reports and platform-level analytics.

### ✨ Key Features

- 🧭 **User Authentication & Profiles** — secure login and customizable skill-based profiles.  
- 💼 **Job Matching System** — intelligent matching between job seekers and posted jobs.  
- 🧑‍🏫 **Mentorship Portal** — mentorship scheduling and feedback tracking.  
- 💬 **Messaging System** — direct chat between users.  
- 🔔 **Notifications** — real-time updates for job applications, messages, and session reminders.  
- 🧾 **Application Management** — employers can review, accept, or reject candidates.  
- 🌐 **Responsive UI** — optimized for both desktop and mobile users.  

---

## 🛠️ Technology Stack

### Frontend
| Category | Technology |
|-----------|-------------|
| **Framework** | React 18 with Vite |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | React Context API |
| **Routing** | React Router DOM |
| **Icons** | Lucide React |
| **Linting & Formatting** | ESLint + Prettier |

### Backend
| Category | Technology |
|-----------|-------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB Atlas (Cloud) |
| **ODM** | Mongoose |
| **Authentication** | JWT (JSON Web Tokens) |
| **API Documentation** | Swagger/OpenAPI 3.0 |
| **Security** | Helmet, CORS, Rate Limiting |
| **Validation** | Express Validator |

### Development Tools
| Category | Technology |
|-----------|-------------|
| **Version Control** | Git & GitHub |
| **Package Manager** | npm |
| **Development Server** | Vite (Frontend), Nodemon (Backend) |
| **Environment Variables** | dotenv |

---

## ⚙️ Complete Setup Instructions

Follow these comprehensive steps to set up **Global Skills Bridge** locally.

### 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas Account** (for database) - [Sign up here](https://www.mongodb.com/atlas)

### 1. 🔽 Clone the Repository

```bash
git clone https://github.com/Rosine22/Global-Skill-Bridges.git
cd Global-Skills-Bridge-main
```

### 2. 🗄️ Database Setup (MongoDB Atlas)

1. **Create a MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new account or sign in
   - Create a new cluster (free tier is sufficient for development)

2. **Get your connection string:**
   - In your Atlas dashboard, click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it should look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`)

3. **Set up database user:**
   - Create a database user with read/write privileges
   - Note down the username and password

### 3. 🔧 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file with your actual values:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration - MongoDB Atlas
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/global-skills-bridge?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@globalskillsbridge.com
FROM_NAME=Global Skills Bridge

# Admin Configuration
ADMIN_EMAIL=admin@globalskillsbridge.com
RTB_ADMIN_EMAIL=rtb@rtb.gov.rw
```

**Start the backend server:**

```bash
# Development mode with auto-restart
npm run dev

# Or start normally
npm start
```

The backend server will run on `http://localhost:5000`

**🔍 API Documentation:**
Visit `http://localhost:5000/api/docs` for interactive Swagger API documentation.

### 4. 🎨 Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install frontend dependencies
npm install
```

**Start the frontend development server:**

```bash
# Start development server
npm run dev
```

The frontend application will run on `http://localhost:5173`

### 5. 🔗 Environment Variables (Frontend)

Create a `.env` file in the frontend directory if needed:

```env
# API Base URL
VITE_API_URL=http://localhost:5000/api
```

### 6. 🧪 Testing the Setup

1. **Backend Health Check:**
   - Visit `http://localhost:5000/api/health`
   - Should return: `{"success": true, "message": "Server is running!"}`

2. **Database Connection:**
   - Check your terminal for "MongoDB Atlas Connected Successfully!" message
   - Visit `http://localhost:5000/api/docs` to see the API documentation

3. **Frontend Application:**
   - Visit `http://localhost:3000`
   - You should see the Global Skills Bridge landing page
   - Try registering a new account to test the full flow

### 7. 🚀 Production Build

**Backend Production:**
```bash
cd backend
npm run build  # If you have a build script
npm start
```

**Frontend Production:**
```bash
cd frontend
npm run build
npm run preview  # To preview the production build locally
```

---

## 📱 Available User Roles & Features

### 🔐 Authentication Endpoints

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/me` - Get current user profile

### 👤 User Roles

1. **Job Seeker (`job-seeker`)**
   - Browse and apply for jobs
   - Manage applications and profile
   - Request mentorship sessions
   - Skills verification

2. **Employer (`employer`)**
   - Post and manage job listings
   - Review applications
   - Search for talent
   - Message candidates

3. **Mentor (`mentor`)**
   - Offer mentorship sessions
   - Manage mentees
   - Track session outcomes

4. **Admin (`admin`)**
   - User management
   - Content moderation
   - Platform analytics
   - Verification management

5. **RTB Admin (`rtb-admin`)**
   - Graduate tracking
   - Employment analytics
   - Skills gap analysis
   - Program effectiveness reports

---

## 🔧 Development Commands

### Backend Commands
```bash
npm start          # Start production server
npm run dev        # Start development server with auto-restart
npm run test       # Run tests (if configured)
```

### Frontend Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Port 5000 already in use:**
   ```bash
   # Change PORT in backend/.env file
   PORT=5001
   ```

2. **MongoDB connection issues:**
   - Verify your connection string in `.env`
   - Ensure your IP address is whitelisted in MongoDB Atlas
   - Check your username/password

3. **Frontend can't connect to backend:**
   - Verify backend is running on the correct port
   - Check CORS configuration in backend
   - Ensure `VITE_API_URL` is set correctly

4. **Dependencies issues:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 📚 API Documentation

Once your backend is running, visit:
- **Swagger UI:** `http://localhost:5000/api/docs`
- **Health Check:** `http://localhost:5000/api/health`

The API includes comprehensive endpoints for:
- 🔐 Authentication & User Management
- 💼 Job Posting & Applications
- 🎓 Mentorship System
- 💬 Messaging & Notifications
- 📊 Analytics & Reporting
- ⚙️ Admin Functions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

If you encounter any issues during setup or have questions:

1. Check the [Issues](https://github.com/Rosine22/Global-Skill-Bridges/issues) page
2. Create a new issue with detailed information about your problem
3. Include your operating system, Node.js version, and error messages

---

**Happy Coding! 🚀**

