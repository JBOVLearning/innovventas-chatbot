# Diagrama de Flujo Conversacional — Chatbot InnovVentas
## Mapa Conversacional del Chatbot

---

## Flujo Principal (Mermaid)

```mermaid
flowchart TD
    A([Usuario abre el chat]) --> B[Bot: Saludo\n'¡Hola! Soy Nova, el asistente virtual\nde InnovVentas. ¿En qué te ayudo?']
    B --> C{¿Qué necesita el usuario?}

    C --> D[🔍 Consulta de Producto]
    C --> E[🛒 Proceso de Compra]
    C --> F[💳 Métodos de Pago]
    C --> G[🚚 Envío / Rastreo]
    C --> H[🔧 Soporte Técnico]
    C --> I[❓ Otra consulta]

    D --> D1[Bot muestra especificaciones\ndel producto consultado]
    D1 --> D2{¿Resuelto?}
    D2 --> |Sí| Z
    D2 --> |No| X

    E --> E1[Bot guía paso a paso:\n1. Agregar al carrito\n2. Checkout\n3. Pago\n4. Confirmación]
    E1 --> E2{¿Resuelto?}
    E2 --> |Sí| Z
    E2 --> |No| X

    F --> F1[Bot lista métodos:\nTarjetas Visa/MC, Yape,\nPlin, Transferencia, Cuotas]
    F1 --> F2{¿Resuelto?}
    F2 --> |Sí| Z
    F2 --> |No| X

    G --> G1{¿Tiene número de pedido?}
    G1 --> |Sí| G2[Bot consulta estado del pedido\nen la base de datos]
    G1 --> |No| G3[Bot solicita email\nde la cuenta]
    G2 --> G4[Muestra estado: Procesando /\nEnviado / Entregado]
    G3 --> G4
    G4 --> Z

    H --> H1[Bot pregunta:\n¿Garantía, devolución\no problema técnico?]
    H1 --> H2[Ofrece pasos de solución\no inicia ticket de soporte]
    H2 --> Z

    I --> I1[Azure CLU intenta\ndetectar intención]
    I1 --> I2{¿Confianza > 70%?}
    I2 --> |Sí| I3[Responde con FAQ correspondiente]
    I2 --> |No| X

    X[🔄 Fallback:\n'No entendí tu consulta.\n¿Puedo ayudarte con alguna\nde estas opciones?']
    X --> C

    Z([⭐ Encuesta de satisfacción 1-5\n+ Cierre de sesión])
    Z --> ZZ[Guardar log en PostgreSQL]
```

---

## Flujo de Escalado a Agente Humano

```mermaid
flowchart LR
    A[Usuario insatisfecho\no consulta compleja] --> B{3 intentos\nfallidos?}
    B --> |Sí| C[Bot: 'Permíteme\nconectarte con un\nasistente humano']
    B --> |No| D[Reintentar con\notra pregunta aclaratoria]
    C --> E[Guardar contexto\nde conversación]
    E --> F[Notificar al equipo\nde soporte por email]
    F --> G[Agente humano\ntoma el hilo]
```

---

## Intenciones del Bot (Intents)

| Intent | Ejemplos de Utterances | Respuesta |
|--------|----------------------|-----------|
| `saludo` | "hola", "buenas", "hey" | Saludo + menú principal |
| `consulta_producto` | "¿qué procesador tiene el laptop X?", "especificaciones del celular Y" | Info del producto desde BD |
| `disponibilidad` | "¿tienen stock?", "¿está disponible?" | Consultar inventario |
| `precio` | "¿cuánto cuesta?", "precio del monitor Z" | Precio actual |
| `metodo_pago` | "¿aceptan Yape?", "¿pago con tarjeta?" | Lista de métodos de pago |
| `proceso_compra` | "¿cómo compro?", "no sé cómo pagar" | Guía paso a paso |
| `cuotas` | "¿hay financiamiento?", "¿pago en cuotas?" | Info de financiamiento |
| `envio_tiempo` | "¿cuánto demora el envío?", "¿llegan a provincia?" | Tiempos y costos |
| `rastreo_pedido` | "¿dónde está mi pedido?", "quiero rastrear mi compra" | Estado del pedido |
| `garantia` | "¿qué garantía tiene?", "mi producto falló" | Info de garantía + soporte |
| `devolucion` | "quiero devolver un producto", "no me llegó bien" | Política de devoluciones |
| `contacto` | "quiero hablar con un agente", "teléfono de contacto" | Datos de contacto |
| `despedida` | "gracias", "hasta luego", "adiós" | Despedida + encuesta CSAT |
| `fallback` | Cualquier consulta no reconocida | Menú de opciones + opción de escalar |

---

## Estados de la Conversación

```
INICIO → IDENTIFICANDO_INTENCION → RESPONDIENDO → [RESOLVIENDO | ESCALANDO] → CERRANDO → FIN
```

### Detalle de Estados
- **INICIO:** saludo automático del bot
- **IDENTIFICANDO_INTENCION:** Azure CLU procesa el mensaje
- **RESPONDIENDO:** bot entrega respuesta de la FAQ o consulta la BD
- **RESOLVIENDO:** intercambio de mensajes hasta resolver la duda
- **ESCALANDO:** 3 fallbacks consecutivos → derivar a humano
- **CERRANDO:** encuesta CSAT + guardar log
- **FIN:** sesión cerrada en PostgreSQL
