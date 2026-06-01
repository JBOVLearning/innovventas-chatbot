# Propuesta de Solución — Trabajo Final AI-900T00
## Tema: Uso de Chatbots en E-commerce
### Empresa: InnovVentas | Curso: Conceptos Básicos de IA en Microsoft Azure (SENATI)

---

## 1. Descripción de Necesidades del Cliente y Problemas Identificados

### 1.1 Contexto de la Empresa
InnovVentas es una empresa especializada en la comercialización de productos tecnológicos que opera en el mercado digital peruano. Su canal principal de ventas es su sitio web de E-commerce, donde los clientes pueden explorar y adquirir laptops, smartphones, accesorios y otros dispositivos.

### 1.2 Problemas Identificados en el Flujo de E-commerce

| N° | Problema | Causa Raíz | Impacto |
|----|----------|------------|---------|
| 1 | Alta tasa de carritos abandonados | Los usuarios no encuentran respuestas rápidas a sus dudas antes de comprar | Pérdidas directas en ventas |
| 2 | Baja interacción en el sitio web | Ausencia de asistencia en tiempo real durante el proceso de compra | Menor tiempo en el sitio, menor conversión |
| 3 | Consultas sin resolver: especificaciones técnicas | No hay un canal inmediato para aclarar dudas técnicas | Cliente se va a la competencia |
| 4 | Consultas sin resolver: métodos de pago | El cliente desconoce las opciones disponibles | Abandono en el paso final del checkout |
| 5 | Consultas sin resolver: disponibilidad de productos | El inventario no se comunica de forma proactiva | Frustración del usuario |
| 6 | Retención de clientes deficiente | Sin acompañamiento post-venta automatizado | Baja fidelización |

### 1.3 Necesidades del Cliente
- **Inmediatez:** respuestas en menos de 3 segundos, disponibles 24/7
- **Cobertura:** soporte para todo el ciclo de compra (antes, durante y después)
- **Escalabilidad:** debe atender múltiples usuarios simultáneamente sin aumentar personal
- **Métricas:** visibilidad del impacto del chatbot en ventas y satisfacción
- **Integración:** solución no intrusiva, compatible con el sitio web actual

---

## 2. Diseño del Chatbot

### 2.1 Nombre y Personalidad
- **Nombre:** Nova
- **Tono:** amigable, profesional, conciso
- **Idioma:** español peruano
- **Avatar:** ícono de asistente virtual con colores de marca InnovVentas

### 2.2 Preguntas Frecuentes que Abordará el Chatbot

#### Módulo 1: Productos y Disponibilidad
1. ¿Cuáles son las especificaciones del producto [X]?
2. ¿Tienen stock disponible de [producto]?
3. ¿Qué garantía tiene este producto?
4. ¿Este equipo es compatible con [sistema operativo/accesorio]?
5. ¿Tienen versiones de [producto] con más memoria/almacenamiento?

#### Módulo 2: Precios y Promociones
6. ¿Cuál es el precio actual de [producto]?
7. ¿Tienen alguna promoción o descuento vigente?
8. ¿Cómo aplico un código de cupón?
9. ¿El precio incluye IGV?

#### Módulo 3: Métodos de Pago
10. ¿Qué métodos de pago aceptan?
11. ¿Puedo pagar con Yape o Plin?
12. ¿Ofrecen pagos en cuotas o financiamiento sin intereses?
13. ¿Es seguro pagar con tarjeta en su web?

#### Módulo 4: Proceso de Compra
14. ¿Cómo hago un pedido paso a paso?
15. ¿Puedo comprar sin crear una cuenta?
16. ¿Cómo modifico o cancelo un pedido?
17. ¿Recibiré una confirmación de mi compra?

#### Módulo 5: Envío y Entrega
18. ¿Cuánto tiempo demora el envío a Lima Metropolitana?
19. ¿Hacen envíos a provincias?
20. ¿Cuánto cuesta el envío?
21. ¿Cómo rastro mi pedido?
22. ¿Tienen opción de recojo en tienda?

#### Módulo 6: Soporte Post-Venta
23. ¿Cómo solicito la garantía de un producto?
24. ¿Puedo devolver un producto si no me satisface?
25. ¿Dónde están sus centros de servicio técnico?

### 2.3 Flujo de Conversación Principal

Ver diagrama completo en `docs/DIAGRAMA_FLUJO.md`

**Resumen del flujo:**
```
Saludo → Identificación de intención → Respuesta específica → 
Verificación de resolución → [Encuesta CSAT] → Cierre
```

