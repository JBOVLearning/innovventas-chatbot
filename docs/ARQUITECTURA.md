# Arquitectura Técnica — Chatbot InnovVentas

---

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│         SITIO WEB INNOVVENTAS        [Netlify / GH Pages]│
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │      Widget Chatbot + Dashboard (HTML/CSS/JS)     │   │
│  │        <script src="widget.js"></script>          │   │
│  └────────────────────┬─────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────┘
                        │ HTTPS POST /api/chat (CORS)
                        ▼
┌───────────────────────────────────────────────────────────┐
│              BACKEND  FastAPI (Python)        [Render]      │
│   POST /api/chat   POST /api/feedback                      │
│   GET  /api/metrics  GET /api/faqs                         │
│   └──────────┬──────────────────┬────────────────────┘    │
│              │                  │                          │
│              ▼                  ▼                          │
│   ┌──────────────────────┐  ┌───────────────────────┐    │
│   │  MOTOR NLP            │  │  PostgreSQL           │    │
│   │  Real: Groq (Llama)   │  │  Real: Neon (cloud)   │    │
│   │  Prop.: Azure CLU     │  │  Local: Docker        │    │
│   │  + 18 FAQs (contexto) │  │  faqs · chat_logs ·   │    │
│   │  → respuesta grounded │  │  sessions · feedback  │    │
│   └──────────────────────┘  └───────────────────────┘    │
└───────────────────────────────────────────────────────────┘
   Motor NLP y BD = piezas intercambiables (vía variables de entorno)
```

---

## Stack Tecnológico Detallado

### Frontend — Widget Embebible
- **Tecnología:** HTML5 + CSS3 + JavaScript Vanilla
- **Archivo principal:** `widget.js` (bundle auto-contenido)
- **Integración:** un solo `<script>` tag en cualquier página del sitio
- **Características:** 
  - Botón flotante (FAB) en esquina inferior derecha
  - Ventana de chat emergente (280x420px)
  - Indicador de escritura (typing indicator)
  - Historial de conversación en sesión

### Backend — API REST
- **Framework:** FastAPI (Python 3.11)
- **Puerto:** 8000
- **Endpoints principales:**
  - `POST /api/chat` — recibe mensaje, retorna respuesta del bot
  - `GET /api/metrics` — métricas para el dashboard
  - `GET /api/faqs` — lista de preguntas frecuentes (admin)
  - `POST /api/feedback` — guardar calificación CSAT

### NLP — Procesamiento de Lenguaje Natural
- **Implementado:** LLM de capa gratuita — **Groq** con `llama-3.3-70b-versatile`
- **Técnica:** las 18 FAQs se inyectan en el *system prompt* como base de conocimiento (grounding); reglas estrictas para que el bot NO invente precios/specs fuera de las FAQs
- **Propuesto (Azure):** Azure AI Language — CLU con umbral de confianza 0.70 → fallback
- **Intercambiable:** se cambia de proveedor solo con variables de entorno (`GROQ_API_KEY` / `AZURE_CLU_*`)

### Base de Datos — PostgreSQL
- **Versión:** PostgreSQL 16 (Docker)
- **Puerto:** 5432

```sql
-- Schema principal
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    intent VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    escalated BOOLEAN DEFAULT false
);

CREATE TABLE chat_logs (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    role VARCHAR(10) NOT NULL, -- 'user' | 'bot'
    message TEXT NOT NULL,
    intent VARCHAR(100),
    confidence FLOAT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    score INTEGER CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Infraestructura — Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: innovventas_bot
      POSTGRES_USER: botuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build: ../src/backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://botuser:${DB_PASSWORD}@postgres:5432/innovventas_bot
      GROQ_API_KEY: ${GROQ_API_KEY}
      GROQ_MODEL: ${GROQ_MODEL:-llama-3.3-70b-versatile}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS:-*}
    depends_on:
      - postgres

volumes:
  pgdata:
```

---

## Flujo de Datos por Request

```
1. Usuario escribe mensaje en el widget (Frontend)
2. Widget hace POST /api/chat con { message, session_id, history }
3. FastAPI recibe la petición y guarda el mensaje del usuario en chat_logs
4. FastAPI envía el mensaje al LLM (Groq) junto con las 18 FAQs como contexto
   (en la versión Azure: CLU detecta intención + confianza, umbral 0.70)
5. El modelo responde ciñéndose a las FAQs; si no aplica → deriva a soporte
6. Guardar la respuesta del bot en chat_logs (PostgreSQL)
7. FastAPI retorna { response, session_id, intent }
8. Widget muestra la respuesta al usuario
```

---

## Consideraciones de Seguridad
- HTTPS obligatorio en producción (Let's Encrypt via Nginx)
- No almacenar datos personales sensibles en chat_logs
- Variables de entorno para credenciales (nunca en código)
- Rate limiting en `/api/chat`: máx 30 req/min por IP
- CORS configurado solo para el dominio de InnovVentas
