# TRABAJO FINAL DEL CURSO
## AI-900T00 Conceptos Básicos de IA en Microsoft Azure
### SENATI — Tecnologías de la Información

---

> **Tema:** Uso de Chatbots en E-commerce  
> **Empresa caso:** InnovVentas  

---

# 1. DESCRIPCIÓN DE NECESIDADES DEL CLIENTE Y PROBLEMAS IDENTIFICADOS

## 1.1 Situación Actual de InnovVentas

InnovVentas es una empresa especializada en la comercialización de productos tecnológicos que opera principalmente a través de su sitio web de E-commerce. A pesar de contar con un catálogo competitivo, la empresa enfrenta una problemática crítica: **alta tasa de abandono de carrito y baja conversión de visitas en ventas efectivas**.

## 1.2 Problemas Identificados

Un análisis del flujo de compra reveló los siguientes puntos de fricción:

**Problema 1 — Falta de respuestas inmediatas:**
Los clientes de InnovVentas generan consultas sobre especificaciones técnicas (¿qué RAM tiene esta laptop?), compatibilidad de productos y disponibilidad de stock. Al no recibir respuesta inmediata, el cliente abandona el sitio y busca la información en la competencia.

**Problema 2 — Confusión en el proceso de pago:**
Una proporción significativa de abandonos ocurre en el paso del checkout, específicamente en la selección del método de pago. Los clientes no saben si pueden pagar con Yape, si hay cuotas disponibles o si la web es segura.

**Problema 3 — Soporte post-venta con alta demora:**
Las consultas sobre estado de pedidos, garantías y devoluciones generan tickets de soporte que tardan 24-48 horas en responderse, generando insatisfacción en el cliente.

**Impacto cuantificable:**
- Alta tasa de carritos abandonados (estimado industria: 68-75%)
- Pérdidas anuales significativas en ventas no concretadas
- Baja fidelización de clientes por experiencia de compra deficiente

---

# 2. DISEÑO DEL CHATBOT

## 2.1 Identidad del Chatbot

| Característica | Descripción |
|----------------|-------------|
| Nombre | **Nova** |
| Rol | Asistente virtual de InnovVentas |
| Tono | Amigable, profesional, conciso |
| Idioma | Español peruano |
| Disponibilidad | 24/7/365 |

## 2.2 Preguntas Frecuentes que Abordará Nova

El chatbot gira en torno a **6 módulos temáticos** con un total de 25 FAQs identificadas:

| Módulo | N° FAQs | Ejemplos de consultas |
|--------|---------|----------------------|
| Productos y Especificaciones | 5 | ¿Qué procesador tiene? ¿Hay stock? ¿Qué garantía tiene? |
| Precios y Descuentos | 4 | ¿Cuánto cuesta? ¿Tienen cupones? ¿El precio incluye IGV? |
| Métodos de Pago | 3 | ¿Aceptan Yape? ¿Hay cuotas? ¿Es seguro pagar aquí? |
| Proceso de Compra | 3 | ¿Cómo compro paso a paso? ¿Puedo cancelar? |
| Envío y Rastreo | 4 | ¿Cuánto demora? ¿Cuánto cuesta el envío? ¿Cómo rastro? |
| Soporte Post-venta | 3 | ¿Cómo devuelvo? ¿Dónde está mi garantía? |

## 2.3 Flujo de Conversación

### Flujo Principal

```
┌─────────────────────────────────────────────────────────────┐
│  INICIO: Usuario abre el chat                               │
│  → Bot: "¡Hola! Soy Nova de InnovVentas. ¿En qué te        │
│          ayudo?" + botones de categorías                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │  PROCESAMIENTO NLP      │
              │  Azure CLU analiza el   │
              │  mensaje del usuario    │
              └────────────┬────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
    ┌──────▼──────┐                 ┌──────▼──────┐
    │ Confianza   │                 │ Confianza   │
    │   ≥ 70%     │                 │   < 70%     │
    └──────┬──────┘                 └──────┬──────┘
           │                               │
    ┌──────▼──────────┐           ┌────────▼────────┐
    │ Buscar respuesta│           │ FALLBACK:       │
    │ en base de FAQs │           │ Ofrecer menú   │
    │ (PostgreSQL)    │           │ de opciones    │
    └──────┬──────────┘           └────────┬────────┘
           │                               │ (3 fallbacks)
    ┌──────▼──────────┐           ┌────────▼────────┐
    │ Entregar        │           │ ESCALADO:       │
    │ respuesta al    │           │ Derivar a       │
    │ usuario         │           │ agente humano  │
    └──────┬──────────┘           └─────────────────┘
           │
    ┌──────▼──────────┐
    │ ¿Resuelto?      │
    │ Encuesta CSAT   │
    │ (1-5 estrellas) │
    └──────┬──────────┘
           │
    ┌──────▼──────────┐
    │ Guardar log en  │
    │  PostgreSQL     │
    └─────────────────┘
```

