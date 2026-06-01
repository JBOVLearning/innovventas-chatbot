# CLAUDE.md — Contexto del Proyecto InnovVentas Chatbot

## ¿Qué es este proyecto?
Trabajo final del curso AI-900T00 (Conceptos Básicos de IA en Microsoft Azure) — SENATI.
Desarrollar un **chatbot funcional para E-commerce** para la empresa ficticia **InnovVentas**,
especializada en productos tecnológicos.

## Stack Tecnológico (obligatorio respetar)
- **OS:** Windows 11 Pro
- **Contenedores:** Docker + Docker Compose
- **Base de datos:** PostgreSQL (vía Docker)
- **Backend:** Python (FastAPI) — REST API del chatbot
- **Frontend:** HTML/CSS/JS vanilla — widget embebible en el sitio web
- **IA/NLP:** Azure AI Language (QnA / CLU) o mock local para desarrollo
- **Métricas:** tabla PostgreSQL + dashboard simple

## Objetivo del entregable académico
Resolver el caso práctico con:
1. Descripción de necesidades del cliente y problemas identificados
2. Diseño del chatbot (flujo conversacional, FAQs, diagramas)
3. Justificación de plataformas y frameworks elegidos
4. Plan de implementación paso a paso

## Archivos clave del proyecto
```
innovventas-chatbot/
├── CLAUDE.md                  ← ESTE ARCHIVO (contexto para Claude Code)
├── docs/
│   ├── CASO_PRACTICO.md       ← enunciado completo del trabajo
│   ├── PROPUESTA_SOLUCION.md  ← respuesta académica completa (entregable)
│   ├── PREGUNTAS_GUIA.md      ← respuestas a las 5 preguntas guía
│   ├── DIAGRAMA_FLUJO.md      ← flujo conversacional del chatbot (Mermaid)
│   └── ARQUITECTURA.md        ← arquitectura técnica del sistema
├── src/
│   ├── frontend/              ← widget HTML del chatbot
│   ├── backend/               ← FastAPI (Python)
│   └── bot/                   ← lógica de intenciones y respuestas
├── infra/
│   ├── docker-compose.yml     ← PostgreSQL + Backend
│   └── init.sql               ← schema de métricas en PostgreSQL
└── entregable/
    └── TRABAJO_FINAL.md       ← documento Word-ready para entregar a SENATI
```

## Cómo iniciar desarrollo en Claude Code
```bash
# 1. Levantar infraestructura
cd infra && docker-compose up -d

# 2. Instalar dependencias backend
cd src/backend && pip install -r requirements.txt

# 3. Iniciar servidor de desarrollo
uvicorn main:app --reload --port 8000

# 4. Abrir frontend
# Abrir src/frontend/index.html en el navegador
```

## Reglas de desarrollo
- Toda respuesta del chatbot debe registrarse en PostgreSQL (tabla `chat_logs`)
- El widget debe ser embebible con un `<script>` tag
- Las FAQs se almacenan en PostgreSQL (tabla `faqs`)
- El backend expone `/api/chat` (POST) y `/api/metrics` (GET)
- Usar variables de entorno para credenciales Azure (`.env` file)

## Contexto del caso de negocio
Ver `docs/CASO_PRACTICO.md` para el enunciado completo.
Ver `docs/PROPUESTA_SOLUCION.md` para la solución académica desarrollada.
