# Arquitectura Técnica — Chatbot InnovVentas

---

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    SITIO WEB INNOVVENTAS                 │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Widget Chatbot (HTML/CSS/JS)              │   │
│  │   <script src="chatbot-widget.js"></script>       │   │
│  └────────────────────┬─────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────┘
                        │ HTTP POST /api/chat
                        ▼
┌───────────────────────────────────────────────────────────┐
│              BACKEND (Docker Container)                    │
│                                                           │
│   ┌─────────────────────────────────────────────────┐    │
│   │              FastAPI (Python)                    │    │
│   │   POST /api/chat    → procesar mensaje           │    │
│   │   GET  /api/metrics → métricas del dashboard     │    │
│   │   GET  /api/faqs    → listar preguntas           │    │
│   └──────────┬──────────────────┬────────────────────┘    │
│              │                  │                          │
│              ▼                  ▼                          │
│   ┌──────────────────┐  ┌───────────────────────┐        │
│   │  Azure AI        │  │  PostgreSQL           │        │
│   │  Language (CLU)  │  │  (Docker Container)   │        │
│   │                  │  │                       │        │
│   │  - Detectar      │  │  - faqs               │        │
│   │    intención     │  │  - chat_logs          │        │
│   │  - Extraer       │  │  - sessions           │        │
│   │    entidades     │  │  - feedback           │        │
│   └──────────────────┘  └───────────────────────┘        │
└───────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico Detallado

### Frontend — Widget Embebible
- **Tecnología:** HTML5 + CSS3 + JavaScript Vanilla
- **Archivo principal:** `chatbot-widget.js` (bundle auto-contenido)
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
- **Servicio:** Azure AI Language — Conversational Language Understanding (CLU)
- **Alternativa offline:** matching por similitud coseno (para desarrollo sin créditos Azure)
- **Umbral de confianza:** 0.70 (70%) — por debajo → fallback

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
      AZURE_CLU_ENDPOINT: ${AZURE_CLU_ENDPOINT}
      AZURE_CLU_KEY: ${AZURE_CLU_KEY}
    depends_on:
      - postgres

volumes:
  pgdata:
```

---

## Flujo de Datos por Request

```
1. Usuario escribe mensaje en el widget (Frontend)
2. Widget hace POST /api/chat con { message, session_id }
3. FastAPI recibe la petición
4. FastAPI llama a Azure CLU para detectar intención + confianza
5. Si confianza > 70%: buscar FAQ en PostgreSQL por intent
   Si confianza ≤ 70%: retornar respuesta de fallback
6. Guardar log en chat_logs (PostgreSQL)
7. FastAPI retorna { response, intent, confidence }
8. Widget muestra la respuesta al usuario
```

---

## Consideraciones de Seguridad
- HTTPS obligatorio en producción (Let's Encrypt via Nginx)
- No almacenar datos personales sensibles en chat_logs
- Variables de entorno para credenciales (nunca en código)
- Rate limiting en `/api/chat`: máx 30 req/min por IP
- CORS configurado solo para el dominio de InnovVentas
