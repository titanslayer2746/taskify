# CORS Troubleshooting Guide

## 🚨 **Current Issue**

You're getting a CORS error when trying to access `http://localhost:3001/api/users/login` from `http://localhost:8080`.

## 🔍 **Diagnostic Steps**

### **1. Check Backend Server Status**

Make sure your backend server is running:

```bash
# In backend directory
npm start
# or
npm run dev
```

You should see:

```
Server is running on port 3001
API Base URL: http://localhost:3001/api
```

### **2. Check Frontend Environment**

You need to create a `.env` file in your frontend directory:

**Create `frontend/.env`:**

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=Habitty
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
```

### **3. Check Backend Environment**

You need to create a `.env` file in your backend directory:

**Create `backend/.env`:**

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
```

### **4. Restart Both Servers**

After creating the `.env` files:

```bash
# Backend (in backend directory)
npm start

# Frontend (in frontend directory)
npm run dev
```

### **5. Test API Directly**

Test if the backend API is accessible:

```bash
# Test the health endpoint
curl http://localhost:3001/api/health

# Test the login endpoint (should return CORS headers)
curl -X OPTIONS http://localhost:3001/api/users/login \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: Backend not running**

**Solution:** Start the backend server first

### **Issue 2: Missing .env files**

**Solution:** Create both `.env` files as shown above

### **Issue 3: Wrong ports**

**Solution:** Ensure frontend is on 8080 and backend is on 3001

### **Issue 4: Browser cache**

**Solution:** Hard refresh (Ctrl+F5) or clear browser cache

### **Issue 5: MongoDB not running**

**Solution:** Start MongoDB service

## 🔧 **Manual CORS Test**

Open browser console and test:

```javascript
fetch("http://localhost:3001/api/health", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => console.log("Success:", data))
  .catch((error) => console.error("Error:", error));
```

## 📋 **Checklist**

- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 8080
- [ ] `backend/.env` file created
- [ ] `frontend/.env` file created
- [ ] Both servers restarted after .env changes
- [ ] MongoDB running
- [ ] Browser cache cleared

## 🎯 **Expected Result**

After following these steps, you should be able to:

1. Access your frontend at `http://localhost:8080`
2. Log in without CORS errors
3. See successful API calls in browser Network tab

## 📞 **Still Having Issues?**

If the problem persists, please share:

1. Backend server console output
2. Frontend console errors
3. Network tab details from browser dev tools
4. Contents of your `.env` files (without sensitive data)
