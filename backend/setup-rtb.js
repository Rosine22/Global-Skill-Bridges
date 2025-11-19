const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/Global-skills';
    await mongoose.connect(mongoURI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Setup RTB system
const setupRTB = async () => {
  try {
    await connectDB();

    console.log('\n🚀 Setting up RTB (Refugee Talent Bridge) System...\n');

    // Create RTB Admin users
    const rtbAdmins = [
      {
        name: 'RTB Administrator',
        email: 'rtb@gsb.com',
        password: 'RTB@GSB2024',
        department: 'Refugee Talent Bridge',
        position: 'System Administrator'
      },
      {
        name: 'RTB Manager',
        email: 'rtb.manager@gsb.com',
        password: 'RTBManager@2024',
        department: 'Refugee Talent Bridge',
        position: 'Program Manager'
      }
    ];

    for (const adminData of rtbAdmins) {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: adminData.email });
      
      if (existingAdmin) {
        console.log(`✓ RTB Admin already exists: ${adminData.email}`);
        continue;
      }

      // Create new RTB admin user
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      const rtbAdminUser = await User.create({
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: 'rtb-admin',
        isEmailVerified: true,
        isActive: true,
        isBlocked: false,
        isApproved: true,
        profileCompletion: 100,
        location: {
          city: 'Kigali',
          country: 'Rwanda'
        },
        rtbInfo: {
          department: adminData.department,
          position: adminData.position,
          permissions: ['dashboard', 'analytics', 'reports', 'graduates', 'skills-gap', 'programs']
        }
      });

      console.log(`✅ Created RTB Admin: ${adminData.name} (${adminData.email})`);
    }

    // Create some sample RTB graduates for testing
    const sampleGraduates = [
      {
        name: 'John Mukamana',
        email: 'john.mukamana@example.com',
        password: 'Graduate@2024',
        role: 'job-seeker',
        rtbInfo: {
          graduationYear: 2023,
          program: 'Software Development',
          institution: 'IPRC Kigali',
          studentId: 'RTB2023001',
          currentEmploymentStatus: 'employed',
          currentPosition: 'Junior Developer',
          currentCompany: 'TechCorp Rwanda'
        }
      },
      {
        name: 'Marie Uwimana',
        email: 'marie.uwimana@example.com',
        password: 'Graduate@2024',
        role: 'job-seeker',
        rtbInfo: {
          graduationYear: 2023,
          program: 'Electrical Engineering',
          institution: 'IPRC Tumba',
          studentId: 'RTB2023002',
          currentEmploymentStatus: 'seeking',
          skillsGaps: ['Cloud Computing', 'Advanced Electronics'],
          careerGoals: ['Power Systems Engineer', 'Renewable Energy Specialist']
        }
      }
    ];

    console.log('\n📚 Creating sample RTB graduates...');
    
    for (const graduateData of sampleGraduates) {
      const existingGraduate = await User.findOne({ email: graduateData.email });
      
      if (existingGraduate) {
        console.log(`✓ Sample graduate already exists: ${graduateData.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(graduateData.password, 10);
      
      await User.create({
        ...graduateData,
        password: hashedPassword,
        isEmailVerified: true,
        isActive: true,
        isApproved: true,
        profileCompletion: 75,
        location: {
          city: 'Kigali',
          country: 'Rwanda'
        }
      });

      console.log(`✅ Created sample graduate: ${graduateData.name}`);
    }

    console.log('\n🎉 RTB System Setup Complete!');
    console.log('\n📋 RTB Admin Login Credentials:');
    console.log('   Primary Admin:');
    console.log('     Email: rtb@gsb.com');
    console.log('     Password: RTB@GSB2024');
    console.log('   Manager:');
    console.log('     Email: rtb.manager@gsb.com');
    console.log('     Password: RTBManager@2024');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend: npm run dev');
    console.log('   3. Login with RTB admin credentials');
    console.log('   4. Access RTB Dashboard at /dashboard');
    console.log('\n⚠️  IMPORTANT: Change default passwords after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error setting up RTB system:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

setupRTB();