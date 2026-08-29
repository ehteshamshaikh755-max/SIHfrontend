// One-time script to create an admin account.
// Run with: node createAdmin.js
// Delete this file (or don't commit it) after you've created your admin.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@capacityconnect.com';
const ADMIN_PASSWORD = 'admin123'; // change this after first login if this were real production

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists:', ADMIN_EMAIL);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    role: 'admin',
    status: 'approved',
  });

  console.log('Admin created:');
  console.log('  email:', ADMIN_EMAIL);
  console.log('  password:', ADMIN_PASSWORD);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
