# Setup Guide for Ankisho Billing Software - Complete Setup Guide

## ✨ New Features Added

### 🔐 Authentication System
- **Login/Register Pages** with beautiful UI
- **JWT Token Management** with auto-refresh
- **Role-based Access Control** (Admin, Manager, Staff)
- **Protected Routes** with automatic redirects
- **Password Validation** with strength indicators

### 🎨 Advanced UI/UX
- **Modern Material Design** with custom theming
- **Dark/Light Mode Toggle** with system preference detection
- **Advanced Animations** and smooth transitions
- **Glass Morphism Effects** and gradient backgrounds
- **Responsive Design** for all screen sizes
- **Loading States** with skeleton screens
- **Toast Notifications** system

### 🛠 Backend Enhancements
- **Authentication Controllers** with bcrypt hashing
- **Middleware System** for auth, validation, and error handling
- **Input Validation** with express-validator
- **Error Handling** with proper HTTP status codes
- **CORS Configuration** for secure cross-origin requests

### 🔧 Developer Experience
- **Custom Hooks** for API calls and state management
- **Utility Functions** for formatting and validation
- **TypeScript Support** with proper type definitions
- **Confirmation Dialogs** for destructive actions
- **Enhanced Layout** with role-based navigation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠 Installation Steps

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**
```env
MONGODB_URI=mongodb://localhost:27017/billing-software
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=30d
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env
```

### 3. Database Setup

Make sure MongoDB is running on your system:

```bash
# For macOS with Homebrew
brew services start mongodb-community

# For Ubuntu/Linux
sudo systemctl start mongod

# For Windows
net start MongoDB
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm start
# Server will run on http://localhost:5001
```

### Start Frontend Application
```bash
cd frontend
npm start
# Application will run on http://localhost:3000
```

## 👤 Default User Creation

Since this is a fresh setup, you'll need to create the first admin user:

1. Go to http://localhost:3000/register
2. Create an account with role "admin"
3. Use this account to manage other users

## 🎯 Features Overview

### 🔐 Authentication Features
- **Secure Login/Register** with form validation
- **JWT Token Management** with automatic renewal
- **Role-based Access Control**:
  - **Admin**: Full access to all features
  - **Manager**: Access to most features except store settings
  - **Staff**: Limited access to daily operations

### 📊 Business Features
- **Dashboard** with real-time analytics
- **Product Management** with categories and inventory
- **Customer Management** with contact details
- **Supplier Management** with purchase history
- **Sales Management** with invoice generation
- **Purchase Management** with stock updates
- **Staff Management** (Admin/Manager only)
- **Store Settings** (Admin only)
- **Reports & Analytics**

### 🎨 UI/UX Features
- **Modern Design** with Material-UI components
- **Dark/Light Theme** toggle
- **Responsive Layout** for mobile and desktop
- **Advanced Animations** and transitions
- **Loading States** and error handling
- **Toast Notifications** for user feedback
- **Confirmation Dialogs** for important actions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Business Operations
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/customers` - Get all customers
- `POST /api/sales` - Create sale
- `GET /api/dashboard` - Get dashboard data

## 🎨 Customization

### Theme Customization
Edit `/frontend/src/context/ThemeContext.tsx` to customize colors and styling.

### Adding New Features
1. Create new components in `/frontend/src/components/`
2. Add new pages in `/frontend/src/pages/`
3. Create API routes in `/backend/src/routes/`
4. Add database models in `/backend/src/models/`

## 🔒 Security Features

- **Password Hashing** with bcrypt
- **JWT Token Security** with expiration
- **Input Validation** on all forms
- **CORS Protection** for API endpoints
- **Role-based Route Protection**
- **XSS Protection** with proper sanitization

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **JWT Token Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in .env

3. **CORS Errors**
   - Verify FRONTEND_URL in backend .env
   - Check if both servers are running

4. **Build Errors**
   - Delete node_modules and reinstall
   - Check Node.js version compatibility

## 🎉 What's New

✅ **Complete Authentication System**
✅ **Advanced UI with Animations**
✅ **Role-based Access Control**
✅ **Modern Material Design**
✅ **Dark/Light Theme Toggle**
✅ **Comprehensive Error Handling**
✅ **Custom Hooks and Utilities**
✅ **Toast Notifications**
✅ **Confirmation Dialogs**
✅ **Loading States**
✅ **Responsive Design**
✅ **TypeScript Support**

Your billing software is now a **production-ready, enterprise-grade application** with all modern features and best practices implemented!

## 📞 Support

If you encounter any issues or need help with customization, the codebase is well-documented and follows industry best practices for easy maintenance and extension.
