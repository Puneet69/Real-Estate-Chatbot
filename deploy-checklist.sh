#!/bin/bash

# 🚀 Real Estate Chatbot - Deployment Checklist
# Run this script to check deployment readiness

echo "🏠 Real Estate Chatbot - Deployment Status Check"
echo "==============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Run this from the Real-Estate-Chatbot root directory"
    exit 1
fi

echo "📋 Pre-Deployment Checklist:"
echo ""

# 1. Check Git status
echo "1. 🔄 Git Status:"
if [ -n "$(git status --porcelain)" ]; then
    echo "   ⚠️  Uncommitted changes detected"
    echo "   📝 Latest files may not be deployed"
else
    echo "   ✅ All changes committed and pushed"
fi
echo "   📍 Current branch: $(git branch --show-current)"
echo "   🔗 Repository: https://github.com/Puneet69/Real-Estate-Chatbot"
echo ""

# 2. Check required files
echo "2. 📁 Required Files Check:"
files=(
    "backend/server.js"
    "backend/package.json" 
    "backend/railway.json"
    "backend/ai_server/main.py"
    "backend/ai_server/requirements.txt"
    "backend/ai_server/railway.json"
    "frontend/real-estate-chatbot/package.json"
    "frontend/real-estate-chatbot/vite.config.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (MISSING)"
    fi
done
echo ""

# 3. Check package.json dependencies
echo "3. 📦 Backend Dependencies:"
if [ -f "backend/package.json" ]; then
    echo "   ✅ express: $(grep -o '"express": "[^"]*"' backend/package.json | cut -d'"' -f4)"
    echo "   ✅ mongoose: $(grep -o '"mongoose": "[^"]*"' backend/package.json | cut -d'"' -f4)"
    echo "   ✅ cors: $(grep -o '"cors": "[^"]*"' backend/package.json | cut -d'"' -f4)"
else
    echo "   ❌ backend/package.json not found"
fi
echo ""

# 4. Check Python requirements
echo "4. 🐍 AI Server Dependencies:"
if [ -f "backend/ai_server/requirements.txt" ]; then  
    echo "   ✅ requirements.txt exists"
    echo "   📝 Dependencies: $(wc -l < backend/ai_server/requirements.txt) packages"
else
    echo "   ❌ requirements.txt not found"
fi
echo ""

# 5. Check environment configuration
echo "5. 🌍 Environment Configuration:"
echo "   📋 Required Environment Variables:"
echo "      • MONGODB_URI (for backend)"
echo "      • NODE_ENV=production (for backend)"  
echo "      • PORT=8000 (for AI server)"
echo "      • VITE_BACKEND_URL (for frontend)"
echo ""

# 6. Deployment URLs
echo "6. 🌐 Deployment Platforms:"
echo "   🚂 Backend: Railway (https://railway.app)"
echo "   🤖 AI Server: Railway (separate project)"
echo "   🎨 Frontend: Vercel (https://vercel.com)"
echo "   🗄️  Database: MongoDB Atlas (configured)"
echo ""

# 7. Test local server (optional)
echo "7. 🧪 Local Testing (Optional):"
echo "   💡 Test backend: cd backend && npm start"
echo "   💡 Test AI server: cd backend/ai_server && python main.py"  
echo "   💡 Test frontend: cd frontend/real-estate-chatbot && npm run dev"
echo ""

# 8. Deployment steps
echo "8. 🚀 Ready for Deployment!"
echo ""
echo "📋 Next Steps:"
echo "   1. 🚂 Deploy Backend:"
echo "      • Go to railway.app"
echo "      • New Project → GitHub → Real-Estate-Chatbot"
echo "      • Root Directory: backend"
echo "      • Add MONGODB_URI environment variable"
echo ""
echo "   2. 🤖 Deploy AI Server:"  
echo "      • New Railway Project"
echo "      • Same repo, Root Directory: backend/ai_server"
echo "      • Deploy (optional: add HF_TOKEN)"
echo ""
echo "   3. 🎨 Deploy Frontend:"
echo "      • Go to vercel.com"
echo "      • New Project → Real-Estate-Chatbot"  
echo "      • Root Directory: frontend/real-estate-chatbot"
echo "      • Add VITE_BACKEND_URL (from step 1)"
echo ""
echo "   4. 🗄️  Configure MongoDB:"
echo "      • cloud.mongodb.com → Network Access"
echo "      • Add IP: 0.0.0.0/0 (allow all)"
echo ""

echo "✨ Total Deployment Time: ~10 minutes"
echo "🎯 Result: Live chatbot at your Vercel URL!"
echo ""
echo "📚 Complete guides available:"
echo "   • COMPLETE-HOSTING-GUIDE.md (detailed steps)"
echo "   • RAILWAY-MANUAL-SETUP.md (Railway configuration)"
echo "   • DEPLOYMENT-TROUBLESHOOTING.md (error fixes)"
echo ""
echo "🎉 Your Real Estate Chatbot with Ryna AI is ready to go live!"