**Manejo de casos especiales:**
- **Fallback (3 intentos):** derivar a agente humano con contexto completo
- **Fuera de horario laboral:** responder FAQs + registrar consulta para seguimiento
- **Consulta de pedido específico:** solicitar número de orden o email del cliente

### 2.4 Mapa Conversacional Simplificado
```
                    ┌─────────────┐
                    │   SALUDO    │
                    │    Nova     │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ PRODUCTO │ │  COMPRA  │ │  SOPORTE │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
        [FAQ/BD]      [Guía paso]   [Ticket]
             │             │             │
             └─────────────┴─────────────┘
                           │
                    ┌──────┴──────┐
                    │  RESOLUCIÓN │
                    │  + CSAT 1-5 │
                    └─────────────┘
```

---

## 3. Plataformas y Frameworks

### 3.1 Elección Tecnológica

> **Arquitectura propuesta vs. prototipo real:** la solución se diseñó sobre **Azure AI Language**
> (alineada al curso AI-900). Como el crédito de estudiante de Azure se agotó, el prototipo
> funcional se implementó con servicios de **capa gratuita equivalentes**: **Groq** (motor NLP),
> **Neon** (PostgreSQL en la nube), **Render** (backend) y **Netlify** (frontend). El backend
> FastAPI es idéntico en ambos casos; solo cambia el proveedor vía variables de entorno.

#### 3.1.1 Motor NLP — Azure CLU *(propuesto)* / Groq + Llama 3.3 *(implementado)*
**Justificación (Azure CLU):** Alineado directamente con el curso AI-900T00 de Microsoft Azure. CLU permite:
- Entrenar un modelo de intenciones personalizado con ejemplos en español
- Detectar entidades (nombre de producto, número de orden)
- Integrarse via REST API desde cualquier backend
- Escalar automáticamente según demanda

**Justificación (Groq — lo realmente usado):** LLM de capa gratuita, sin costo ni entrenamiento manual. Las 18 FAQs se inyectan en el *system prompt* como base de conocimiento: el bot entiende lenguaje libre (sinónimos, typos, frases indirectas) pero responde ciñéndose a la información de InnovVentas. Intercambiable con Azure CLU sin tocar el resto del sistema.

#### 3.1.2 Python + FastAPI (Backend)
**Justificación:** FastAPI es el framework Python más moderno para APIs REST:
- Rendimiento comparable a Node.js gracias al soporte async/await
- Documentación automática (Swagger UI en `/docs`)
- Tipado estático con Pydantic — menos bugs en producción
- Comunidad activa y amplia documentación

#### 3.1.3 PostgreSQL (Base de Datos)
**Justificación:** 
- Open source y robusto — ideal para almacenar logs de conversaciones y métricas
- JSON nativo — útil para almacenar contexto de conversaciones
- Excelente soporte en Docker para desarrollo local
- En producción se usó **Neon** (PostgreSQL gestionado, capa gratuita); migrable a Azure Database for PostgreSQL sin cambios de código (todo vía `DATABASE_URL`)

#### 3.1.4 Docker + Docker Compose (Infraestructura)
**Justificación:**
- Ambiente idéntico entre desarrollo (Windows 11) y producción
- Un solo comando (`docker-compose up`) levanta todo el stack
- Fácil de desplegar en cualquier VPS o Azure Container Instances

#### 3.1.5 HTML/CSS/JS Vanilla (Widget Frontend)
**Justificación:**
- Sin dependencias externas → no rompe el sitio web de InnovVentas
- Archivo único auto-contenido (`widget.js`)
- Compatible con cualquier framework web del cliente (WordPress, Shopify, custom)
- Tamaño reducido → no impacta el rendimiento del sitio

#### 3.1.6 Hosting — Render (backend) + Netlify (frontend)
**Justificación:**
- **Render** (capa gratuita) ejecuta el backend FastAPI y guarda en secreto las API keys (rol equivalente a Azure Container Instances)
- **Netlify** (capa gratuita) publica el frontend estático (widget + dashboard)
- La separación frontend/backend evita exponer credenciales en el navegador (patrón estándar de seguridad)

---

## 4. Plan de Implementación

### Fase 1: Preparación (Semana 1)
| Paso | Actividad | Responsable |
|------|-----------|-------------|
| 1.1 | Levantamiento de FAQs con el equipo de ventas de InnovVentas | PM + Equipo Ventas |
| 1.2 | Configurar ambiente Docker local (PostgreSQL + Backend) | Dev Backend |
| 1.3 | Crear recurso Azure AI Language en portal Azure | Dev Backend |
| 1.4 | Diseñar schema de base de datos y ejecutar `init.sql` | Dev Backend |

