# 🚂 Railway Configuration Files

## Overview
Railway config files (`railway.json`) allow you to define build and deployment settings directly in your code.

## 📁 Backend Service (Node.js)

**File Location**: `backend/railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install --production"
  },
  "deploy": {
    "startCommand": "node server.js",
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Environment Variables Needed:**
```
MONGODB_URI=mongodb+srv://puneetchaudhary1234:%40Puneet123@cluster0.8f5vo.mongodb.net/realestate?retryWrites=true&w=majority&appName=Cluster0
PORT=5008
NODE_ENV=production
```

## 🤖 AI Server Service (Python)

**File Location**: `backend/ai_server/railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "python main.py",
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Environment Variables Needed:**
```
PORT=8000
HF_TOKEN=optional_huggingface_token
```

## 🚀 Deployment Steps

### 1. Backend Deployment
1. **New Railway Project**
2. **Connect GitHub**: `Puneet69/Real-Estate-Chatbot`
3. **Root Directory**: `backend`
4. **Railway will auto-detect**: `backend/railway.json`
5. **Add Environment Variables** (see above)
6. **Deploy**

### 2. AI Server Deployment  
1. **New Railway Project**
2. **Connect GitHub**: `Puneet69/Real-Estate-Chatbot`
3. **Root Directory**: `backend/ai_server`
4. **Railway will auto-detect**: `backend/ai_server/railway.json`
5. **Add Environment Variables** (see above)
6. **Deploy**

## ✅ Benefits of Config Files

- ✅ **Automatic Detection**: Railway reads config automatically
- ✅ **Version Control**: Build settings stored in git
- ✅ **Consistent Deployments**: Same settings every time
- ✅ **Team Collaboration**: Everyone uses same config
- ✅ **Easy Rollbacks**: Config changes are versioned

## 🔧 Configuration Options

### Build Options:
- `builder`: "NIXPACKS" (recommended) or "DOCKERFILE"
- `buildCommand`: Custom build command
- `watchPatterns`: Files to watch for changes

### Deploy Options:
- `startCommand`: Command to start your app
- `numReplicas`: Number of instances (1 for free tier)
- `sleepApplication`: Auto-sleep when inactive
- `restartPolicyType`: "ON_FAILURE", "ALWAYS", or "NEVER"

## 🎯 Railway Will Now:

1. **Read your `railway.json`**
2. **Use the specified build/start commands**
3. **Deploy with the exact settings you defined**
4. **No manual configuration needed!**

Your deployments will be consistent and automated! 🎉