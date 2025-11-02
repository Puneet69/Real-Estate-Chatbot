# 🚨 Deployment Error Troubleshooting Guide

## Common Railway Deployment Errors & Solutions

### ❌ Error 1: "Module not found" or "Cannot find module"
**Symptoms:** Build fails with missing module errors
**Solution:**
```bash
# Check if package.json has all dependencies
# Add missing dependencies to backend/package.json
```

**Fix:** Ensure all dependencies are in `backend/package.json`:
```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "mongoose": "^8.19.2"
  }
}
```

### ❌ Error 2: "Port already in use" or "EADDRINUSE" or "Service Unavailable"
**Symptoms:** App crashes on startup or Railway shows "Service Unavailable"
**Solution:** ✅ FIXED - Server now binds to 0.0.0.0 for Railway

**Current Configuration (Fixed):**
```javascript
const PORT = process.env.PORT || 5008;
const HOST = process.env.HOST || '0.0.0.0'; // Railway needs 0.0.0.0 binding
app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
});
```

### ❌ Error 3: "MongoDB connection failed"
**Symptoms:** Database connection errors
**Solution:** Check environment variables in Railway

**Required Environment Variables in Railway:**
```
MONGODB_URI=mongodb+srv://puneetchaudhary1234:%40Puneet123@cluster0.8f5vo.mongodb.net/realestate?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
```

### ❌ Error 4: "Python/AI Server not starting"
**Symptoms:** AI endpoints return 500 errors
**Solution:** Deploy AI server as separate Railway project

**AI Server Environment Variables:**
```
PORT=8000
HF_TOKEN=optional_hugging_face_token
```

### ❌ Error 5: "Build command failed" or "vite: not found"
**Symptoms:** Railway can't build the app
**Solution:** Deploy services separately (don't use Dockerfile)

**Correct Railway Setup:**
- **Backend**: Root Directory = `backend`, Start Command = `node server.js`
- **AI Server**: Root Directory = `backend/ai_server`, Start Command = `python main.py`
- **Frontend**: Deploy to Vercel, not Railway

### ❌ Error 6: "Cannot GET /" or 404 errors
**Symptoms:** Railway URL returns 404
**Solution:** Backend is API-only, frontend deploys to Vercel

**Expected Endpoints:**
- `https://your-backend.railway.app/api/properties` ✅
- `https://your-backend.railway.app/api/favorites` ✅
- `https://your-backend.railway.app/` ❌ (No homepage)

## 🔧 Quick Fixes Applied

### ✅ Fix 1: Server Binding (COMPLETED)
Updated `backend/server.js` to bind to `0.0.0.0` for Railway compatibility

### ✅ Fix 2: AI Server Configuration (COMPLETED)
AI server already configured with proper host binding in `main.py`

### ✅ Fix 3: Railway Config Files (COMPLETED)
Added `railway.json` files for automated deployment

## 🚀 Step-by-Step Deployment Fix

### 1. Backend Deployment (Railway)
```
Repository: Puneet69/Real-Estate-Chatbot
Branch: copilot/vscode1761979067359
Root Directory: backend
Environment Variables:
  MONGODB_URI=mongodb+srv://puneetchaudhary1234:%40Puneet123@cluster0.8f5vo.mongodb.net/realestate?retryWrites=true&w=majority&appName=Cluster0
  NODE_ENV=production
```

### 2. AI Server Deployment (Railway - Separate Project)
```
Repository: Puneet69/Real-Estate-Chatbot
Branch: copilot/vscode1761979067359
Root Directory: backend/ai_server
Environment Variables:
  PORT=8000
```

### 3. Frontend Deployment (Vercel)
```
Repository: Puneet69/Real-Estate-Chatbot
Branch: copilot/vscode1761979067359
Root Directory: frontend/real-estate-chatbot
Environment Variables:
  VITE_BACKEND_URL=https://your-backend-name.railway.app
```

## 🎯 Common Error Messages & Solutions

### "Error: listen EADDRINUSE: address already in use"
✅ **FIXED** - Server now binds to 0.0.0.0

### "MongooseError: Connection failed"
🔧 **CHECK** - Verify MONGODB_URI in Railway Variables

### "ModuleNotFound: fastapi"
🔧 **CHECK** - Ensure AI server deployed to separate Railway project

### "Cannot find module 'vite'"
🔧 **SOLUTION** - Deploy frontend to Vercel, not Railway

### "Service Unavailable (503)"
🔧 **CHECK** - Ensure Railway has correct root directory and start command

## 📞 Get Help

If you're still getting errors, share:
1. **Exact error message** from Railway build logs
2. **Which service** (backend/AI server/frontend)
3. **Railway configuration** (root directory, environment variables)

I'll help you fix it immediately! 🚀