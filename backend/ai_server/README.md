MiniMax-M2 inference server (FastAPI)

This service loads the `MiniMaxAI/MiniMax-M2` model using Hugging Face `transformers` and exposes a simple REST endpoint:

POST /generate
- JSON body: { "prompt": "your text", "max_tokens": 256, "temperature": 0.7 }
- Response: { "text": "generated text" }

Quick start (recommended in a Python venv)

```bash
cd backend/ai_server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Run the server (Uvicorn)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
```

Notes & caveats
- The model may be large and require GPU or a proper accelerate configuration. See Hugging Face `transformers` and `accelerate` docs.
- If `device_map='auto'` fails, try CPU fallback (the server attempts a CPU fallback automatically).
- This server only provides a simple wrapper — for production use, consider batching, request throttling, authentication, and a more robust deployment (Docker, GPU nodes, or managed inference).
