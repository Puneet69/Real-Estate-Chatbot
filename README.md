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

## Repository layout

```
.
├── backend/
│   ├── server.js        # Express server and API routes
│   ├── models/          # Mongoose models (Favorite.js)
│   └── data/            # Local property JSON files
├── frontend/
│   └── real-estate-chatbot/  # React + Vite app
│       └── src/
│           ├── App.jsx
│           └── ChatPanel.jsx
├── package.json         # workspace scripts (optional)
└── README.md
```

## Prerequisites
- Node.js (16+ recommended)
- npm
- MongoDB (Atlas or local). The backend will read `MONGODB_URI` from environment (see below).

## Backend — run locally

1. Open a terminal and go to the backend folder:

```bash
cd backend
npm install
```

2. Create a `.env` or set `MONGODB_URI` in your environment. An example file is provided as `backend/.env.example`.

3. Start the backend (default port 5001 is used in development in this repo):

```bash
# from repo root
cd backend
PORT=5001 node server.js
```

4. Verify the API:

```bash
curl http://localhost:5001/api/properties | head -n 1
curl "http://localhost:5001/api/favorites?user=demo%40email.com"
```

### API summary
- GET /api/properties — returns the property list (merged from `backend/data` files)
- GET /api/favorites?user=<email> — returns favorites for a user
- POST /api/favorites { user, propertyId } — save a favorite (JSON body)
- DELETE /api/favorites { user, propertyId } — remove a favorite (JSON body)

Note: `propertyId` in favorites is stored as a string in the current schema. Consider migrating to a numeric id if you prefer numeric types.

## Frontend — run locally

1. Open a terminal and go to the frontend folder:

```bash
cd frontend/real-estate-chatbot
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app in your browser (Vite prints the local URL; commonly `http://localhost:5173`).

4. Try chat examples:
- Ambiguous bedrooms: `Show 2 or 3 bhk in New York` — bot asks for clarification.
- Fuzzy location: mistype a known place (e.g. `Banaglore`) — bot suggests a likely match.
- Approximate price: `Looking for properties around 50 lakh` — bot asks to refine.

Clicking the `View property` button in a chat result will scroll and briefly highlight the matching property card on the right.

## Troubleshooting
- If the backend warns about `MONGODB_URI` missing, set it in `backend/.env` or export it in your shell and restart the server.
- macOS sometimes has system services bound to port 5000 — this repo uses 5001 by default to avoid conflicts.
- If Vite picks another port (e.g. 5174) it prints the correct URL in the terminal; open that address.

## Notes & next steps
- The NLP is rule-based (uses `compromise`) and includes a small fuzzy helper (Levenshtein) — for higher-quality NLU you can integrate a dedicated NLU/intent service or use embeddings/semantic search.
- Consider converting `Favorite.propertyId` to a numeric field and migrating existing records for type consistency.
- You can add unit/e2e tests (Playwright) to automatically verify chat flows and result linking.

## License
This repository is provided as-is for demo/learning purposes.

---

If you want I can also add a short `CONTRIBUTING.md` and a Playwright script that exercises the chat flows automatically.
# Real-Estate-Chatbot