### Manejo de Casos Especiales

| Caso | Acción del Bot |
|------|---------------|
| 3 fallbacks consecutivos | Ofrecer contacto con agente humano |
| Consulta de pedido específico | Solicitar número de orden o email |
| Horario fuera de atención | Responder FAQs + registrar para seguimiento |
| Saludo inicial | Mostrar menú de categorías con botones |

## 2.4 Mapa Conversacional Detallado

El mapa de conversación cubre los siguientes nodos de decisión:

**Nodo Principal → 6 ramas temáticas → Respuesta específica → Verificación → CSAT**

Ejemplo de conversación completa:

> **Usuario:** "hola quiero saber si tienen el laptop Asus VivoBook en stock"
>
> **Nova:** "¡Hola! Claro que sí, déjame revisar la disponibilidad del ASUS VivoBook para ti. ¿Tienes el modelo específico? Por ejemplo: VivoBook 15, VivoBook 16X, etc."
>
> **Usuario:** "el VivoBook 15 i5"
>
> **Nova:** "✅ El ASUS VivoBook 15 (Intel Core i5, 8GB RAM, 512GB SSD) está **disponible en stock**. Precio actual: S/ 2,199. ¿Te gustaría añadirlo al carrito o necesitas más información sobre sus especificaciones?"

---

# 3. PLATAFORMAS Y FRAMEWORKS SELECCIONADOS

## 3.1 Arquitectura de la Solución

La solución se compone de 4 capas tecnológicas:

```
┌──────────────────────────────────────────────────────┐
│          SITIO WEB INNOVVENTAS (existente)            │
│    <script src="chatbot-widget.js"></script>          │  ← Widget embebible
└───────────────────────────┬──────────────────────────┘
                            │ HTTPS / REST API
                            ▼
┌──────────────────────────────────────────────────────┐
│            BACKEND FastAPI (Python)                   │  ← Lógica del bot
│         Contenedor Docker / Puerto 8000               │
│   • POST /api/chat  • GET /api/metrics                │
└─────────────────┬────────────────┬───────────────────┘
                  │                │
                  ▼                ▼
┌─────────────────────┐  ┌────────────────────────────┐
│  Azure AI Language   │  │  PostgreSQL (Docker)        │
│  CLU — Detección de  │  │  • FAQs    • chat_logs      │  ← Datos y métricas
│  intenciones en NLP  │  │  • sessions • feedback      │
└─────────────────────┘  └────────────────────────────┘
```

## 3.2 Justificación de Cada Tecnología

### Azure AI Language — Conversational Language Understanding (CLU)
**¿Por qué?** Es el servicio de Microsoft Azure directamente relacionado con el curso AI-900T00. Permite entrenar un modelo de comprensión del lenguaje natural con utterances en español, detectar intenciones como "consulta_producto" o "rastreo_pedido", y extraer entidades como el nombre del producto o número de orden. Se integra via REST API con cualquier backend.

### Python + FastAPI
**¿Por qué?** FastAPI es el framework Python más moderno para construir APIs REST. Su soporte nativo para operaciones asíncronas lo hace eficiente para manejar múltiples conversaciones simultáneas. Genera documentación automática (Swagger) que facilita las pruebas, y tiene una curva de aprendizaje baja para un equipo de desarrollo pequeño.

### PostgreSQL en Docker
**¿Por qué?** PostgreSQL es una base de datos relacional robusta y open source que permite almacenar los logs de conversaciones, la base de FAQs y las métricas de uso. Al ejecutarse en Docker, el ambiente de desarrollo en Windows 11 es idéntico al de producción. En el futuro, puede migrarse fácilmente a **Azure Database for PostgreSQL** sin cambios en el código.

### HTML/CSS/JS Vanilla (Widget)
**¿Por qué?** Un widget construido sin frameworks externos (React, Vue, etc.) puede insertarse en el sitio web de InnovVentas con una sola línea de código `<script>`, sin importar la tecnología con la que fue construido el sitio (WordPress, Shopify, o custom). Es ligero y no introduce dependencias que puedan generar conflictos.

### Docker + Docker Compose
**¿Por qué?** Docker garantiza que el chatbot funcione igual en el equipo del desarrollador (Windows 11 Pro) que en el servidor de producción. Con un solo comando `docker-compose up -d` se levanta toda la infraestructura: backend + base de datos.

---

