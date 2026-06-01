/*
 * Widget de chat embebible — InnovVentas (Nova)
 * Uso en cualquier web:
 *   <script>window.NOVA_API_URL = "https://TU-BACKEND.onrender.com";</script>
 *   <script src="widget.js"></script>
 * Si no defines NOVA_API_URL, usa http://localhost:8000 (desarrollo).
 *
 * Persistencia: la conversación y el session_id se guardan en localStorage,
 * de modo que sobreviven a recargas de página (caduca a las 24 h).
 */
(function () {
  const API = (window.NOVA_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const STORE_KEY = "nova_chat_v1";
  const TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

  let sessionId = null;
  let open = false;
  let history = []; // [{role:'user'|'assistant', content:string}]

  // ---------- Persistencia (localStorage) ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data.savedAt || Date.now() - data.savedAt > TTL_MS) {
        localStorage.removeItem(STORE_KEY);
        return;
      }
      sessionId = data.sessionId || null;
      history = Array.isArray(data.history) ? data.history : [];
    } catch (e) { /* almacenamiento no disponible o corrupto */ }
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ sessionId, history, savedAt: Date.now() }));
    } catch (e) { /* modo privado / sin espacio: el chat sigue funcionando en memoria */ }
  }
  function clearChat() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    sessionId = null;
    history = [];
    msgs.innerHTML = "";
    box.querySelector("#nova-csat").style.display = "none";
    greet();
  }

  // ---------- Estilos ----------
  const css = `
  #nova-fab{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;
    background:#2563eb;color:#fff;border:none;cursor:pointer;font-size:26px;box-shadow:0 4px 12px rgba(0,0,0,.25);z-index:99999}
  #nova-box{position:fixed;bottom:90px;right:20px;width:340px;max-width:92vw;height:460px;max-height:75vh;
    background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.25);display:none;flex-direction:column;
    overflow:hidden;font-family:system-ui,Segoe UI,Roboto,sans-serif;z-index:99999}
  #nova-box.open{display:flex}
  #nova-head{background:#2563eb;color:#fff;padding:12px 16px;font-weight:600;display:flex;justify-content:space-between;align-items:center}
  #nova-head small{font-weight:400;opacity:.85;display:block;font-size:11px}
  #nova-head .acts{display:flex;gap:12px;align-items:center}
  #nova-head .acts span{cursor:pointer;opacity:.9;font-size:15px}
  #nova-head .acts span:hover{opacity:1}
  #nova-msgs{flex:1;overflow-y:auto;padding:14px;background:#f8fafc;display:flex;flex-direction:column;gap:8px}
  .nova-msg{max-width:80%;padding:9px 12px;border-radius:12px;font-size:14px;line-height:1.4;white-space:pre-wrap;word-wrap:break-word}
  .nova-user{align-self:flex-end;background:#2563eb;color:#fff;border-bottom-right-radius:3px}
  .nova-bot{align-self:flex-start;background:#fff;border:1px solid #e2e8f0;color:#1e293b;border-bottom-left-radius:3px}
  .nova-typing{align-self:flex-start;color:#64748b;font-size:13px;font-style:italic}
  #nova-foot{display:flex;border-top:1px solid #e2e8f0;padding:8px;gap:6px;background:#fff}
  #nova-input{flex:1;border:1px solid #cbd5e1;border-radius:20px;padding:9px 14px;font-size:14px;outline:none}
  #nova-send{background:#2563eb;color:#fff;border:none;border-radius:20px;padding:0 16px;cursor:pointer;font-size:14px}
  #nova-csat{padding:10px 14px;text-align:center;border-top:1px solid #e2e8f0;background:#fff;font-size:13px}
  #nova-csat button{font-size:20px;background:none;border:none;cursor:pointer}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- DOM ----------
  const fab = document.createElement("button");
  fab.id = "nova-fab";
  fab.textContent = "💬";
  document.body.appendChild(fab);

  const box = document.createElement("div");
  box.id = "nova-box";
  box.innerHTML = `
    <div id="nova-head">
      <div>Nova <small>Asistente de InnovVentas</small></div>
      <div class="acts">
        <span id="nova-clear" title="Nueva conversación">🗑</span>
        <span id="nova-x" title="Cerrar">✕</span>
      </div>
    </div>
    <div id="nova-msgs"></div>
    <div id="nova-csat" style="display:none">¿Te ayudé? Califica:
      <span>${[1,2,3,4,5].map(n=>`<button data-s="${n}">⭐</button>`).join("")}</span></div>
    <div id="nova-foot">
      <input id="nova-input" placeholder="Escribe tu mensaje..." autocomplete="off"/>
      <button id="nova-send">➤</button>
    </div>`;
  document.body.appendChild(box);

  const msgs = box.querySelector("#nova-msgs");
  const input = box.querySelector("#nova-input");

  function addMsg(text, who) {
    const d = document.createElement("div");
    d.className = "nova-msg " + (who === "user" ? "nova-user" : "nova-bot");
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function greet() {
    addMsg("¡Hola! Soy Nova 👋 el asistente de InnovVentas. ¿En qué te ayudo? Puedo orientarte sobre productos, pagos, envíos y soporte.", "bot");
  }

  // Reconstruye la conversación guardada (si la hay)
  function renderHistory() {
    history.forEach(m => addMsg(m.content, m.role === "user" ? "user" : "bot"));
  }

  function toggle(show) {
    open = show;
    box.classList.toggle("open", open);
    if (open && msgs.childElementCount === 0) greet();
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMsg(text, "user");
    history.push({ role: "user", content: text });
    save();

    const typing = document.createElement("div");
    typing.className = "nova-typing";
    typing.textContent = "Nova está escribiendo...";
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    try {
      const r = await fetch(API + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId, history }),
      });
      const data = await r.json();
      sessionId = data.session_id || sessionId;
      typing.remove();
      addMsg(data.response, "bot");
      history.push({ role: "assistant", content: data.response });
      save();
      box.querySelector("#nova-csat").style.display = "block";
    } catch (e) {
      typing.remove();
      addMsg("⚠️ No pude conectar con el servidor. Revisa que el backend esté activo.", "bot");
    }
  }

  // ---------- Eventos ----------
  fab.onclick = () => toggle(!open);
  box.querySelector("#nova-x").onclick = () => toggle(false);
  box.querySelector("#nova-clear").onclick = () => {
    if (confirm("¿Iniciar una nueva conversación? Se borrará el historial actual.")) clearChat();
  };
  box.querySelector("#nova-send").onclick = send;
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  box.querySelector("#nova-csat").addEventListener("click", async (e) => {
    const s = e.target.getAttribute("data-s");
    if (!s) return;
    await fetch(API + "/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, score: Number(s) }),
    }).catch(() => {});
    box.querySelector("#nova-csat").innerHTML = "¡Gracias por tu calificación! 🙌";
  });

  // ---------- Init: restaurar chat previo ----------
  load();
  if (history.length) renderHistory();
})();
