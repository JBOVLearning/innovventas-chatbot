"""
API REST del chatbot InnovVentas (FastAPI).
Endpoints:
  POST /api/chat      -> procesa un mensaje y responde
  POST /api/feedback  -> guarda calificación CSAT (1-5)
  GET  /api/faqs      -> lista las FAQs activas
  GET  /api/metrics   -> métricas para el dashboard
  GET  /              -> healthcheck
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import db
import bot

load_dotenv()

# CORS: dominios permitidos (separados por coma). Por defecto "*" para la demo.
ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "*").split(",") if o.strip()
]

# Caché de FAQs en memoria (se carga al arrancar).
FAQS: list[dict] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    global FAQS
    db.init_db()
    FAQS = db.get_faqs()
    print(f"[main] {len(FAQS)} FAQs cargadas | LLM configurado: {bot.configured()}")
    yield


app = FastAPI(title="InnovVentas Chatbot API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Modelos ----------
class ChatIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: str | None = None
    history: list[dict] | None = None


class ChatOut(BaseModel):
    response: str
    session_id: str | None
    intent: str


class FeedbackIn(BaseModel):
    session_id: str
    score: int = Field(..., ge=1, le=5)
    comment: str | None = None


# ---------- Endpoints ----------
@app.get("/")
def health():
    return {"status": "ok", "llm": bot.configured(), "db": db.enabled(), "faqs": len(FAQS)}


@app.post("/api/chat", response_model=ChatOut)
def chat(body: ChatIn):
    session_id = body.session_id or db.create_session()
    intent = bot.guess_intent(body.message, FAQS)

    db.log_message(session_id, "user", body.message, intent=intent)
    reply = bot.answer(body.message, FAQS, history=body.history)
    db.log_message(session_id, "bot", reply, intent=intent)

    return ChatOut(response=reply, session_id=session_id, intent=intent)


@app.post("/api/feedback")
def feedback(body: FeedbackIn):
    ok = db.save_feedback(body.session_id, body.score, body.comment)
    if not ok and db.enabled():
        raise HTTPException(status_code=400, detail="No se pudo guardar el feedback")
    return {"saved": ok}


@app.get("/api/faqs")
def faqs():
    return {"count": len(FAQS), "faqs": FAQS}


@app.get("/api/metrics")
def metrics():
    return db.get_metrics()
