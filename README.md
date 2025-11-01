# Real Estate Chatbot 🏠

A modern, intelligent real estate chatbot application built with React, Node.js, and AI integration. The chatbot provides natural language property search, smart filtering, and personalized recommendations with a beautiful, responsive interface.

## 🌟 Features

- **Smart Property Search**: Natural language queries like "show me 2 BHK apartments in Miami under $500k"
- **Location-Specific Filtering**: Ask for properties in specific cities and get only those results
- **AI-Powered Responses**: Intelligent chatbot powered by Hugging Face models
- **Property Recommendations**: Smart suggestions based on user preferences
- **Favorites System**: Save and manage favorite properties
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Chat**: Interactive chat interface with typing indicators
- **Property Cards**: Visual property cards with images, prices, and details

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Modern CSS** with responsive design
- **Natural Language Processing** with compromise.js
- **Interactive Chat Interface** with real-time responses

### Backend
- **Node.js** with Express framework
- **MongoDB** with Mongoose ODM
- **RESTful APIs** for property and favorites management
- **CORS** enabled for cross-origin requests

### AI Integration
- **Python FastAPI** server for AI processing
- **Hugging Face Transformers** for natural language understanding
- **Custom AI responses** with context awareness

## 📁 Project Structure

```
Real-Estate-Chatbot/
├── frontend/
│   └── real-estate-chatbot/
│       ├── src/
│       │   ├── App.jsx              # Main application component
│       │   ├── ChatPanel.jsx        # Chat interface component
│       │   ├── App.css              # Styling and responsive design
│       │   └── main.jsx             # Application entry point
│       ├── public/                  # Static assets
│       ├── package.json             # Frontend dependencies
│       └── vite.config.js           # Vite configuration
├── backend/
│   ├── server.js                    # Express server
│   ├── models/
│   │   └── Favorite.js              # Mongoose favorite model
│   ├── data/
│   │   ├── JSON 1.txt               # Property data
│   │   ├── JSON 2.txt               # Additional properties
│   │   ├── JSON 3.txt               # More properties
│   │   └── ryna_training_data.json  # AI training data
│   ├── ai_server/
│   │   ├── ai.py                    # AI processing logic
│   │   ├── main.py                  # FastAPI server
│   │   └── requirements.txt         # Python dependencies
│   └── package.json                 # Backend dependencies
└── README.md                        # This file
```

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **npm** or **yarn** package manager
- **MongoDB** account (we'll use MongoDB Atlas) - [Sign up here](https://cloud.mongodb.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Puneet69/Real-Estate-Chatbot.git
cd Real-Estate-Chatbot
```

### Step 2: Set Up Environment Variables

Create environment files for storing credentials (these will NOT be pushed to GitHub):

**Backend Environment Setup:**
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your credentials:
```env
# MongoDB Connection (Required)
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/real_estate_db?retryWrites=true&w=majority

# Server Configuration
PORT=5008
NODE_ENV=development

# AI Server Configuration (Optional)
AI_SERVER_URL=http://localhost:8000
```

**AI Server Environment Setup:**
```bash
cd backend/ai_server
cp .env.example .env
```

Edit the AI server `.env` file:
```env
# Hugging Face Token (Required for AI features)
HF_TOKEN=your_hugging_face_token_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### Step 3: Set Up MongoDB Database

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free account
2. Create a new cluster (choose the free tier)
3. Create a database user with read/write permissions
4. Get your connection string and update the `MONGODB_URI` in your `.env` file
5. Whitelist your IP address in MongoDB Atlas Network Access

### Step 4: Install Dependencies

**Install Backend Dependencies:**
```bash
cd backend
npm install
```

**Install Frontend Dependencies:**
```bash
cd ../frontend/real-estate-chatbot
npm install
```

**Install AI Server Dependencies:**
```bash
cd ../../backend/ai_server
pip install -r requirements.txt
```

### Step 5: Start the Applications

You'll need to run three servers. Open three terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd backend
node server.js
```
✅ Backend should start on `http://localhost:5008`

**Terminal 2 - AI Server (Optional but recommended):**
```bash
cd backend/ai_server
python main.py
```
✅ AI server should start on `http://localhost:8000`

**Terminal 3 - Frontend Development Server:**
```bash
cd frontend/real-estate-chatbot
npm run dev
```
✅ Frontend should start on `http://localhost:5173`

### Step 6: Access the Application

1. Open your browser and go to `http://localhost:5173`
2. You should see the Real Estate Chatbot interface
3. Click the chat button to start interacting with the chatbot
4. Try these example queries:
   - "Show me properties in Miami"
   - "I want a 2 BHK apartment under $400k"
   - "What properties do you have in New York?"

This README explains how to run the app locally, the available APIs, and quick verification steps.

## 🎯 How to Use the Chatbot

### Basic Property Search
- **Location-based**: "Show me properties in Miami"
- **Budget-based**: "Properties under $500k"
- **Type-based**: "2 BHK apartments"
- **Combined**: "3 BHK villa in Austin under $800k"

### Advanced Features
- **Favorites**: Click the heart icon to save properties
- **Property Details**: Click "View property" to see full details
- **Guided Search**: Use the "Guided" button for step-by-step search
- **Natural Language**: Ask questions naturally like "What's the cheapest property you have?"

## 🔧 Configuration Options

### Backend Configuration

**Port Configuration:**
```javascript
// In server.js
const PORT = process.env.PORT || 5008;
```

**Database Configuration:**
```javascript
// MongoDB connection with fallback
const MONGODB_URI = process.env.MONGODB_URI || 'fallback_connection_string';
```

### Frontend Configuration

**API Base URL:**
```javascript
// In App.jsx
const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5008';
```

You can create a `.env` file in the frontend directory:
```env
VITE_BACKEND_URL=http://localhost:5008
```

## 🐛 Troubleshooting

### Common Issues and Solutions

**1. MongoDB Connection Error**
```
MongoDB connection error: MongooseServerSelectionError
```
**Solution:**
- Check your MongoDB Atlas connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify your database credentials

**2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5008
```
**Solution:**
```bash
# Find and kill the process using the port
lsof -ti:5008 | xargs kill -9
```

**3. AI Server Not Responding**
```
AI proxy error 500
```
**Solution:**
- Ensure Python dependencies are installed: `pip install -r requirements.txt`
- Check if the Hugging Face token is valid
- Restart the AI server: `python main.py`

**4. Frontend Build Errors**
```
Module not found errors
```
**Solution:**
```bash
cd frontend/real-estate-chatbot
rm -rf node_modules package-lock.json
npm install
```

**5. CORS Issues**
```
Access to fetch blocked by CORS policy
```
**Solution:**
- Ensure the backend CORS is configured properly
- Check that the frontend is making requests to the correct backend URL

### Development Tips

**Hot Reloading:**
- Frontend: Vite provides automatic hot reloading
- Backend: Use `nodemon` for auto-restart: `npm install -g nodemon && nodemon server.js`

**Debugging:**
- Enable detailed logging in the backend by setting `NODE_ENV=development`
- Use browser developer tools for frontend debugging
- Check network tab for API request/response details

## 📚 API Documentation

### Property Endpoints

**GET /api/properties**
- Returns all available properties
- Response: Array of property objects

**GET /api/training-data**
- Returns chatbot training data
- Response: Training data object

### Favorites Endpoints

**GET /api/favorites?user={email}**
- Get user's favorite properties
- Response: Array of favorite objects

**POST /api/favorites**
```json
{
  "user": "user@example.com",
  "propertyId": "1"
}
```

**DELETE /api/favorites**
```json
{
  "user": "user@example.com",
  "propertyId": "1"
}
```

### AI Endpoints

**POST /api/ai**
```json
{
  "prompt": "User's message",
  "max_tokens": 100
}
```

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique passwords for database connections
- Rotate API keys regularly

### Database Security
- Use MongoDB Atlas with IP whitelisting
- Create database users with minimal required permissions
- Enable MongoDB Atlas network security features

### API Security
- Implement rate limiting for production use
- Add input validation and sanitization
- Use HTTPS in production

## 🚀 Production Deployment

### Environment Setup
1. Create production environment variables
2. Set up production MongoDB cluster
3. Configure production API keys

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend/real-estate-chatbot
npm run build
# Deploy the dist/ folder
```

### Backend Deployment (Railway/Render/Heroku)
1. Set environment variables in your hosting platform
2. Ensure start script is configured: `"start": "node server.js"`
3. Configure port to use `process.env.PORT`

### AI Server Deployment
- Deploy to cloud platforms that support Python (Render, Railway)
- Set appropriate environment variables
- Ensure sufficient memory for AI model loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature-name'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information about your problem
4. Include your environment details (OS, Node.js version, etc.)

## 📧 Contact

For questions or support, please contact:
- GitHub: [@Puneet69](https://github.com/Puneet69)
- Project Repository: [Real-Estate-Chatbot](https://github.com/Puneet69/Real-Estate-Chatbot)

---

**Happy coding! 🎉**

---

## Original Features Overview
- React + Vite frontend (located in `frontend/real-estate-chatbot`)
- Node/Express backend (located in `backend`) serving property data and favorites endpoints
- Simple NLP extraction and fuzzy matching for location/price/bedrooms
- Conversational clarifications (quick reply suggestions) for ambiguous queries
- Chat results include clickable links that scroll & highlight property cards

*** Begin Patch

# Real-Estate-Chatbot

This repository is a demo Real Estate chatbot with a modern React + Vite frontend and a Node.js + Express backend. The app demonstrates:

- Natural-language property search (rule-based NLP + fuzzy matching)
- An in-browser lightweight AI-style responder (data-driven summaries and recommendations)
- Guided conversational flow to collect user preferences
- Clickable chat results that scroll & highlight property cards
- Favorites persistence via a simple backend (MongoDB + Mongoose)
- Responsive, polished UI for desktop and mobile

This README documents what's included, the tech stack, how to run the project locally, common troubleshooting, and next steps.

---

## Tech stack & libraries used

- Frontend: React (with Vite), CSS (App.css)
	- Key frontend files: `frontend/real-estate-chatbot/src/App.jsx`, `ChatPanel.jsx`, `App.css`
- Backend: Node.js + Express
	- Key backend files: `backend/server.js`, `backend/models/Favorite.js`, `backend/data/*` (property data files)
- Database: MongoDB (Atlas or local) via Mongoose
- NLP: `compromise` for lightweight entity extraction
- Search helpers: custom Levenshtein fuzzy matcher + rule-based extraction

Other tooling:
- ESLint (linting), Vite (dev server + build)

---

## Repo layout

```
.
├── backend/                          # Express API and data
│   ├── server.js                     # Main API server
│   ├── models/Favorite.js            # Mongoose schema for favorites
│   └── data/                         # Local property JSON files used for demo
├── frontend/                          
│   └── real-estate-chatbot/          # React + Vite frontend
│       ├── index.html
│       ├── src/
│       │   ├── App.jsx               # Main UI + chatbot orchestration
│       │   ├── ChatPanel.jsx         # Chat UI component
│       │   ├── App.css               # Styling and responsive rules
│       │   └── ...                   # other assets and components
├── package.json                       # workspace scripts (optional)
└── README.md
```

---

## Prerequisites

- Node.js (v16+ recommended)
- npm (or yarn)
- MongoDB (Atlas connection string or a local MongoDB instance)

You don't need any paid APIs — the AI-like responses and search run locally on your machine using the property data shipped with the repo.

---

## Quick start — backend

1. Install dependencies and configure the backend:

```bash
cd backend
npm install
# create a .env file (or set env var) with MONGODB_URI
# an example is provided: backend/.env.example
```

2. Start the backend (default port 5001):

```bash
# from repo root
cd backend
PORT=5001 node server.js
```

3. Verify the API:

```bash
curl http://localhost:5001/api/properties | head -n 2
curl "http://localhost:5001/api/favorites?user=demo%40email.com"
```

### Backend API summary

- GET /api/properties — returns the demo property list (merged from files in `backend/data`)
- GET /api/favorites?user=<email> — returns favorites for a user
- POST /api/favorites — save a favorite (JSON body { user, propertyId })
- DELETE /api/favorites — remove a favorite (JSON body { user, propertyId })

Notes:
- `Favorite.propertyId` is currently stored as a string in the demo schema. If you prefer numeric ids, migrate the DB accordingly.

---

## Quick start — frontend

1. Install dependencies and run the dev server:

```bash
cd frontend/real-estate-chatbot
npm install
npm run dev
```

2. Open the URL printed by Vite (commonly `http://localhost:5173`).

3. Try these interactions in the chat:

- Ask for recommendations: `Find me 2 BHK in Mumbai under 1 crore`
- Ask for price statistics: `What's the average price in Bangalore?`
- Guided flow: click the `Guided` button next to the chat toggle — the chatbot will ask a short sequence of questions and return recommended properties
- Quick clarifications: `Show 2 or 3 bhk in New York` — bot asks which one you prefer

Click `View property` on a chat result to scroll & highlight the property card in the listing.

---

## Developer scripts & linting

- Frontend linting (from `frontend/real-estate-chatbot`):

```bash
cd frontend/real-estate-chatbot
npm run lint
```

- Frontend dev server (Vite):

```bash
npm run dev
```

If port 5173 is in use, Vite will suggest and use the next available port (e.g., 5174).

---

## What changed / notable features in this branch

- Responsive UI: improved layout, responsive property grid, and polished property cards
- Redesigned chat panel: header, avatars, readable bubbles, suggestion buttons, result cards with thumbnails and CTA
- Lightweight local AI-style responder: data-driven summaries and recommendations (no external API required)
- Guided conversational flow: collects location, type, price, bedrooms and returns ranked results

---

## Challenges we faced and the approach we used

During development we hit several practical challenges. Below is a concise list of those challenges and the concrete approaches we used to address them:

- Data heterogeneity and numeric formats
	- Challenge: Property data contains prices in different formats and units (lakhs/crores, K/M, spelled-out numbers). Parsing numeric user input reliably is tricky.
	- Approach: Implemented robust numeric parsing helpers (supporting lakh/crore/K/M and common number-words) and normalized property prices for consistent comparisons and scoring.

- Ambiguous or incomplete user queries
	- Challenge: Users often ask vague questions ("2 or 3 bhk", "around 50 lakh") that lack clear filters.
	- Approach: Added a guided conversational flow and clarification prompts. We ask short follow-up questions when the intent or filters are ambiguous to collect the missing pieces before searching.

- Fuzzy/misspelled locations and entities
	- Challenge: Users mistype place names (e.g., "Banaglore") or use alternative names that don't match dataset strings exactly.
	- Approach: Implemented a Levenshtein-based fuzzy matcher and a small ruleset for common synonyms to map user terms to dataset locations. Scoring tolerates small typos and ranks close matches higher.

- No external paid LLMs (cost and privacy constraints)
	- Challenge: The user requested an AI-like experience without relying on paid APIs.
	- Approach: Built an in-browser, deterministic "AI-style" responder that composes data-driven summaries (price stats, short rationales and ranked recommendations) using the property dataset and extraction rules. This keeps the experience free, deterministic, and local to the user.

- Relevance ranking and simple scoring
	- Challenge: Multiple properties can match a query; ranking must surface the most relevant results.
	- Approach: Designed a lightweight scoring function combining exact matches, fuzzy matches, numeric distance (price/bedrooms), and recency/boost heuristics. The score is tunable and intentionally simple for explainability.

- UX & discoverability for chat-driven search
	- Challenge: Ensuring chat results are actionable and tie back to the property listing view.
	- Approach: Created rich chat-result cards with thumbnails and a `View property` CTA that scrolls and highlights the relevant property card. Also added quick-reply suggestions for common clarifications.

- Linting, environment configuration, and port conflicts
	- Challenge: Development environments differ (ports, local services), and accidental secrets may be introduced.
	- Approach: Use environment variables (`MONGODB_URI`) with `.env.example`. Chose port 5001 for the backend to reduce macOS port conflicts, and fixed ESLint warnings iteratively.

These approaches emphasize predictable behavior, low infrastructure cost, and good UX while leaving clear places to upgrade (semantic search, embeddings, or hosted LLM integration) when you need higher-quality NLU or larger-scale retrieval.


## Security & secrets

- Do NOT commit real secrets (MongoDB credentials, API keys) into the repository. The backend reads `MONGODB_URI` from the environment — use `backend/.env` locally and add it to your `.gitignore`.
- If you believe any secret was committed accidentally, rotate the secret immediately and remove it from git history.

---

## Optional next steps / suggestions

- Replace the rule-based NLP with an embeddings-based semantic search or integrate an LLM (hosted or local) for richer natural-language responses. I can help wire a local LLM server (gpt4all/llama.cpp) or a secure server-side proxy to a hosted LLM.
- Add Playwright E2E tests to validate chat flows and the `View property` linking behavior.
- Improve accessibility: keyboard focus trap for the chat, ARIA attributes, and screen-reader friendly labels.

---
*** End Patch
