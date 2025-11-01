from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import asyncio

app = FastAPI(title="MiniMax-M2 Inference Server")

# Request / response models
class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 256
    temperature: Optional[float] = 0.7

class GenerateResponse(BaseModel):
    text: str

# Optionally use a hosted-provider wrapper if provided in ai.py (user-supplied)
_local_ai_module = None
try:
    # Try relative import first (when packaged)
    from . import ai as ai_module
    _local_ai_module = ai_module
except Exception:
    try:
        # Fall back to plain import when running as script from the ai_server directory
        import ai as ai_module
        _local_ai_module = ai_module
    except Exception:
        # no local hosted wrapper present; we'll fall back to transformers pipeline below
        _local_ai_module = None

# Lazy-loaded transformers generator (fallback)
_generator = None

async def get_transformers_generator():
    global _generator
    if _generator is None:
        try:
            from transformers import pipeline
        except Exception as e:
            raise RuntimeError(f"transformers not available: {e}")

        model_name = "MiniMaxAI/MiniMax-M2"
        try:
            _generator = pipeline("text-generation", model=model_name, device_map="auto")
        except Exception as e:
            try:
                _generator = pipeline("text-generation", model=model_name, device=-1)
            except Exception as e2:
                raise RuntimeError(f"Failed to load model {model_name}: {e} | fallback error: {e2}")
    return _generator



@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")
    loop = asyncio.get_running_loop()
    # If user supplied a hosted wrapper (ai.py), prefer it. It's expected to be sync and blocking.
    if _local_ai_module and hasattr(_local_ai_module, 'generate'):
        try:
            text = await loop.run_in_executor(None, lambda: _local_ai_module.generate(req.prompt, req.max_tokens, req.temperature))
            return {"text": text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"local ai generate failed: {e}")

    # Fallback to transformers pipeline if available
    try:
        gen = await get_transformers_generator()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    try:
        result = await loop.run_in_executor(None, lambda: gen(req.prompt, max_length=req.max_tokens, do_sample=True, temperature=req.temperature))
        text = result[0]["generated_text"] if isinstance(result, list) and result and "generated_text" in result[0] else str(result)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"generation failed: {e}")

@app.get("/ping")
async def ping():
    return {"status": "ok"}
