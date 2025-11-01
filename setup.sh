#!/bin/bash

# Real Estate Chatbot - Quick Setup Script
# This script helps new users set up the project quickly

echo "🏠 Real Estate Chatbot - Quick Setup Script"
echo "=========================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "✅ Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js is installed: $(node --version)"

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi
echo "✅ npm is installed: $(npm --version)"

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python from https://python.org/"
    exit 1
fi
echo "✅ Python 3 is installed: $(python3 --version)"

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -f package.json ]; then
    echo "❌ backend/package.json not found!"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend/real-estate-chatbot
if [ ! -f package.json ]; then
    echo "❌ frontend/real-estate-chatbot/package.json not found!"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✅ Frontend dependencies installed"

# Install AI server dependencies
echo "Installing AI server dependencies..."
cd ../../backend/ai_server
if [ ! -f requirements.txt ]; then
    echo "❌ backend/ai_server/requirements.txt not found!"
    exit 1
fi
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install AI server dependencies"
    exit 1
fi
echo "✅ AI server dependencies installed"

cd ../..

echo ""
echo "🔧 Setting up environment files..."

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env not found. Please copy backend/.env.example to backend/.env and fill in your credentials."
else
    echo "✅ backend/.env exists"
fi

if [ ! -f backend/ai_server/.env ]; then
    echo "⚠️  backend/ai_server/.env not found. Please copy backend/ai_server/.env.example to backend/ai_server/.env and fill in your Hugging Face token."
else
    echo "✅ backend/ai_server/.env exists"
fi

if [ ! -f frontend/real-estate-chatbot/.env ]; then
    echo "⚠️  frontend/real-estate-chatbot/.env not found. Please copy frontend/real-estate-chatbot/.env.example to frontend/real-estate-chatbot/.env"
else
    echo "✅ frontend/real-estate-chatbot/.env exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your MongoDB Atlas cluster is set up and the connection string is in backend/.env"
echo "2. Get a Hugging Face token from https://huggingface.co/settings/tokens and add it to backend/ai_server/.env"
echo "3. Start the applications:"
echo ""
echo "   Terminal 1 - Backend Server:"
echo "   cd backend && node server.js"
echo ""
echo "   Terminal 2 - AI Server:"
echo "   cd backend/ai_server && python3 main.py"
echo ""
echo "   Terminal 3 - Frontend:"
echo "   cd frontend/real-estate-chatbot && npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "🆘 Need help? Check the README.md file or create an issue on GitHub"
echo ""