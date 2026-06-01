-- ============================================
-- InnovVentas Chatbot — Schema PostgreSQL
-- ============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Tabla: faqs (base de conocimiento del bot)
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    intent VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[], -- palabras clave para matching offline
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Tabla: sessions (sesiones de conversación)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    escalated BOOLEAN DEFAULT false,
    last_intent VARCHAR(100),
    fallback_count INTEGER DEFAULT 0
);

-- ============================================
-- Tabla: chat_logs (historial de mensajes)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_logs (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'bot')),
    message TEXT NOT NULL,
    intent VARCHAR(100),
    confidence FLOAT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Tabla: feedback (encuesta CSAT)
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    score INTEGER CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Índices para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_intent ON chat_logs(intent);
CREATE INDEX IF NOT EXISTS idx_faqs_intent ON faqs(intent);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);

-- ============================================
-- DATOS INICIALES — FAQs de InnovVentas
-- ============================================

INSERT INTO faqs (intent, category, question, answer, keywords) VALUES

-- SALUDO
('saludo', 'general',
 '¿Cómo puedo empezar?',
 '¡Hola! Soy Nova, el asistente virtual de InnovVentas 👋. Puedo ayudarte con:\n• 🔍 Información de productos\n• 💳 Métodos de pago\n• 🚚 Envíos y rastreo de pedidos\n• 🔧 Soporte técnico\n\n¿En qué te puedo ayudar hoy?',
 ARRAY['hola', 'buenas', 'hey', 'inicio', 'ayuda']),

-- PRODUCTOS
('consulta_producto', 'productos',
 '¿Cómo consulto las especificaciones de un producto?',
 'Puedo ayudarte con las especificaciones técnicas de cualquier producto de nuestro catálogo. Solo dime el nombre o modelo del producto y te doy todos los detalles: procesador, memoria RAM, almacenamiento, pantalla y más. ¿Qué producto te interesa?',
 ARRAY['especificaciones', 'especificacion', 'caracteristicas', 'specs', 'procesador', 'ram', 'memoria', 'laptop', 'celular', 'tablet']),

('disponibilidad', 'productos',
 '¿Tienen stock del producto X?',
 'Para verificar la disponibilidad de un producto en tiempo real, puedes: \n1. Buscarlo en nuestra web y revisar si dice "En stock"\n2. Decirme el nombre del producto aquí y lo verifico para ti\n\nRecuerda que el stock puede cambiar rápidamente en productos de alta demanda.',
 ARRAY['stock', 'disponible', 'disponibilidad', 'hay', 'tienen', 'queda']),

('garantia', 'productos',
 '¿Qué garantía tienen los productos?',
 'Todos nuestros productos cuentan con:\n• **Garantía oficial del fabricante:** 12 meses (varía por marca)\n• **Garantía InnovVentas:** 30 días por defectos de fábrica\n\nPara laptops y equipos de cómputo: 12 meses de garantía de fábrica + soporte técnico gratuito por 3 meses.',
 ARRAY['garantia', 'garantías', 'fallo', 'defecto', 'dañado', 'meses']),

-- PRECIOS Y DESCUENTOS
('precio', 'precios',
 '¿Cómo sé el precio de un producto?',
 'Los precios están publicados en nuestro sitio web y se actualizan en tiempo real. Todos los precios incluyen IGV (18%). Si me dices qué producto buscas, te puedo dar el precio actual directamente aquí.',
 ARRAY['precio', 'cuesta', 'vale', 'costo', 'igv', 'impuesto', 'sol', 'soles']),

('descuentos', 'precios',
 '¿Tienen descuentos o promociones?',
 '¡Sí! Tenemos promociones frecuentes:\n• **Descuentos por temporada** (Cyber Monday, 28 de julio, Navidad)\n• **Cupones de descuento** para suscriptores del newsletter\n• **Descuentos por volumen** para compras empresariales\n\nRevisa la sección "Ofertas" en nuestra web para ver las promociones vigentes de hoy.',
 ARRAY['descuento', 'oferta', 'promocion', 'cupon', 'rebaja', 'barato', 'sale']),

