# 🚂 RAILWAY DEPLOYMENT INSTRUCTIONS

## ⚠️ CRITICAL: Railway Settings Must Be Configured Manually

Railway is trying to use Docker, but we need Node.js deployment. Follow these steps:

## 1. 🔧 Railway Dashboard Settings

### Go to your Railway project settings and configure:

**Build Settings:**
- ✅ **Builder**: NIXPACKS (NOT Docker)
- ✅ **Root Directory**: `backend`
- ❌ **DO NOT use Dockerfile**

**Deploy Settings:**
- ✅ **Start Command**: `node server.js`

## 2. 🌍 Environment Variables

Add these in Railway Variables tab:
```
MONGODB_URI=mongodb+srv://puneetchaudhary1234:%40Puneet123@cluster0.8f5vo.mongodb.net/realestate?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
```

## 3. 🚫 Force Disable Docker

I've renamed `Dockerfile` to `Dockerfile.backup` to prevent Railway from using it.

## 4. ✅ Expected Result

After configuring:
- ✅ Railway detects Node.js project in `backend/` folder
- ✅ Runs `npm install` automatically  
- ✅ Starts with `node server.js`
- ✅ No Docker build process
- ✅ No frontend build errors

## 5. 🎯 Manual Railway Configuration Steps

1. **Go to Railway Dashboard**
2. **Click on your Real-Estate-Chatbot project**
3. **Go to Settings tab**
4. **In Source section:**
   - Set **Root Directory**: `backend`
5. **In Build section:**
   - Ensure **Builder**: NIXPACKS (not Dockerfile)
6. **In Deploy section:**
   - Set **Start Command**: `node server.js`
7. **Go to Variables tab**
8. **Add environment variables** (see above)
9. **Go to Deployments tab**
10. **Click "Deploy Now"**

## 6. 🔍 Verify Deployment

After deployment succeeds, test these URLs:
- `https://your-app.railway.app/api/properties` ✅
- `https://your-app.railway.app/api/favorites` ✅

## 🚨 If Still Getting Docker Errors

The Railway dashboard might be cached. Try:
1. **Delete the service** in Railway
2. **Create a new service**  
3. **Connect to GitHub repo**
4. **Set Root Directory**: `backend`
5. **Railway will auto-detect Node.js**

This will force Railway to ignore any Docker configuration! 🎯