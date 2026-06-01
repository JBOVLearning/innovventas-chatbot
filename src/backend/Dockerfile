FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# En local (docker-compose) usa el puerto 8000.
# En Render se usa el Start Command con $PORT (ver README_DEPLOY.md).
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