-- MÉTODOS DE PAGO
('metodo_pago', 'pagos',
 '¿Qué métodos de pago aceptan?',
 'Aceptamos los siguientes métodos de pago:\n• 💳 Tarjetas de crédito/débito: Visa, Mastercard, American Express\n• 📱 Yape y Plin\n• 🏦 Transferencia bancaria (BCP, Interbank, BBVA, Scotiabank)\n• 💰 Pago contra entrega (Lima Metropolitana)\n• 🛒 Cuotas sin intereses (desde S/ 300 con Visa o Mastercard)',
 ARRAY['pago', 'pagar', 'yape', 'plin', 'visa', 'mastercard', 'tarjeta', 'transferencia', 'efectivo', 'banco']),

('cuotas', 'pagos',
 '¿Puedo pagar en cuotas?',
 'Sí, ofrecemos cuotas sin intereses con:\n• Visa: hasta 12 cuotas sin intereses (compras mínimas de S/ 300)\n• Mastercard: hasta 6 cuotas sin intereses (compras mínimas de S/ 300)\n• BBVA Crédito: hasta 24 cuotas (con intereses del banco)\n\nEl botón de cuotas aparece automáticamente en el checkout cuando pagas con tarjeta de crédito elegible.',
 ARRAY['cuotas', 'financiamiento', 'meses', 'letras', 'credito', 'intereses', 'plazo']),

('seguridad_pago', 'pagos',
 '¿Es seguro pagar en la web de InnovVentas?',
 '¡Completamente seguro! Nuestro sitio cuenta con:\n• 🔒 Certificado SSL (candado verde en tu navegador)\n• Pasarela de pago certificada PCI DSS\n• Tokenización de tarjetas (no guardamos tus datos de tarjeta)\n• Sistema antifraude activo 24/7',
 ARRAY['seguro', 'seguridad', 'confiable', 'fraude', 'ssl', 'datos', 'robo']),

-- PROCESO DE COMPRA
('proceso_compra', 'compra',
 '¿Cómo realizo una compra paso a paso?',
 'Comprar en InnovVentas es muy fácil:\n1. 🔍 Busca el producto que deseas\n2. 🛒 Haz clic en "Agregar al carrito"\n3. 👤 Inicia sesión o continúa como invitado\n4. 📍 Ingresa tu dirección de entrega\n5. 💳 Elige tu método de pago\n6. ✅ Confirma el pedido\n7. 📧 Recibirás un email de confirmación inmediatamente',
 ARRAY['comprar', 'como compro', 'pasos', 'proceso', 'pedido', 'carrito', 'checkout']),

('cancelar_pedido', 'compra',
 '¿Puedo cancelar o modificar mi pedido?',
 'Puedes cancelar tu pedido **dentro de las 2 horas siguientes** a la compra, siempre que no haya salido de nuestro almacén. Para cancelar:\n1. Ve a "Mis Pedidos" en tu cuenta\n2. Selecciona el pedido y haz clic en "Cancelar"\n\nSi ya fue enviado, deberás rechazar el paquete en la entrega o solicitar una devolución.',
 ARRAY['cancelar', 'cancelacion', 'modificar', 'cambiar', 'anular', 'pedido']),

-- ENVÍOS
('envio_tiempo', 'envios',
 '¿Cuánto demora el envío?',
 'Los tiempos de entrega son:\n• 🏙️ **Lima Metropolitana:** 1-2 días hábiles\n• 🚀 **Express Lima:** mismo día (pedidos antes de las 12pm, costo adicional)\n• 🇵🇪 **Provincias:** 3-7 días hábiles (varía por destino)\n• 🏔️ **Zonas rurales:** 7-15 días hábiles\n\n*Los plazos corren desde la confirmación del pago.*',
 ARRAY['envio', 'entrega', 'demora', 'tiempo', 'cuanto', 'dias', 'rapido', 'delivery']),

('costo_envio', 'envios',
 '¿Cuánto cuesta el envío?',
 'Los costos de envío son:\n• Lima Metropolitana: **S/ 10** (gratis en compras mayores a S/ 200)\n• Lima Express (mismo día): **S/ 25**\n• Provincias principales: **S/ 20 - S/ 35**\n• Provincias remotas: desde **S/ 40**\n\nEl costo exacto se calcula en el checkout según tu dirección.',
 ARRAY['costo envio', 'precio envio', 'flete', 'costo delivery', 'cuanto delivery', 'gratis']),

