# UI_SPEC.md — Especificaciones Visuales
## InnovVentas E-commerce + Chatbot Nova

> **Propósito de este archivo:** Dar a Claude Code instrucciones visuales precisas para que `index.html` y `dashboard.html` parezcan un e-commerce tecnológico real. No añadir páginas nuevas. No inventar funcionalidad que no existe. Solo hacer que lo que ya está se vea profesional y coherente.

---

## Identidad de Marca — InnovVentas

### Nombre y Concepto
**InnovVentas** — tienda de tecnología peruana. Tono: moderno, confiable, accesible. Piensa en el cruce entre Falabella Tech y una tienda especializada tipo PC Factory. No es lujo, es tecnología accesible para el mercado peruano.

### Paleta de Colores (CSS variables obligatorias)
```css
:root {
  --brand-primary:    #0057FF;   /* azul eléctrico — color dominante */
  --brand-secondary:  #00C2FF;   /* cian claro — degradado y acentos */
  --brand-dark:       #0A0F1E;   /* casi negro azulado — fondos oscuros */
  --brand-surface:    #111827;   /* gris oscuro azulado — cards */
  --brand-surface-2:  #1C2333;   /* superficie elevada */
  --brand-border:     #1E2D40;   /* bordes sutiles */
  --brand-text:       #F0F4FF;   /* texto principal */
  --brand-muted:      #8899BB;   /* texto secundario */
  --brand-accent:     #FF6B2B;   /* naranja — badges de oferta, CTAs secundarios */
  --brand-success:    #00D97E;   /* verde — stock disponible */
  --brand-error:      #FF4D4D;   /* rojo — stock agotado */
  --gradient-hero:    linear-gradient(135deg, #0057FF 0%, #00C2FF 100%);
  --gradient-card:    linear-gradient(145deg, #111827 0%, #1C2333 100%);
}
```

### Tipografía
```html
<!-- En el <head> de ambos archivos -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```
- **Display / Títulos grandes:** `Syne` (800) — impacto, tecnológico
- **Cuerpo / UI:** `DM Sans` (400, 500, 600) — legible, limpio
- **Precio / Números:** `DM Sans` 600 con `font-variant-numeric: tabular-nums`

### Modo: Dark Theme
Fondo base `#0A0F1E`. El tema oscuro da sensación tech/premium sin esfuerzo y es estándar en e-commerce de tecnología.

---

## `index.html` — E-commerce InnovVentas + Widget Nova

### Estructura de Secciones (en orden, de arriba hacia abajo)

```
[NAVBAR]
[HERO BANNER]
[BARRA DE CATEGORÍAS]
[PRODUCTOS DESTACADOS]  ← grid de tarjetas de producto
[BANNER CTA "OFERTA DEL DÍA"]
[FOOTER]
[CHATBOT WIDGET NOVA]   ← botón flotante bottom-right
```

---

### NAVBAR

**Altura:** 64px  
**Fondo:** `#0A0F1E` con `border-bottom: 1px solid var(--brand-border)`  
**Sticky:** sí, `position: sticky; top: 0; z-index: 100`  
**Con backdrop-blur** cuando se hace scroll: `backdrop-filter: blur(12px); background: rgba(10,15,30,0.85)`

Contenido del navbar (de izquierda a derecha):
1. **Logo** — texto "Innov**Ventas**" donde "Innov" es blanco y "Ventas" es `var(--brand-primary)`, fuente Syne 800, tamaño 22px. Anteponer un ícono SVG inline simple (un rayo ⚡ o chip) en azul.
2. **Buscador central** — input con icono lupa, fondo `var(--brand-surface)`, border `var(--brand-border)`, border-radius 8px, placeholder "Buscar laptops, celulares, accesorios…", width 380px máximo, focus con glow azul.
3. **Lado derecho:** íconos de corazón (favoritos), carrito con badge contador (número "3" en círculo naranja), y botón "Iniciar sesión" con borde azul.

---

### HERO BANNER

**Altura:** 480px desktop  
**Fondo:** gradiente diagonal `var(--gradient-hero)` + patrón de puntos CSS superpuesto (dot grid pattern con `radial-gradient` en blanco 5% opacidad, 20px spacing).  
**Layout:** dos columnas 55% texto / 45% imagen.

Columna izquierda:
- Badge pill arriba: `🔥 OFERTA DE LANZAMIENTO` — fondo blanco 10% opacidad, texto blanco, border-radius 20px, font-size 11px uppercase.
- Título H1: `"Tecnología que transforma tu vida"` — Syne 800, 48px, blanco, line-height 1.1.
- Subtítulo: `"Las mejores marcas. Los mejores precios. Envío gratis a Lima."` — DM Sans, 16px, blanco 80% opacidad.
- Dos botones:
  - Primario: `"Ver ofertas"` — fondo blanco, texto `var(--brand-primary)`, hover: scale 1.02.
  - Secundario: `"Ver catálogo"` — borde blanco, texto blanco, hover: fondo blanco 10%.

