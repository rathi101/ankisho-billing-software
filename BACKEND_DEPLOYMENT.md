# 🚀 Backend Deployment Guide - Ankisho Billing Software

## Overview
Your Ankisho Billing Software frontend is live at: https://ankisho-billing-software.netlify.app

Now let's deploy the backend to complete your application.

## 🎯 Quick Deployment Options

### Option 1: Railway (Recommended - Free & Easy)

1. **Sign up at Railway**: https://railway.app
2. **Connect GitHub**: Link your repository
3. **Deploy Backend**:
   ```bash
   # In your backend directory
   git add .
   git commit -m "Prepare backend for deployment"
   git push origin main
   ```
4. **Set Environment Variables** in Railway dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ankisho-billing
   JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
   JWT_EXPIRES_IN=30d
   NODE_ENV=production
   FRONTEND_URL=https://ankisho-billing-software.netlify.app
   PORT=5001
   ```

### Option 2: Render (Free Tier Available)

1. **Sign up at Render**: https://render.com
2. **Create Web Service**: Connect your GitHub repo
3. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js
4. **Add Environment Variables** (same as above)

### Option 3: Heroku (Requires Credit Card)

1. **Login to Heroku**:
   ```bash
   heroku login
   ```
2. **Create App**:
   ```bash
   heroku create ankisho-billing-backend
   ```
3. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_connection_string"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set FRONTEND_URL="https://ankisho-billing-software.netlify.app"
   ```
4. **Deploy**:
   ```bash
   git push heroku main
   ```

## 🗄️ Database Setup (MongoDB Atlas - Free)

1. **Create Account**: https://cloud.mongodb.com
2. **Create Cluster**: Choose free tier (M0)
3. **Create Database User**:
   - Username: `ankisho-admin`
   - Password: Generate strong password
4. **Whitelist IP**: Add `0.0.0.0/0` for all IPs (or specific IPs)
5. **Get Connection String**:
   ```
   mongodb+srv://ankisho-admin:<password>@cluster0.xxxxx.mongodb.net/ankisho-billing?retryWrites=true&w=majority
   ```

## 🔧 Environment Variables Required

Create these in your deployment platform:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ankisho-billing

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=30d

# Server Configuration
NODE_ENV=production
PORT=5001

# Frontend URL (for CORS)
FRONTEND_URL=https://ankisho-billing-software.netlify.app

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## 📝 Deployment Checklist

- [ ] MongoDB Atlas database created
- [ ] Database user created with read/write permissions
- [ ] IP whitelist configured
- [ ] Environment variables set in deployment platform
- [ ] Backend deployed and running
- [ ] Health check endpoint accessible: `your-backend-url/api/health`
- [ ] Frontend updated with backend URL

## 🔗 After Backend Deployment

Once your backend is deployed, you'll need to update the frontend to use the live backend URL:

1. **Update netlify.toml** (already configured):
   ```toml
   [context.production.environment]
   REACT_APP_API_URL = "https://your-backend-url.com/api"
   ```

2. **Redeploy Frontend**:
   ```bash
   cd frontend
   netlify deploy --prod
   ```

## 🧪 Testing Your Live Application

After deployment, test these endpoints:
- Health Check: `https://your-backend-url/api/health`
- Products: `https://your-backend-url/api/products`
- Dashboard: `https://your-backend-url/api/dashboard`

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure `FRONTEND_URL` matches your Netlify URL exactly
2. **Database Connection**: Check MongoDB URI and IP whitelist
3. **Environment Variables**: Verify all required variables are set
4. **Build Failures**: Check Node.js version compatibility (>=16.0.0)

### Logs:
- Railway: Check deployment logs in dashboard
- Render: View logs in service dashboard
- Heroku: `heroku logs --tail`

## 🎉 Success!

Once deployed, your complete Ankisho Billing Software will be live with:
- ✅ Frontend: https://ankisho-billing-software.netlify.app
- ✅ Backend: https://your-backend-url.com
- ✅ Database: MongoDB Atlas
- ✅ Full functionality: Products, Sales, Customers, Reports, etc.

---

**Need Help?** 
- Railway Support: https://railway.app/help
- Render Support: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/
