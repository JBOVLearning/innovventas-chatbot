# Respuestas a las Preguntas Guía
## Curso AI-900T00 — InnovVentas Chatbot

---

## Pregunta 1: FAQs más comunes en InnovVentas

### Categoría: Productos y Especificaciones Técnicas
- ¿Cuáles son las especificaciones del producto X (RAM, almacenamiento, procesador)?
- ¿Es compatible este producto con mi sistema operativo?
- ¿Qué garantía tiene este equipo?
- ¿El producto viene con accesorios incluidos?
- ¿Hay stock disponible del modelo que busco?

### Categoría: Proceso de Compra
- ¿Cómo agrego un producto al carrito?
- ¿Puedo comprar sin crear una cuenta?
- ¿Cómo aplico un cupón de descuento?
- ¿Puedo modificar o cancelar mi pedido?

### Categoría: Métodos de Pago
- ¿Qué métodos de pago aceptan? (tarjetas, Yape, Plin, transferencia)
- ¿Es seguro pagar en línea en InnovVentas?
- ¿Ofrecen pagos en cuotas o financiamiento?

### Categoría: Envío y Entrega
- ¿Cuánto tiempo demora el envío a Lima / provincias?
- ¿Cuál es el costo de envío?
- ¿Puedo rastrear mi pedido?
- ¿Hacen delivery express?

### Categoría: Soporte Técnico Post-Venta
- ¿Cómo solicito garantía de un producto?
- ¿Dónde están sus centros de servicio técnico?
- ¿Puedo devolver un producto si no me satisface?

---

## Pregunta 2: Plataformas y Herramientas Recomendadas

### Opción Seleccionada: Stack Propio (propuesto en Azure, implementado en capa gratuita)

| Componente | Propuesto (Azure) | Implementado (capa gratuita) | Justificación |
|------------|-------------------|------------------------------|---------------|
| NLP / Intenciones | Azure AI Language (CLU) | **Groq + Llama 3.3** | FAQs como contexto; entiende lenguaje libre sin entrenamiento ni costo |
| Backend API | Python + FastAPI | Python + FastAPI | Liviano, rápido, excelente para APIs REST (*idéntico*) |
| Base de datos | Azure DB for PostgreSQL | **PostgreSQL en Neon** | Robusto, open source, perfecto para métricas |
| Frontend widget | HTML/CSS/JS vanilla | HTML/CSS/JS vanilla | Embebible en cualquier sitio, sin dependencias |
| Hosting | Azure Container Instances | **Render + Netlify** | Despliegue gratuito; esconde las API keys del navegador |
| Monitoreo | Custom dashboard (Chart.js) | Custom dashboard (Chart.js) | Métricas en tiempo real sin herramientas externas costosas |

> El motivo del cambio fue el **agotamiento del crédito de estudiante de Azure**. Gracias a la
> arquitectura desacoplada, solo cambió el proveedor (vía variables de entorno), no el código.

### Alternativas Evaluadas

| Plataforma | Ventaja | Desventaja |
|------------|---------|------------|
| Azure Bot Service / Copilot Studio | Integración nativa con Azure, no-code | Costo elevado para MVP / requiere suscripción activa |
| Dialogflow (Google) | Fácil de usar | No es Azure → no alineado al curso |
| Botpress | Open source completo | Complejidad de configuración |
| **FastAPI + LLM (Groq/Azure CLU)** | Control total, costo cero, motor intercambiable | Requiere más desarrollo inicial |

---

## Pregunta 3: Evaluación de Efectividad

### KPIs de Satisfacción del Cliente
- **CSAT (Customer Satisfaction Score):** encuesta al cerrar conversación (1-5 estrellas)
- **Tasa de resolución sin escalado:** % de consultas resueltas sin agente humano
- **Tiempo promedio de respuesta:** debe ser < 2 segundos
- **Tasa de abandono de conversación:** % de usuarios que cierran el chat sin resolver su duda

### KPIs de Ventas
- **Tasa de conversión post-chat:** % de usuarios que compran después de interactuar con el bot
- **Reducción de carritos abandonados:** comparar antes vs después de implementar el chatbot
- **Valor promedio de pedido (AOV):** medir si el bot ayuda en upselling
- **Ingresos atribuidos al chatbot:** ventas donde el chatbot participó en el funnel

### Metodología de Medición
1. Registrar cada interacción en PostgreSQL con `session_id`, `intent`, `timestamp`, `resolved`
2. Dashboard semanal con métricas agregadas
3. A/B testing: usuarios con chatbot vs sin chatbot (primer mes)
4. Revisión mensual para ajustar respuestas con baja satisfacción

---

## Pregunta 4: Desafíos Técnicos y Soluciones

| Desafío | Descripción | Solución |
|---------|-------------|----------|
| Comprensión de lenguaje natural | El usuario escribe de forma impredecible | LLM (Groq) con las FAQs como contexto; o Azure CLU con utterances por intención |
| Escalabilidad del backend | Muchas consultas simultáneas | FastAPI + async/await + conexión pooling en PostgreSQL |
| Integración con el sitio web existente | CORS, iframe, compatibilidad | Widget JS con `<script>` tag, configurar CORS en FastAPI |
| Mantener FAQs actualizadas | El catálogo de productos cambia | Panel admin para editar FAQs directamente en PostgreSQL |
| Fallback cuando el bot no entiende | Evitar respuestas frustrantes | Intent de fallback → ofrecer contacto humano o email |
| Seguridad | Datos de usuarios en el chat | HTTPS obligatorio, no almacenar datos sensibles, logs anonimizados |
| Disponibilidad 24/7 | El chatbot debe estar siempre activo | Docker en VPS + healthcheck + restart policy |

---

## Pregunta 5: Métricas a Monitorear

### Dashboard de Métricas (PostgreSQL + Chart.js)

```sql
-- Tablas clave para monitoreo
chat_logs      → cada mensaje del usuario + intención detectada + respuesta
sessions       → sesiones de usuario (inicio, fin, resuelto: bool)
faqs           → base de conocimiento del bot
feedback       → calificación post-conversación (1-5)
conversions    → sesiones que resultaron en compra
```

### Métricas Operativas (revisar diariamente)
- Número total de conversaciones
- Top 10 intenciones más consultadas
- Tasa de respuestas fallidas (intent no reconocido)
- Tiempo promedio de sesión

### Métricas de Negocio (revisar semanalmente)
- Reducción % en tasa de abandono de carrito
- Conversiones atribuidas al chatbot
- Satisfacción promedio (CSAT)

### Optimización Continua
- Revisar mensajes con `intent = "fallback"` → agregarlos como nuevas FAQs
- Ajustar el prompt y las FAQs del LLM (Groq), o re-entrenar el modelo CLU (Azure), con los nuevos casos
- Heatmap de horarios con más consultas → ajustar recursos de servidor