('rastreo_pedido', 'envios',
 '¿Cómo rastro mi pedido?',
 'Tienes dos formas de rastrear tu pedido:\n1. **Por email:** te enviamos el número de guía cuando sale del almacén\n2. **En tu cuenta:** ve a "Mis Pedidos" → selecciona el pedido → "Rastrear"\n\n¿Tienes tu número de pedido a mano? Puedo darte el estado actual.',
 ARRAY['rastrear', 'rastreo', 'seguimiento', 'donde esta', 'estado pedido', 'guia', 'numero']),

-- SOPORTE POST-VENTA
('devolucion', 'soporte',
 '¿Cómo devuelvo un producto?',
 'Aceptamos devoluciones dentro de los **30 días** de recibido el producto si:\n• El producto tiene un defecto de fábrica\n• Llegó dañado\n• No corresponde a lo que pediste\n\nPara iniciar una devolución:\n1. Escríbenos a soporte@innovventas.pe\n2. O llama al 01-234-5678\n3. Adjunta foto del producto y número de pedido\n\nEl reembolso se procesa en 5-7 días hábiles.',
 ARRAY['devolver', 'devolucion', 'reembolso', 'cambio', 'retorno', 'reclamo', 'defecto']),

('soporte_tecnico', 'soporte',
 '¿Cómo obtengo soporte técnico?',
 'Ofrecemos soporte técnico por varios canales:\n• 📧 **Email:** soporte@innovventas.pe (respuesta en 24h)\n• 📞 **Teléfono:** 01-234-5678 (Lun-Vie 9am-6pm)\n• 💬 **Este chat:** para consultas básicas inmediatas\n• 🏪 **Tienda física:** Jr. Lampa 123, Cercado de Lima\n\n¿Cuál es el problema técnico que tienes?',
 ARRAY['soporte', 'tecnico', 'servicio', 'reparacion', 'problema', 'no funciona', 'falla']),

-- CONTACTO
('contacto', 'general',
 '¿Cómo contacto a InnovVentas?',
 'Puedes contactarnos por:\n• 📧 **Email general:** info@innovventas.pe\n• 📧 **Soporte:** soporte@innovventas.pe\n• 📞 **Teléfono:** 01-234-5678\n• 🏪 **Tienda:** Jr. Lampa 123, Cercado de Lima (Lun-Sáb 9am-7pm)\n• 📱 **WhatsApp Business:** +51 999 123 456',
 ARRAY['contacto', 'contactar', 'telefono', 'email', 'correo', 'donde', 'direccion', 'whatsapp']),

-- DESPEDIDA
('despedida', 'general',
 '¿Hasta luego?',
 '¡Fue un placer ayudarte! 😊 Antes de irte, ¿podrías calificar mi atención del 1 al 5? Tu feedback nos ayuda a mejorar. Si necesitas algo más, ¡aquí estaré! Hasta pronto 👋',
 ARRAY['gracias', 'adios', 'hasta luego', 'bye', 'chau', 'ok gracias', 'listo']);

-- ============================================
-- Vista útil para el dashboard de métricas
-- ============================================
CREATE OR REPLACE VIEW v_daily_metrics AS
SELECT
    DATE(cl.timestamp) AS fecha,
    COUNT(DISTINCT cl.session_id) AS sesiones_total,
    COUNT(CASE WHEN s.resolved = true THEN 1 END) AS sesiones_resueltas,
    COUNT(CASE WHEN s.escalated = true THEN 1 END) AS sesiones_escaladas,
    AVG(f.score) AS csat_promedio,
    COUNT(CASE WHEN cl.role = 'user' THEN 1 END) AS mensajes_usuarios
FROM chat_logs cl
LEFT JOIN sessions s ON cl.session_id = s.id
LEFT JOIN feedback f ON s.id = f.session_id
GROUP BY DATE(cl.timestamp)
ORDER BY fecha DESC;

-- Vista de intenciones más frecuentes
CREATE OR REPLACE VIEW v_top_intents AS
SELECT
    intent,
    COUNT(*) AS total,
    ROUND(AVG(confidence) * 100, 1) AS confianza_promedio_pct
FROM chat_logs
WHERE role = 'user' AND intent IS NOT NULL AND intent != 'fallback'
GROUP BY intent
ORDER BY total DESC;
