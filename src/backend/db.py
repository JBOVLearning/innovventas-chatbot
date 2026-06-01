"""
Capa de base de datos — PostgreSQL (Neon en producción, Docker en local).
Toda la conexión usa la variable de entorno DATABASE_URL.
Si DATABASE_URL no está configurada, las funciones degradan a no-op
para que el backend arranque igual durante pruebas.
"""
import os
import psycopg
from psycopg.rows import dict_row

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

# Esquema mínimo (idempotente). En Docker local también lo crea infra/init.sql.
# En Neon, esto garantiza que las tablas existan aunque no hayas corrido init.sql.
SCHEMA = """
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    intent VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[],
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    escalated BOOLEAN DEFAULT false,
    last_intent VARCHAR(100),
    fallback_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'bot')),
    message TEXT NOT NULL,
    intent VARCHAR(100),
    confidence FLOAT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    score INTEGER CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
"""


def enabled() -> bool:
    return bool(DATABASE_URL)


def get_conn():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def init_db() -> None:
    """Crea las tablas si no existen. Seguro de llamar en cada arranque."""
    if not enabled():
        print("[db] DATABASE_URL no configurada — corriendo sin base de datos.")
        return
    try:
        with get_conn() as conn:
            conn.execute(SCHEMA)
            conn.commit()
        print("[db] Esquema verificado/creado correctamente.")
    except Exception as e:  # noqa: BLE001
        print(f"[db] No se pudo inicializar el esquema: {e}")


def get_faqs() -> list[dict]:
    """Devuelve las FAQs activas. El bot las usa como conocimiento."""
    if not enabled():
        return []
    try:
        with get_conn() as conn:
            rows = conn.execute(
                "SELECT intent, category, question, answer, keywords "
                "FROM faqs WHERE active = true ORDER BY id"
            ).fetchall()
        return rows
    except Exception as e:  # noqa: BLE001
        print(f"[db] Error leyendo FAQs: {e}")
        return []


def create_session() -> str | None:
    if not enabled():
        return None
    try:
        with get_conn() as conn:
            row = conn.execute(
                "INSERT INTO sessions DEFAULT VALUES RETURNING id"
            ).fetchone()
            conn.commit()
        return str(row["id"])
    except Exception as e:  # noqa: BLE001
        print(f"[db] Error creando sesión: {e}")
        return None


def log_message(session_id, role, message, intent=None, confidence=None) -> None:
    if not enabled() or not session_id:
        return
    try:
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO chat_logs (session_id, role, message, intent, confidence) "
                "VALUES (%s, %s, %s, %s, %s)",
                (session_id, role, message, intent, confidence),
            )
            if intent:
                conn.execute(
                    "UPDATE sessions SET last_intent = %s WHERE id = %s",
                    (intent, session_id),
                )
            conn.commit()
    except Exception as e:  # noqa: BLE001
        print(f"[db] Error guardando mensaje: {e}")


def save_feedback(session_id, score, comment=None) -> bool:
    if not enabled() or not session_id:
        return False
    try:
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO feedback (session_id, score, comment) VALUES (%s, %s, %s)",
                (session_id, score, comment),
            )
            conn.execute(
                "UPDATE sessions SET resolved = true, ended_at = NOW() WHERE id = %s",
                (session_id,),
            )
            conn.commit()
        return True
    except Exception as e:  # noqa: BLE001
        print(f"[db] Error guardando feedback: {e}")
        return False


def get_metrics() -> dict:
    """Métricas agregadas para el dashboard."""
    empty = {
        "total_sessions": 0,
        "total_user_messages": 0,
        "csat_avg": None,
        "fallback_rate_pct": 0,
        "top_intents": [],
    }
    if not enabled():
        return empty
    try:
        with get_conn() as conn:
            sessions = conn.execute("SELECT COUNT(*) AS n FROM sessions").fetchone()["n"]
            user_msgs = conn.execute(
                "SELECT COUNT(*) AS n FROM chat_logs WHERE role = 'user'"
            ).fetchone()["n"]
            csat = conn.execute("SELECT AVG(score) AS avg FROM feedback").fetchone()["avg"]
            fallbacks = conn.execute(
                "SELECT COUNT(*) AS n FROM chat_logs "
                "WHERE role = 'user' AND intent = 'fallback'"
            ).fetchone()["n"]
            top = conn.execute(
                "SELECT intent, COUNT(*) AS total "
                "FROM chat_logs "
                "WHERE role = 'user' AND intent IS NOT NULL AND intent != 'fallback' "
                "GROUP BY intent ORDER BY total DESC LIMIT 10"
            ).fetchall()
        return {
            "total_sessions": sessions,
            "total_user_messages": user_msgs,
            "csat_avg": round(float(csat), 2) if csat is not None else None,
            "fallback_rate_pct": round((fallbacks / user_msgs) * 100, 1) if user_msgs else 0,
            "top_intents": top,
        }
    except Exception as e:  # noqa: BLE001
        print(f"[db] Error calculando métricas: {e}")
        return empty
