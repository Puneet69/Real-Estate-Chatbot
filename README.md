# Real-Estate-Chatbot

A small demo real-estate chatbot (React + Vite frontend) with a Node/Express backend and MongoDB for storing favorites. The chatbot supports natural-language property search with simple NLP, clarification prompts, fuzzy matching, and links chat results to property cards.

This README explains how to run the app locally, the available APIs, and quick verification steps.

---

## Features
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

If you want, I can update this README further to include one-command scripts, CI configuration, or a Playwright test that exercises the guided chat flow.

*** End Patch