Columna derecha:
- Imagen del producto destacado (usar un placeholder con `background: rgba(255,255,255,0.1)`, border-radius 16px, height 300px, con texto centrado "📦 Laptop Gaming X1" o similiar con íconos Unicode). Si no hay imagen real, simular con un card elegante con especificaciones del producto.

---

### BARRA DE CATEGORÍAS

**Diseño:** fila horizontal con scroll horizontal en mobile, centrada en desktop.  
**Fondo:** `var(--brand-surface)`, padding 16px 0, `border-bottom: 1px solid var(--brand-border)`

Categorías (íconos emoji + texto):
- 💻 Laptops
- 📱 Smartphones  
- 🖥️ Monitores
- ⌨️ Periféricos
- 🎧 Audio
- 📷 Cámaras
- 🔌 Accesorios
- 🎮 Gaming

Cada categoría: chip pill con hover que activa fondo `var(--brand-primary)` 20% y borde azul. Cursor pointer.

---

### PRODUCTOS DESTACADOS

**Título de sección:** `"Productos Destacados"` — Syne 700, 28px, con una línea decorativa izquierda en azul (4px ancho, 100% alto, border-left).

**Grid:** `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`, gap 20px.

**Producto Card** (estructura de cada tarjeta):
```
┌──────────────────────────────┐
│  [badge "OFERTA" naranja]    │  ← absoluto top-left, solo si aplica
│                              │
│     [imagen / placeholder]   │  ← 200px alto, fondo surface-2, objeto centrado
│     (emoji grande del        │
│      producto centrado)      │
├──────────────────────────────┤
│  Marca: ASUS | Categoría     │  ← muted, 11px uppercase
│  Nombre del Producto Largo   │  ← blanco, 14px, 2 líneas máx, DM Sans 500
│                              │
│  ⭐⭐⭐⭐⭐ (4.5)  128 reseñas │  ← amarillo, 12px
│                              │
│  ~~S/ 2,499~~  S/ 1,999      │  ← tachado muted + precio azul eléctrico 22px bold
│  Ahorra S/ 500 (20% OFF)     │  ← verde, 12px
│                              │
│  [✓ En stock]                │  ← verde success, 12px
│                              │
│  [    Agregar al carrito   ] │  ← botón full-width, fondo azul, hover más oscuro
└──────────────────────────────┘
```

**Efectos del card:**
- Fondo: `var(--gradient-card)`
- Border: `1px solid var(--brand-border)`
- Border-radius: 12px
- Hover: `transform: translateY(-4px)` + `box-shadow: 0 12px 32px rgba(0,87,255,0.2)` con transición 200ms ease
- La imagen/placeholder tiene `overflow: hidden` y hace zoom suave en hover (`scale: 1.05` con 300ms)

**Productos de ejemplo a usar** (todos ficticios pero creíbles):
1. 💻 ASUS VivoBook 15 — Intel i5, 8GB RAM, 512GB SSD — S/ 1,999 (antes S/ 2,499)
2. 📱 Samsung Galaxy A55 — 6.6" AMOLED, 256GB — S/ 1,299 (antes S/ 1,599)
3. 🖥️ LG UltraWide 29" — 2560x1080, 75Hz — S/ 1,150 (antes S/ 1,350)
4. ⌨️ Logitech MX Keys — Teclado inalámbrico premium — S/ 499 (antes S/ 599)
5. 🎧 Sony WH-1000XM5 — Noise cancelling, 30h batería — S/ 1,099 (antes S/ 1,399)
6. 🖱️ Razer DeathAdder V3 — Gaming 30000 DPI — S/ 349 (antes S/ 429)
7. 📷 Logitech C920 HD — Webcam 1080p 30fps — S/ 299 (antes S/ 379)
8. 🎮 Control Xbox Series — Inalámbrico PC/Console — S/ 259 (antes S/ 329)

---

### BANNER CTA "OFERTA DEL DÍA"

**Diseño:** banner full-width, altura 140px, fondo `var(--brand-accent)` (naranja) con patrón diagonal CSS (stripes con `repeating-linear-gradient`).

Contenido: izquierda texto `"⚡ OFERTA DEL DÍA"` + `"Laptop Gaming RTX 4060 — 40% OFF"`, derecha contador regresivo (HH:MM:SS) animado en JS simple, y botón blanco "Ver oferta".

---

### FOOTER

**Fondo:** `var(--brand-dark)` con `border-top: 1px solid var(--brand-border)`  
**Padding:** 48px 0 24px  
**Grid:** 4 columnas en desktop, 2 en tablet, 1 en mobile

