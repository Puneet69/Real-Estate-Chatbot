#!/bin/bash

echo "🚀 Real Estate Chatbot - Quick Deployment Checklist"
echo "=================================================="
echo ""

echo "✅ Code Status:"
echo "   - Repository: https://github.com/Puneet69/Real-Estate-Chatbot"
echo "   - Branch: copilot/vscode1761979067359"
echo "   - Last commit: Enhanced with Ryna AI and property modals"
echo ""

echo "📋 Next Steps:"
echo ""
echo "1. 🚂 Deploy Backend (Railway):"
echo "   - Go to: https://railway.app"
echo "   - Login with GitHub"
echo "   - Deploy from folder: 'backend'"
echo "   - Set MONGODB_URI environment variable"
echo ""

echo "2. 🤖 Deploy AI Server (Railway):"
echo "   - Create new Railway project"
echo "   - Deploy from folder: 'backend/ai_server'"
echo "   - Optional: Set HF_TOKEN for better AI"
echo ""

echo "3. 🌐 Deploy Frontend (Vercel):"
echo "   - Go to: https://vercel.com"
echo "   - Login with GitHub"
echo "   - Deploy from folder: 'frontend/real-estate-chatbot'"
echo "   - Set VITE_BACKEND_URL to your Railway backend URL"
echo ""

echo "4. 🗄️ Configure MongoDB Atlas:"
echo "   - Add 0.0.0.0/0 to Network Access"
echo "   - Connection string already in code"
echo ""

echo "🎯 Key URLs to bookmark:"
echo "   - Railway: https://railway.app"
echo "   - Vercel: https://vercel.com"
echo "   - MongoDB Atlas: https://cloud.mongodb.com"
echo ""

echo "📖 Complete guide available in: HOSTING-GUIDE.md"
echo ""
echo "🎉 Your app will be live worldwide in ~10 minutes!"
echo ""

# Test if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   Run: git add . && git commit -m 'Deploy updates' && git push"
else
    echo "✅ Git status: Clean (ready for deployment)"
fi

echo ""
echo "📞 Test checklist after deployment:"
echo "   - Property listings load ✓"
echo "   - Ryna responds to 'Hello' ✓"
echo "   - Property modals open ✓"
echo "   - Phone buttons work (7982323147) ✓"
echo "   - Favorites system works ✓"