### Fase 2: Desarrollo del NLP (Semana 2)
| Paso | Actividad | Responsable |
|------|-----------|-------------|
| 2.1 | Crear proyecto CLU en Azure AI Language Studio | Dev Backend |
| 2.2 | Definir 14 intenciones con mínimo 15 utterances cada una | Dev Backend |
| 2.3 | Etiquetar entidades: `product_name`, `order_id` | Dev Backend |
| 2.4 | Entrenar y publicar el modelo CLU | Dev Backend |
| 2.5 | Poblar tabla `faqs` en PostgreSQL con respuestas definitivas | Dev Backend |

### Fase 3: Desarrollo del Backend (Semana 2-3)
| Paso | Actividad | Responsable |
|------|-----------|-------------|
| 3.1 | Implementar `POST /api/chat` con llamada a Azure CLU | Dev Backend |
| 3.2 | Implementar lógica de sesiones y logs en PostgreSQL | Dev Backend |
| 3.3 | Implementar fallback y escalado a agente humano | Dev Backend |
| 3.4 | Implementar `GET /api/metrics` para el dashboard | Dev Backend |
| 3.5 | Tests unitarios de los endpoints | Dev Backend |

### Fase 4: Desarrollo del Frontend (Semana 3)
| Paso | Actividad | Responsable |
|------|-----------|-------------|
| 4.1 | Diseñar UI del widget con colores de InnovVentas | Dev Frontend |
| 4.2 | Implementar lógica de conversación en JavaScript | Dev Frontend |
| 4.3 | Implementar encuesta CSAT (1-5 estrellas) al cierre | Dev Frontend |
| 4.4 | Empaquetar como `chatbot-widget.js` auto-contenido | Dev Frontend |

### Fase 5: Integración y Pruebas (Semana 4)
| Paso | Actividad | Responsable |
|------|-----------|-------------|
| 5.1 | Insertar `<script>` tag en el sitio web de InnovVentas | Dev Frontend |
| 5.2 | Pruebas de integración end-to-end | QA |
| 5.3 | Pruebas de carga (100 usuarios simultáneos) | QA |
| 5.4 | Ajustar respuestas con baja satisfacción | Dev Backend |
| 5.5 | Capacitar al equipo de InnovVentas en el dashboard | PM |

### Fase 6: Despliegue en Producción (Semana 5)
| Paso | Actividad | Responsable |
|------|-----------|-------------|
| 6.1 | Migrar PostgreSQL a Azure Database for PostgreSQL | Dev Backend |
| 6.2 | Desplegar backend en Azure Container Instances | Dev Backend |
| 6.3 | Configurar HTTPS + dominio | Dev Backend |
| 6.4 | Monitoreo activo durante las primeras 48 horas | Equipo completo |

### Fase 7: Optimización Continua (Mes 2 en adelante)
- Revisión semanal de intenciones no reconocidas
- Re-entrenamiento mensual del modelo CLU
- Análisis mensual de KPIs vs objetivos

---

## 5. Métricas de Éxito (KPIs)

| KPI | Objetivo Mes 1 | Objetivo Mes 3 |
|-----|---------------|---------------|
| Tasa de resolución sin escalado | ≥ 70% | ≥ 85% |
| CSAT promedio | ≥ 3.5/5 | ≥ 4.2/5 |
| Reducción de carritos abandonados | -10% | -25% |
| Tiempo promedio de respuesta | < 2 seg | < 1 seg |
| Consultas atendidas por día | 50+ | 200+ |

---

## 6. Conclusiones

La implementación del chatbot para InnovVentas representa una solución técnicamente sólida y económicamente viable que ataca directamente los problemas de baja conversión y alta tasa de abandono de carrito. El uso de Docker asegura portabilidad, PostgreSQL garantiza la trazabilidad de las interacciones, y el motor de lenguaje natural —**Azure CLU** en la propuesta, **Groq + Llama 3.3** en el prototipo realmente desplegado— proporciona la inteligencia conversacional necesaria para entender a los clientes peruanos. El hecho de que la solución funcione con costo cero en capa gratuita y siga siendo migrable a Azure demuestra una arquitectura desacoplada y económicamente sostenible.

La arquitectura propuesta es escalable: en una primera etapa funciona como MVP local, y en producción puede migrar fácilmente a Azure Container Instances + Azure Database for PostgreSQL sin cambios en el código.
