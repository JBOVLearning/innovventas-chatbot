# -*- coding: utf-8 -*-
"""
Genera 3 PDFs de GUION DE EXPOSICIÓN (uno por integrante) repartiendo las 21
diapositivas de la presentación, con el guion ("qué decir") por slide,
las transiciones entre expositores y un BANCO DE PREGUNTAS Y RESPUESTAS para
estar blindados en la defensa.

Re-ejecutable:  python entregable/build_guiones.py
Salida: entregable/GUION-1-Hugo.pdf, GUION-2-Henry.pdf, GUION-3-Jean.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, HRFlowable, PageBreak)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ---- Fuente con glifos Unicode (acentos, →, ≥, ≈) ----
REG, BOLD = "Helvetica", "Helvetica-Bold"
for fam, reg, bd in [("Arial", "C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf")]:
    try:
        pdfmetrics.registerFont(TTFont(fam, reg)); pdfmetrics.registerFont(TTFont(fam + "-B", bd))
        REG, BOLD = fam, fam + "-B"
    except Exception:
        pass

ACCENT = colors.HexColor("#2563EB"); INK = colors.HexColor("#161D2F")
MUTED = colors.HexColor("#64748B"); GREEN = colors.HexColor("#059669")
AMBER = colors.HexColor("#B45309"); LIGHT = colors.HexColor("#F4F7FB")
WHITE = colors.white

def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

S_KICK  = ParagraphStyle("k", fontName=BOLD, fontSize=10, textColor=ACCENT, spaceAfter=2)
S_TITLE = ParagraphStyle("t", fontName=BOLD, fontSize=26, textColor=INK, leading=30, spaceAfter=2)
S_SUB   = ParagraphStyle("s", fontName=REG, fontSize=13, textColor=INK, leading=17, spaceAfter=2)
S_META  = ParagraphStyle("m", fontName=REG, fontSize=9.5, textColor=MUTED, leading=13, spaceAfter=4)
S_H2    = ParagraphStyle("h2", fontName=BOLD, fontSize=14, textColor=INK, spaceBefore=6, spaceAfter=8)
S_SLIDE = ParagraphStyle("sl", fontName=BOLD, fontSize=11.5, textColor=WHITE, leading=15,
                         backColor=ACCENT, borderPadding=(5, 7, 5, 7), spaceBefore=12, spaceAfter=6)
S_BUL   = ParagraphStyle("b", fontName=REG, fontSize=10.3, textColor=INK, leading=14.5,
                         leftIndent=14, bulletIndent=3, spaceAfter=3)
S_NOTE  = ParagraphStyle("n", fontName=REG, fontSize=9.6, textColor=AMBER, leading=13,
                         leftIndent=4, spaceBefore=2, spaceAfter=2)
S_TRANS = ParagraphStyle("tr", fontName=BOLD, fontSize=10, textColor=GREEN, leading=13, spaceBefore=4)
S_QQ    = ParagraphStyle("qq", fontName=BOLD, fontSize=10.6, textColor=INK, leading=14, spaceBefore=8)
S_QA    = ParagraphStyle("qa", fontName=REG, fontSize=10.2, textColor=MUTED, leading=14,
                         leftIndent=10, spaceAfter=2)

def bullets(items):
    return [Paragraph(esc(x), S_BUL, bulletText="•") for x in items]

# =================== GUION POR DIAPOSITIVA ===================
SCRIPTS = {
 1: ("Portada", [
    "Saluda y presenta al equipo y el proyecto: «Nova», el chatbot para el e-commerce de InnovVentas, trabajo final del curso AI-900.",
    "Anuncia el hilo de la exposición: diagnóstico → causa → solución → implementación."], None),
 2: ("Agenda", [
    "Resume el recorrido en una frase: problema y su causa, la solución Nova, decisiones tecnológicas y costos, diseño, implementación, métricas y un demo en vivo."], None),
 3: ("Diagnóstico — Contexto: InnovVentas", [
    "InnovVentas vende productos tecnológicos; su canal principal es el e-commerce.",
    "El problema: baja interacción en la web que golpea las ventas y la retención.",
    "El cliente necesita: inmediatez (24/7), cobertura de todo el ciclo, integración no intrusiva y métricas."], None),
 4: ("Diagnóstico — Problemas", [
    "Cuatro problemas concretos del flujo: carritos abandonados; consultas sin respuesta (specs, pago, stock); soporte lento (24–48 h); y falta de visibilidad para optimizar."], None),
 5: ("Causa → Solución", [
    "La causa raíz: no hay respuestas rápidas en el momento de la compra.",
    "Nova ataca cada causa: responde FAQs al instante, atiende 24/7 y registra todo para mejorar de forma continua.",
    "Esta es la diapositiva clave: muestra problema, causa y solución en una sola vista."], None),
 6: ("Solución — Nova", [
    "Presenta a Nova: responde FAQs, asiste la compra, da soporte 24/7 y mide su impacto.",
    "Entiende lenguaje natural con un LLM, pero responde solo con la información de InnovVentas (no inventa).",
    "Recalca que SÍ tiene nombre y personalidad: humaniza la marca."],
    "Transición: «Le paso la palabra a Henry para la parte técnica y de costos.»"),
 7: ("Decisión tecnológica — Azure y alternativas", [
    "El curso es de Azure; la opción ideal era Azure AI Language (CLU).",
    "Al agotarse el crédito de estudiante, elegimos alternativas de capa gratuita equivalentes: Groq, Render, Neon y Netlify.",
    "Clave: la arquitectura es desacoplada y migrable a Azure sin reescribir código."], None),
 8: ("Stack tecnológico", [
    "Frontend: HTML/CSS/JS vanilla (embebible con un <script>).",
    "Backend: Python + FastAPI. Motor NLP: LLM Groq (Llama 3.3) con las FAQs como contexto.",
    "Base de datos: PostgreSQL (Neon). Despliegue: Render + Netlify."], None),
 9: ("Costos", [
    "Costo del MVP actual: US$ 0 — todo en capa gratuita.",
    "Producción estimada en Azure: ≈ US$ 60/mes (referencial según volumen).",
    "Desarrollo: equipo de 3 personas, ~4 semanas (costo académico)."], None),
 10: ("Retorno de inversión (ROI)", [
    "Cómo gana InnovVentas: ventas recuperadas, ahorro en soporte, retención y datos accionables.",
    "Con costo casi nulo, el payback es inmediato: recuperando 1–2 ventas al mes el bot ya se paga.",
    "Estimación ilustrativa: recuperar el 5% de carritos abandonados ≈ S/ 29,750/mes adicionales (supuestos declarados)."], None),
 11: ("Diseño — FAQs por categoría", [
    "La base de conocimiento son 6 categorías: productos, precios, pagos, compra, envíos y soporte.",
    "Si la consulta no está cubierta, Nova no inventa: deriva a un humano (fallback)."], None),
 12: ("Diseño — Flujo conversacional", [
    "Flujo: el usuario escribe → Nova procesa (LLM + FAQs) → responde → registra en PostgreSQL → encuesta CSAT.",
    "Refuerza el manejo del fallback: si no está cubierto, deriva y se registra para mejorar las FAQs."], None),
 13: ("Diseño — Arquitectura técnica", [
    "Tres capas: Frontend (Netlify) → Backend FastAPI (Render) → Motor NLP (Groq) + Base de datos (Neon).",
    "Seguridad: HTTPS, claves solo en el backend, sin datos personales sensibles (Ley N° 29733)."], None),
 14: ("Diseño — Modelo de datos y entorno", [
    "Entorno con Docker + Docker Compose: un comando levanta el backend y PostgreSQL juntos; mismo entorno en desarrollo y producción (portable, listo para Azure Container Instances).",
    "init.sql crea el esquema y siembra las 18 FAQs al iniciar la base de datos.",
    "Modelo de datos: 4 tablas — faqs (conocimiento), sessions, chat_logs (mensaje + intención) y feedback (CSAT) — más vistas SQL para el dashboard."],
    "Transición: «Jean continúa con la implementación, métricas y el demo en vivo.»"),
 15: ("Implementación — Plan", [
    "Cinco pasos: 1) diseño y FAQs, 2) backend + BD, 3) bot + frontend, 4) integración (<script> + CORS), 5) despliegue y pruebas."], None),
 16: ("Implementación — Métricas", [
    "Objetivos: resolución sin agente ≥ 85%, CSAT ≥ 4.2/5, abandono −25%, respuesta < 2 s.",
    "Se monitorea en vivo desde PostgreSQL: conversaciones, top intenciones, fallback, CSAT y resolución."], None),
 17: ("Preguntas guía (1–3)", [
    "Lee/parafrasea: 1) FAQs más comunes, 2) herramientas/plataformas adecuadas, 3) cómo evaluar la efectividad (satisfacción y ventas)."], None),
 18: ("Preguntas guía (4–5)", [
    "Lee/parafrasea: 4) desafíos técnicos y cómo resolverlos, 5) métricas a monitorear y cómo optimizar."], None),
 19: ("Demo en vivo", [
    "Muestra: la tienda con Nova flotante, una conversación real (con persistencia) y el dashboard de métricas.",
    "Ten una pregunta de ejemplo lista (p. ej. «¿aceptan Yape?» o «¿cuánto demora el envío a provincia?»)."],
    "Aviso: si el backend (Render free) estuvo inactivo, la 1ª respuesta tarda ~30 s al «despertar». Adviértelo tú primero."),
 20: ("Limitaciones y trabajo futuro", [
    "Sé transparente: sin inventario en vivo, el free tier «duerme», solo español, FAQs gestionadas por BD.",
    "Roadmap: integrar el catálogo, migrar a Azure, multiidioma y panel de administración de FAQs.",
    "Mensaje: nombrar los límites y el roadmap demuestra madurez del proyecto."], None),
 21: ("Conclusiones", [
    "Nova ataca la causa raíz del abandono; funciona desplegada con costo cero; es migrable a Azure; y todo se mide para mejorar."], None),
 22: ("Cierre — ¡Gracias!", [
    "Agradece y abre el turno de preguntas. Invita a probar a Nova en vivo."], None),
}

# =================== REPARTO ===================
MEMBERS = [
    ("Hugo André Cahua Solano",      "Hugo",  "Apertura y diagnóstico",          list(range(1, 7))),
    ("Henry Humberto Cruces Castro", "Henry", "Tecnología, costos y diseño",     list(range(7, 15))),
    ("Jean Beckan Olivitos Villanueva", "Jean", "Implementación, demo y cierre", list(range(15, 23))),
]

# =================== BANCO DE PREGUNTAS ===================
QA = [
 ("¿Cómo se llama el chatbot?", "Se llama Nova. Tiene nombre y personalidad (amigable, conciso, español peruano): humaniza la marca y lo diferencia de un chatbot genérico.", "Hugo"),
 ("¿El bot conoce el stock y el precio real de cada producto?", "No en el MVP: Nova atiende FAQs y políticas, y deriva a la ficha del producto. Integrar el inventario en tiempo real es trabajo futuro (decisión de alcance, no una falla).", "Hugo"),
 ("¿Qué problema concreto resuelve?", "El abandono de carrito por falta de respuestas rápidas. Nova responde en el momento de la compra y guía el checkout.", "Hugo"),
 ("¿Por qué no usaron Azure si el curso es de Azure?", "Era la opción ideal, pero se agotó el crédito de estudiante. Usamos alternativas gratuitas equivalentes y la arquitectura permite volver a Azure sin reescribir código.", "Henry"),
 ("¿Cuál es el retorno de inversión (ROI)?", "El costo de operación es casi nulo, así que el payback es inmediato: recuperando 1–2 ventas al mes ya se paga. Con supuestos conservadores, ~S/ 29,750/mes adicionales.", "Henry"),
 ("¿Cómo gana dinero InnovVentas con el bot?", "Ventas recuperadas, ahorro en soporte (menos tickets), mayor retención y datos accionables del dashboard.", "Henry"),
 ("¿Es seguro? ¿Qué pasa con los datos personales?", "No se almacenan datos sensibles, los logs son anónimos, todo va por HTTPS y las claves viven en el backend. Alineado a la Ley N° 29733 (Perú).", "Henry"),
 ("¿Escala si crece la demanda?", "FastAPI es asíncrono y la arquitectura está desacoplada: migra a Azure Container Instances + Azure DB sin reescribir código.", "Henry"),
 ("¿Y si el LLM inventa información incorrecta?", "Responde solo con las FAQs (grounding) y un prompt estricto; si no está cubierto, deriva a un humano. No improvisa precios ni specs.", "Henry"),
 ("¿Cómo levantaron el entorno de desarrollo?", "Con Docker + Docker Compose: un solo comando levanta el backend y PostgreSQL con el mismo entorno en desarrollo y producción. El esquema y las FAQs se cargan con init.sql.", "Henry"),
 ("¿Cuál es el modelo de datos? ¿Qué hace init.sql?", "init.sql crea 4 tablas en PostgreSQL —faqs (conocimiento), sessions, chat_logs (mensaje + intención + confianza) y feedback (CSAT 1–5)— y siembra 18 FAQs, más vistas para el dashboard.", "Henry"),
 ("En el demo, ¿por qué tarda la primera respuesta?", "Es el plan gratuito de Render que «duerme» tras inactividad (~30 s al despertar). En producción/Azure no ocurre.", "Jean"),
 ("¿Cómo se integra al sitio web existente?", "Con un widget embebible: dos líneas de <script> en cualquier página, y CORS configurado en el backend.", "Jean"),
 ("¿Quién mantiene y actualiza las FAQs?", "Hoy se editan en la base de datos; el trabajo futuro incluye un panel de administración para hacerlo sin código.", "Jean"),
 ("¿Cómo se valida que cumple? (normas y medio ambiente)", "Seguridad de la información (HTTPS, datos protegidos) y bajo impacto ambiental por ser una solución cloud serverless, sin hardware adicional.", "Jean"),
]

def build(fullname, short, role, slides):
    path = f"entregable/GUION-{['Hugo','Henry','Jean'].index(short)+1}-{short}.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4,
                            leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm, bottomMargin=18*mm,
                            title=f"Guion de exposición — {fullname}")
    story = [
        Paragraph("GUION DE EXPOSICIÓN", S_KICK),
        Paragraph(esc(fullname), S_TITLE),
        Paragraph(esc(role), S_SUB),
        Paragraph(f"Diapositivas {slides[0]}–{slides[-1]}  ·  Proyecto «Nova» · InnovVentas · AI-900T00 (SENATI)", S_META),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceBefore=6, spaceAfter=2),
    ]
    for n in slides:
        title, bul, extra = SCRIPTS[n]
        story.append(Paragraph(f"Diapositiva {n} — {esc(title)}", S_SLIDE))
        story += bullets(bul)
        if extra:
            sty = S_TRANS if extra.startswith("Transición") else S_NOTE
            story.append(Paragraph(("➜ " if sty is S_TRANS else "⚠ ") + esc(extra), sty))

    story.append(PageBreak())
    story.append(Paragraph("Banco de preguntas y respuestas (blindaje)", S_H2))
    mine = [x for x in QA if x[2] == short]
    rest = [x for x in QA if x[2] != short]
    if mine:
        story.append(Paragraph("Más probables para tu bloque:", S_SUB))
        for q, a, _ in mine:
            story.append(Paragraph("★ " + esc(q), S_QQ)); story.append(Paragraph(esc(a), S_QA))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Banco completo (todos deben conocerlo):", S_SUB))
    for q, a, _ in rest:
        story.append(Paragraph(esc(q), S_QQ)); story.append(Paragraph(esc(a), S_QA))

    def deco(canvas, d):
        canvas.saveState()
        canvas.setFillColor(ACCENT); canvas.rect(0, 0, 8*mm, A4[1], fill=1, stroke=0)
        canvas.setFont(REG, 8); canvas.setFillColor(MUTED)
        canvas.drawString(20*mm, 10*mm, f"Guion — {fullname} · Nova · AI-900T00")
        canvas.drawRightString(A4[0]-20*mm, 10*mm, f"Pág. {d.page}")
        canvas.restoreState()
    doc.build(story, onFirstPage=deco, onLaterPages=deco)
    return path

for fullname, short, role, slides in MEMBERS:
    print("OK ->", build(fullname, short, role, slides))
