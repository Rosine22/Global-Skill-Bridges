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

// Create RTB admin user
const createRTBAdminUser = async () => {
  try {
    await connectDB();

    // Allow configuration via environment variables or interactive prompt
    const defaultEmail = process.env.RTB_EMAIL || '';
    const defaultPassword = process.env.RTB_PASSWORD || '';
    const defaultName = process.env.RTB_NAME || 'RTB Administrator';

    // Helper to prompt for input if env vars not provided
    const getInput = (promptText, mask = false) => {
      return new Promise((resolve) => {
        if (process.stdin.isTTY) {
          const rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          if (mask) {
            // Simple masked input (doesn't hide on Windows cmd perfectly but acceptable for scripts)
            const stdin = process.openStdin();
            process.stdout.write(promptText);
            let value = '';
            const onData = function (char) {
              char = char + '';
              switch (char) {
                case '\n':
                case '\r':
                case '\u0004':
                  stdin.removeListener('data', onData);
                  process.stdout.write('\n');
                  rl.close();
                  resolve(value);
                  break;
                case '\u0003':
                  // Ctrl+C
                  process.exit(1);
                  break;
                default:
                  process.stdout.write('*');
                  value += char;
                  break;
              }
            };
            stdin.on('data', onData);
          } else {
            rl.question(promptText, (answer) => {
              rl.close();
              resolve(answer);
            });
          }
        } else {
          // Non-interactive: return empty so env vars can be used
          resolve('');
        }
      });
    };

    // Determine email, name, password
    const email = defaultEmail || (await getInput('RTB admin email: '));
    const name = defaultName || (await getInput('RTB admin name: '));
    let password = defaultPassword;
    if (!password) {
      password = await getInput('RTB admin password: ', true);
      if (!password || password.length < 6) {
        console.error('\n✗ Password is required and must be at least 6 characters');
        process.exit(1);
      }
    }

    if (!email) {
      console.error('\n✗ Email is required to create RTB admin');
      process.exit(1);
    }

    // Check if RTB admin already exists for this email
    const existingRTBAdmin = await User.findOne({ email });
    if (existingRTBAdmin) {
      console.log('\n✓ RTB Admin user already exists!');
      console.log('  Email:', existingRTBAdmin.email);
      console.log('  Name:', existingRTBAdmin.name);
      console.log('  Role:', existingRTBAdmin.role);
      console.log('\n✓ You can now login with the provided credentials (or reset password if needed).\n');
      process.exit(0);
    }

    // Create new RTB admin user with hashed password
    const hashedPassword = await bcrypt.hash(password.toString().trim(), 10);

    const rtbAdminUser = await User.create({
      name: name || 'RTB Administrator',
      email,
      password: hashedPassword,
      role: 'rtb-admin',
      isEmailVerified: true,
      isActive: true,
      isBlocked: false,
      isApproved: true,
      profileCompletion: 100,
      location: {
        city: process.env.RTB_CITY || 'Kigali',
        country: process.env.RTB_COUNTRY || 'Rwanda',
      },
      rtbInfo: {
        department: process.env.RTB_DEPARTMENT || 'Refugee Talent Bridge',
        position: process.env.RTB_POSITION || 'System Administrator',
        permissions: ['dashboard', 'analytics', 'reports', 'graduates', 'skills-gap'],
      },
    });

    console.log('\n✓ RTB Admin user created successfully!');
    console.log('\n Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password: (the one you provided)');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n🎯 Access RTB Dashboard at: /dashboard (after login)\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating RTB admin user:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

createRTBAdminUser();