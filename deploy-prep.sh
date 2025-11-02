#!/bin/bash

echo "🚀 Real Estate Chatbot - Deployment Preparation"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git remote add origin https://github.com/Puneet69/Real-Estate-Chatbot.git
fi

# Create production build
echo "📦 Creating production build..."
cd frontend/real-estate-chatbot
npm run build
cd ../..

# Check for environment files
echo "🔧 Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Please create backend/.env with your MongoDB Atlas connection string"
fi

if [ ! -f "backend/ai_server/.env" ]; then
    echo "⚠️  Please create backend/ai_server/.env with your Hugging Face token (optional)"
fi

if [ ! -f "frontend/real-estate-chatbot/.env" ]; then
    echo "⚠️  Please create frontend/real-estate-chatbot/.env with your backend URL"
fi

# Commit changes
echo "💾 Committing changes..."
git add .
git commit -m "Prepare for deployment - $(date)"

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy backend to Railway: https://railway.app"
echo "3. Deploy AI server to Railway: https://railway.app"  
echo "4. Deploy frontend to Vercel: https://vercel.com"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"