Columnas:
1. **Logo + slogan:** "Tecnología al alcance de todos" + íconos sociales (redes sociales con iconos SVG o Unicode)
2. **Empresa:** Sobre nosotros, Blog, Trabaja con nosotros, Prensa
3. **Soporte:** Centro de ayuda, Seguimiento de pedido, Devoluciones, Garantías
4. **Contacto:** 📞 01-234-5678 · 📧 info@innovventas.pe · 📍 Jr. Lampa 123, Lima

Línea inferior: copyright + métodos de pago (íconos pills: VISA · MC · YAPE · PLIN).

---

### CHATBOT WIDGET NOVA

**Botón flotante (FAB):**
- Posición: `fixed; bottom: 24px; right: 24px; z-index: 999`
- Forma: círculo 56px
- Fondo: `var(--gradient-hero)` (azul a cian)
- Ícono: SVG de burbuja de chat o emoji 💬, blanco
- Sombra: `0 4px 20px rgba(0,87,255,0.5)`
- Hover: `scale(1.1)` + sombra más intensa
- Badge de notificación: bolita roja animada (pulse CSS) en top-right del botón

**Ventana del chat:**
- Tamaño: 340px × 480px
- Posición: `fixed; bottom: 88px; right: 24px`
- Fondo: `var(--brand-surface)`
- Border: `1px solid var(--brand-border)`
- Border-radius: 16px
- Box-shadow: `0 24px 64px rgba(0,0,0,0.5)`
- Aparece con animación: `transform: scale(0.8) translateY(20px)` → `scale(1) translateY(0)` con ease-out 200ms

**Header del chat:**
- Fondo: `var(--gradient-hero)`, height 56px
- Avatar redondo (inicial "N" o ícono robot) + texto "**Nova** — InnovVentas" + punto verde animado (online)
- Botón X (cerrar) en esquina derecha

**Área de mensajes:**
- Fondo: `var(--brand-dark)`, padding 16px
- Burbuja bot: fondo `var(--brand-surface-2)`, texto `var(--brand-text)`, border-radius 12px 12px 12px 2px
- Burbuja usuario: fondo `var(--brand-primary)`, texto blanco, border-radius 12px 12px 2px 12px
- Typing indicator: 3 puntos animados con `animation: bounce` mientras Nova "escribe"

**Input del chat:**
- Fondo: `var(--brand-surface-2)`, border: `1px solid var(--brand-border)`
- Border-radius: 24px (pill), padding 10px 16px
- Botón enviar: círculo azul con icono flecha, disabled si input vacío

---

## `dashboard.html` — Panel de Métricas Nova

### Propósito
Panel interno para el equipo de InnovVentas para monitorear el rendimiento del chatbot. No es público — es la vista de administración. Tono: analítico, denso, data-first.

### Estructura

```
[NAVBAR ADMIN]
[HEADER CON FILTROS DE FECHA]
[FILA KPIs PRINCIPALES]         ← 4 tarjetas de métricas clave
[FILA GRÁFICOS]                 ← gráfico de líneas + gráfico de barras
[TABLA TOP INTENCIONES]
[TABLA ÚLTIMAS CONVERSACIONES]
```

---

### NAVBAR ADMIN

**Fondo:** `var(--brand-dark)` + `border-bottom: 1px solid var(--brand-border)`  
**Izquierda:** logo reducido InnovVentas + badge pill "ADMIN PANEL" en naranja  
**Derecha:** texto "Panel de Métricas — Nova" en muted + toggle de fecha activa  

---

### HEADER CON FILTROS

Fondo `var(--brand-surface)`, padding 20px, border-radius 12px.  
Título: `"📊 Dashboard de Métricas"` Syne 700 + subtítulo fecha en muted.  
Botones de período: `[Hoy]` `[7 días]` `[30 días]` `[Personalizado]` — estilo segmented control, activo con fondo azul.

---

### FILA KPIs PRINCIPALES (4 tarjetas)

Grid 4 columnas. Cada tarjeta:

```
┌──────────────────────────────┐
│  [ícono emoji grande]        │
│  Título métrica              │  ← muted, 12px uppercase
│  1,247                       │  ← Syne 700, 36px, color según métrica
│  ↑ +12% vs ayer              │  ← verde si sube, rojo si baja, 13px
└──────────────────────────────┘
```

Las 4 métricas:
1. 💬 **Total Conversaciones** — número grande en blanco — comparativa vs ayer
2. ✅ **Tasa de Resolución** — porcentaje en verde (`var(--brand-success)`) — comparativa vs semana anterior
3. ⭐ **CSAT Promedio** — número con 1 decimal en amarillo `#FFD700` — comparativa vs semana anterior
4. ⚡ **Tiempo Respuesta** — en segundos, en cian `var(--brand-secondary)` — comparativa vs ayer

