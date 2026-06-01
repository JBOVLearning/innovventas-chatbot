# 🚀 Guía de Despliegue — Chatbot InnovVentas

Arquitectura: **frontend estático (Netlify) + backend FastAPI (Render) + PostgreSQL (Neon) + LLM (Groq)**.

```
[Netlify]  src/frontend  ──►  [Render]  src/backend  ──►  Groq (LLM) + Neon (PostgreSQL)
```

## ¿Qué carpeta va a cada servicio?

| Servicio | Qué subes | Carpeta |
|----------|-----------|---------|
| **Netlify** | El frontend estático (widget + demo) | `src/frontend` |
| **Render**  | El backend FastAPI (la API) | `src/backend` |
| **Neon**    | No subes carpeta: pegas `infra/init.sql` en su editor SQL | — |
| **Groq**    | No subes nada: solo usas tu API key | — |

> ⚠️ Render y Netlify se conectan a un **repositorio de GitHub**. Sube TODO el proyecto a un repo;
> cada servicio apunta a su subcarpeta. (Netlify además permite arrastrar la carpeta, ver abajo.)

---

## Paso 0 — Subir el proyecto a GitHub (una sola vez)

```powershell
git init
git add .
git commit -m "Chatbot InnovVentas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/innovventas-chatbot.git
git push -u origin main
```
El `.gitignore` ya evita subir el `.env` (tus claves quedan seguras).

---

## Paso 1 — Base de datos (Neon)

1. Entra a https://neon.tech y crea un proyecto (free, sin tarjeta).
2. Abre **SQL Editor**, pega TODO el contenido de `infra/init.sql` y ejecútalo
   (crea las tablas + las 18 FAQs).
3. Copia la **Connection string** (algo como
   `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`). La usarás en Render.

---

## Paso 2 — Backend en Render (carpeta `src/backend`)

1. Entra a https://render.com → **New +** → **Web Service**.
2. Conecta tu repo de GitHub.
3. Configura:
   - **Root Directory:** `src/backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
4. En **Environment** agrega las variables (Add Environment Variable):
   - `DATABASE_URL` = la connection string de Neon
   - `GROQ_API_KEY` = tu clave de Groq
   - `GROQ_MODEL` = `llama-3.3-70b-versatile`
   - `ALLOWED_ORIGINS` = `*` (luego pon tu URL de Netlify)
5. **Create Web Service**. Cuando termine, copia la URL pública
   (ej. `https://innovventas-backend.onrender.com`).
6. Pruébala: abre esa URL en el navegador → debe responder
   `{"status":"ok",...}`.

> 💤 El plan free de Render "duerme" tras 15 min de inactividad; la primera petición
> tras dormir tarda ~30-50 s en despertar. Es normal para una demo.

---

## Paso 3 — Frontend en Netlify (carpeta `src/frontend`)

**Antes de subir:** edita `src/frontend/index.html` y pon la URL real de Render:
```html
<script>window.NOVA_API_URL = "https://innovventas-backend.onrender.com";</script>
```

**Opción A — arrastrar (rápida, sin Git):**
1. Entra a https://app.netlify.com → **Add new site** → **Deploy manually**.
2. Arrastra la carpeta `src/frontend` completa. ¡Listo!

**Opción B — desde GitHub (recomendada):**
1. **Add new site** → **Import from Git** → elige tu repo.
2. Configura:
   - **Base directory:** (vacío)
   - **Publish directory:** `src/frontend`
   - **Build command:** (vacío)
3. **Deploy**.

---

## Paso 4 — Cerrar el círculo (CORS)

Cuando Netlify te dé tu URL (ej. `https://innovventas.netlify.app`):
1. Vuelve a Render → variable `ALLOWED_ORIGINS` → ponla = esa URL de Netlify.
2. Render redepliega solo. Tu chatbot ya funciona en producción 🎉.

---

## Probar TODO en local (sin desplegar)

```powershell
# 1. Crea infra/.env con tu GROQ_API_KEY
# 2. Levanta backend + PostgreSQL
cd infra ; docker-compose up -d
# 3. Abre src/frontend/index.html en el navegador (NOVA_API_URL = localhost:8000)
```
