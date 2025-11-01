"""AI provider wrapper for MiniMax inference.

This module exposes a simple `generate(prompt, max_tokens, temperature)` function that
uses the Hugging Face router via the official OpenAI-compatible client.

It expects an environment variable `HF_TOKEN` (or `AI_API_KEY`) to be set with a valid
Hugging Face API key. The model used here is `MiniMaxAI/MiniMax-M2:novita` as an example.
"""

import os
from typing import Optional

try:
    # official OpenAI-compatible client that can route to HF inference
    from openai import OpenAI
except Exception:
    OpenAI = None  # caller will detect absence


def _get_client():
    token = os.environ.get("HF_TOKEN") or os.environ.get("AI_API_KEY")
    if not token:
        raise RuntimeError("HF_TOKEN or AI_API_KEY environment variable must be set to call hosted MiniMax inference")
    if OpenAI is None:
        raise RuntimeError("openai package not installed; please `pip install openai` in the ai_server venv")
    # Use Hugging Face router endpoint (router.huggingface.co) as shown in the sample
    return OpenAI(base_url="https://router.huggingface.co/v1", api_key=token)


def generate(prompt: str, max_tokens: Optional[int] = 256, temperature: Optional[float] = 0.7) -> str:
    """Synchronously generate text for the provided prompt using hosted MiniMax.

    Returns the generated text string. Raises RuntimeError on failure.
    """
    client = _get_client()
    try:
        completion = client.chat.completions.create(
            model="MiniMaxAI/MiniMax-M2:novita",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        # completion.choices[0].message is typically a dict with 'role' and 'content'
        choice = completion.choices[0]
        # Support different shapes returned by various OpenAI-compatible clients:
        # - choice.message may be a dict (with 'content')
        # - choice.message may be an object with a 'content' attribute
        # - older styles may use choice.text
        msg = None
        if hasattr(choice, "message"):
            m = choice.message
            try:
                if isinstance(m, dict):
                    msg = m.get("content")
                else:
                    # object-like: try attribute access first
                    msg = getattr(m, "content", None)
                    if msg is None and hasattr(m, "get"):
                        # some wrapper types expose a get() method
                        msg = m.get("content")
            except Exception:
                msg = None

        if not msg:
            # fallback to choice.text if present
            msg = getattr(choice, "text", None)

        if not msg:
            # last resort: stringify the choice
            msg = str(choice)

        return msg
    except Exception as e:
        raise RuntimeError(f"hosted MiniMax generation failed: {e}")