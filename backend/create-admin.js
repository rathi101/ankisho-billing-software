const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import Staff model
const Staff = require('./src/models/Staff');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Staff.findOne({ email: 'admin@ankisho.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const adminUser = await Staff.create({
      name: 'System Administrator',
      email: 'admin@ankisho.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin',
      isActive: true,
      salary: 50000
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@ankisho.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