# 4. PLAN DE IMPLEMENTACIÓN

## 4.1 Cronograma de Implementación (5 semanas)

### Semana 1 — Preparación y Configuración
1. Levantar reunión con el equipo de ventas de InnovVentas para identificar las 25 FAQs más frecuentes
2. Instalar Docker Desktop en Windows 11 y clonar el repositorio del proyecto
3. Ejecutar `docker-compose up -d` para inicializar PostgreSQL con el schema
4. Crear el recurso **Azure AI Language** en el portal de Azure (portal.azure.com)
5. Verificar conectividad entre el backend y la base de datos

### Semana 2 — Entrenamiento del Modelo NLP
1. Acceder a **Azure AI Language Studio** (language.cognitive.azure.com)
2. Crear un nuevo proyecto de tipo **Conversational Language Understanding**
3. Definir las 14 intenciones identificadas (saludo, consulta_producto, metodo_pago, etc.)
4. Agregar mínimo 15 ejemplos (utterances) por cada intención en español peruano
5. Etiquetar entidades: `product_name`, `order_id`
6. Entrenar el modelo y publicarlo en el deployment "production"
7. Poblar la tabla `faqs` de PostgreSQL con las respuestas definitivas aprobadas por InnovVentas

### Semana 3 — Desarrollo del Backend
1. Implementar el endpoint `POST /api/chat`:
   - Recibir mensaje del usuario
   - Llamar a Azure CLU para detectar intención
   - Si confianza ≥ 70%: buscar respuesta en `faqs`
   - Si confianza < 70%: retornar respuesta de fallback
   - Guardar log en `chat_logs`
2. Implementar el endpoint `GET /api/metrics` con las métricas del dashboard
3. Implementar el sistema de sesiones (inicio, cierre, conteo de fallbacks)
4. Implementar escalado automático a agente humano tras 3 fallbacks

### Semana 4 — Desarrollo del Frontend e Integración
1. Diseñar la UI del widget con los colores corporativos de InnovVentas
2. Implementar el botón flotante (FAB) y la ventana de chat
3. Implementar la encuesta CSAT de 1 a 5 estrellas al cierre de sesión
4. Empaquetar como `chatbot-widget.js` auto-contenido (sin dependencias externas)
5. **Integración:** insertar `<script src="chatbot-widget.js"></script>` antes del `</body>` del sitio web de InnovVentas
6. Verificar que el CORS del backend permite peticiones desde el dominio del sitio web

### Semana 5 — Pruebas, Ajustes y Lanzamiento
1. Pruebas funcionales: probar cada uno de los 14 intents definidos
2. Pruebas de carga: simular 50 usuarios simultáneos
3. Ajustar utterances de intenciones con confianza baja
4. Configurar alertas por email cuando la tasa de fallback supere el 30%
5. Capacitar al equipo de InnovVentas en el uso del dashboard de métricas
6. **Go-live:** activar el chatbot en producción con monitoreo activo 48h

## 4.2 Métricas de Éxito Post-Implementación

| Métrica | Línea Base | Objetivo Mes 1 | Objetivo Mes 3 |
|---------|-----------|---------------|---------------|
| Tasa de resolución sin escalado | 0% | ≥ 70% | ≥ 85% |
| CSAT promedio | - | ≥ 3.5 / 5 | ≥ 4.2 / 5 |
| Reducción de abandono de carrito | 0% | -10% | -25% |
| Tiempo de respuesta promedio | Horas | < 2 segundos | < 1 segundo |
| Consultas atendidas/día | 0 | 50+ | 200+ |

---

# 5. CONCLUSIONES

La implementación de Nova, el chatbot de InnovVentas basado en **Azure AI Language**, representa una solución técnicamente sólida que ataca directamente los tres problemas identificados: falta de respuestas inmediatas, confusión en el proceso de pago y soporte post-venta lento.

La arquitectura propuesta — **FastAPI + Azure CLU + PostgreSQL + Docker** — cumple con todos los requerimientos del caso:

✅ Responde preguntas frecuentes de forma automática (Azure CLU + FAQs en PostgreSQL)  
✅ Asiste en el proceso de compra paso a paso (flujo conversacional guiado)  
✅ Ofrece soporte técnico básico con escalado a humano cuando es necesario  
✅ Se integra al sitio web existente con una sola línea de código  
✅ Recopila métricas de impacto (CSAT, tasa de resolución, conversiones)  

La alineación con el ecosistema **Microsoft Azure** hace que esta solución sea escalable: en producción puede migrar a **Azure Container Instances** y **Azure Database for PostgreSQL**, aprovechando los servicios cloud estudiados en el curso AI-900T00.
