# 🚀 Free Deployment Guide for Real Estate Chatbot

## Overview
This guide helps you deploy your Real Estate Chatbot for free using modern hosting platforms.

## 🎯 Deployment Strategy

### 1. **Frontend** → Vercel (Free)
### 2. **Backend** → Railway (Free 500 hours/month)  
### 3. **AI Server** → Railway (Free 500 hours/month)
### 4. **Database** → MongoDB Atlas (Free 512MB)

---

## 📋 Prerequisites

1. **GitHub Account** - Push your code to GitHub first
2. **MongoDB Atlas Account** - Already configured in your app
3. **Hugging Face Account** (Optional) - For better AI responses

---

## 🚀 Step-by-Step Deployment

### **Step 1: Push to GitHub**

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### **Step 2: Deploy Backend to Railway**

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `backend` folder as root directory
6. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: (Railway sets this automatically)
   - `NODE_ENV`: production

### **Step 3: Deploy AI Server to Railway**

1. Create another Railway project
2. Select your repository 
3. Choose the `backend/ai_server` folder as root directory
4. Set environment variables:
   - `HF_TOKEN`: Your Hugging Face token (optional)
   - `PORT`: (Railway sets this automatically)

### **Step 4: Deploy Frontend to Vercel**

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project" → Import your repository
4. Set build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend/real-estate-chatbot`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Set environment variables:
   - `VITE_BACKEND_URL`: Your Railway backend URL

### **Step 5: Update Configuration**

After deployment, update your frontend environment variable:
- In Vercel dashboard → Settings → Environment Variables
- Update `VITE_BACKEND_URL` with your Railway backend URL
- Redeploy the frontend

---

## 🌐 Alternative Free Hosting Options

### **Backend Alternatives:**
- **Render**: Great free tier, auto-sleeps after 15 minutes
- **Fly.io**: Good performance, 3 shared CPUs free
- **Cyclic**: Simple deployment, good for Node.js

### **Frontend Alternatives:**
- **Netlify**: Drag & drop deployment, great for static sites
- **GitHub Pages**: Simple, integrated with GitHub
- **Surge.sh**: Command-line deployment

### **Database:**
- **MongoDB Atlas**: 512MB free (recommended, already configured)
- **Supabase**: PostgreSQL alternative
- **PlanetScale**: MySQL alternative

---

## 🔧 Configuration Files Created

- `vercel.json` - Vercel deployment configuration
- `Procfile` - Process files for backend services
- Updated `main.py` - Dynamic port configuration for AI server

---

## 💡 Pro Tips

1. **Environment Variables**: Never commit secrets to GitHub
2. **MongoDB Atlas**: Whitelist `0.0.0.0/0` for Railway/Render
3. **Cold Starts**: Free tiers may have cold start delays
4. **Monitoring**: Check Railway/Vercel dashboards for logs
5. **Custom Domains**: All platforms support custom domains for free

---

## 🆘 Troubleshooting

### **Common Issues:**

1. **CORS Errors**: Update backend CORS configuration
2. **Build Failures**: Check Node.js version compatibility  
3. **Environment Variables**: Ensure all required vars are set
4. **MongoDB Connection**: Check Atlas network access settings

### **Useful Commands:**

```bash
# Test build locally
cd frontend/real-estate-chatbot && npm run build

# Check backend locally
cd backend && npm start

# Test AI server
cd backend/ai_server && python main.py
```

---

## ✅ Final Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas configured
- [ ] Backend deployed to Railway
- [ ] AI server deployed to Railway  
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Test all functionality

Your Real Estate Chatbot will be live and accessible worldwide! 🎉