**Estilo tarjeta:** mismo estilo que product cards — gradient card, borde, hover sutil.

---

### FILA GRÁFICOS (2 columnas 60/40)

**Gráfico izquierdo — "Conversaciones por día" (60%):**
- Tipo: área con línea (line chart con fill)
- Librería: Chart.js via CDN
- Fondo del área: gradiente vertical azul (`rgba(0,87,255,0.3)` → transparente)
- Línea: `var(--brand-primary)` 2px
- Puntos: círculos azules con hover tooltip
- Eje X: últimos 7 días con formato `"Lun 26"` etc.
- Eje Y: cantidad de conversaciones
- Grid lines: `var(--brand-border)` 1px

**Gráfico derecho — "Top Intenciones" (40%):**
- Tipo: donut chart (doughnut en Chart.js)
- Segmentos con paleta: azul, cian, naranja, verde, morado, rosa
- Leyenda a la derecha del donut con nombre + porcentaje
- Intenciones de ejemplo: Consulta Producto 34%, Métodos de Pago 22%, Envíos 18%, Proceso Compra 14%, Soporte 8%, Otros 4%

---

### TABLA — TOP INTENCIONES

Título: `"🎯 Intenciones más consultadas"` Syne 700 20px

Tabla con fondo `var(--brand-surface)`, header con fondo `var(--brand-surface-2)`:

| Intención | Consultas | % del total | Confianza promedio | Tendencia |
|-----------|-----------|-------------|-------------------|-----------|
| consulta_producto | 423 | 34% | barra progress azul | ↑ |
| metodo_pago | 274 | 22% | barra progress cian | → |
| envio_tiempo | 224 | 18% | barra progress verde | ↑ |
| proceso_compra | 175 | 14% | barra progress naranja | ↓ |
| soporte_tecnico | 99 | 8% | barra progress rojo | → |

Barra de progreso en la columna "% del total": barra horizontal dentro de la celda, fondo `var(--brand-border)`, fill con el color asignado, border-radius 4px.

---

### TABLA — ÚLTIMAS CONVERSACIONES

Título: `"🕐 Últimas conversaciones"` Syne 700 20px

Columnas: Session ID (truncado) · Hora · Intención final · Mensajes · Estado · CSAT

**Columna Estado** con badges pill:
- ✅ `Resuelta` — fondo verde 15%, texto verde
- ⚡ `Escalada` — fondo naranja 15%, texto naranja
- ⏳ `Activa` — fondo azul 15%, texto azul con animación pulse

Filas con hover: fondo `var(--brand-surface-2)` en hover, cursor default.  
Paginación simple abajo: `< Anterior` · `1 2 3 ...` · `Siguiente >` en botones outline.

---

## Instrucciones de Implementación para Claude Code

### Orden de trabajo recomendado

1. **Definir las CSS variables** en un `<style>` block en el `<head>` de cada archivo. Aplicar fondo `var(--brand-dark)` al `body`. Importar las fuentes Google.

2. **`index.html`** — implementar en este orden:
   - Navbar sticky
   - Hero banner con 2 columnas
   - Barra de categorías
   - Grid de 8 product cards con los productos listados arriba
   - Banner de oferta del día con contador JS
   - Footer 4 columnas
   - Widget Nova flotante (funcional: toggle abre/cierra, puede ser mock sin backend)

3. **`dashboard.html`** — implementar en este orden:
   - Navbar admin
   - Header con filtros de período
   - 4 KPI cards
   - Fila de gráficos con Chart.js (datos hardcodeados que simulan datos reales)
   - Tabla de intenciones con barras de progreso
   - Tabla de últimas conversaciones con badges de estado

### Reglas técnicas

- Un solo archivo HTML por página, **CSS y JS inline** (no archivos externos separados)
- Chart.js via CDN: `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`
- Google Fonts via `<link>` en el head
- Todas las imágenes de productos simuladas con placeholders CSS elegantes (emoji + nombre del producto, fondo `var(--brand-surface-2)`)
- El widget del chat puede ser funcional como interfaz (abrir/cerrar, escribir, ver respuestas mock) pero **no necesita conectarse al backend real** para el entregable académico
- Responsive básico: el grid de productos colapsa a 2 columnas en tablet y 1 en mobile con media queries

### Lo que NO incluir

- No crear páginas adicionales (no product detail, no cart, no checkout)
- No autenticación real
- No conexión real a backend (datos mock son suficientes)
- No librerías adicionales más allá de Chart.js
- No modal de carrito funcional (el botón puede mostrar un `alert()` simple o un toast CSS)
