#!/usr/bin/env node
/**
 * Utility script to create or update a user in the database.
 * Usage:
 *   node scripts/create_or_update_user.js --email=foo@example.com --password=Secret123 --name="Foo Bar" --role=job-seeker
 *
 * Security: run locally only. Do NOT commit credentials to source control.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    const m = arg.match(/^--([a-zA-Z0-9_-]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  });
  return args;
}

async function main() {
  const args = parseArgs();
  const email = args.email;
  const password = args.password;
  const name = args.name || 'Auto Created User';
  const role = args.role || 'job-seeker';

  if (!email || !password) {
    console.error('Usage: --email=EMAIL --password=PASSWORD [--name="Full Name"] [--role=job-seeker|employer|mentor]');
    process.exit(1);
  }

  // Basic email validation
  const emailRe = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!emailRe.test(email)) {
    console.error('Invalid email format');
    process.exit(1);
  }

  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    let user = await User.findOne({ email }).select('+password');
    if (user) {
      console.log('User exists — updating password and fields');
      user.password = password;
      user.name = name;
      user.role = role;
      user.isEmailVerified = true;
      await user.save();
      console.log('Updated user:', user.email);
    } else {
      console.log('Creating new user');
      user = await User.create({ name, email, password, role, isEmailVerified: true });
      console.log('Created user:', user.email);
    }

    console.log('Done. You can now login with this email and password.');
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
