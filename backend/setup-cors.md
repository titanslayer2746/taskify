# CORS Setup Guide

## 🚨 **CORS Error Fix**

You're encountering a CORS error because your frontend is running on `http://localhost:8080` but the backend CORS configuration doesn't include this port.

## ✅ **Solution Applied**

I've updated the CORS configuration to include port 8080. The changes include:

1. **Updated `backend/src/config/cors.ts`** - Added port 8080 to allowed origins
2. **Updated `backend/src/middleware/cors-error-handler.ts`** - Added port 8080 to error messages
3. **Added flexible localhost handling** - Now allows any localhost origin in development

## 🔧 **Manual Setup (Optional)**

If you want to create a `.env` file for more control, create `backend/.env` with:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/habittty

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN_DEV=http://localhost:5173,http://localhost:3000,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:3000,http://127.0.0.1:8080

# Production - specify your frontend domain
CORS_ORIGIN_PROD=https://your-frontend-domain.com

# Additional CORS settings
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With
```

## 🚀 **Next Steps**

1. **Restart your backend server** to apply the CORS changes
2. **Try logging in again** from your frontend
3. **Check the browser console** - the CORS error should be resolved

## 🔍 **Testing**

After restarting the backend:

1. Open your frontend at `http://localhost:8080`
2. Try to log in
3. Check the Network tab in browser dev tools
4. You should see successful API calls without CORS errors

## 📝 **What Changed**

### **CORS Configuration (`backend/src/config/cors.ts`)**

- Added `http://localhost:8080` to allowed origins
- Added flexible localhost handling for development
- Added logging for blocked origins

### **Error Handler (`backend/src/middleware/cors-error-handler.ts`)**

- Updated error messages to include port 8080
- Better error reporting for debugging

## 🎯 **Result**

Your frontend running on `http://localhost:8080` should now be able to successfully communicate with your backend API without CORS errors.
