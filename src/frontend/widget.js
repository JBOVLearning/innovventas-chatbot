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
  #nova-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;
    background:linear-gradient(135deg,#0057FF,#00C2FF);color:#fff;border:none;cursor:pointer;font-size:24px;
    box-shadow:0 4px 20px rgba(0,87,255,.5);z-index:99999;transition:transform .18s,box-shadow .18s}
  #nova-fab:hover{transform:scale(1.1);box-shadow:0 6px 26px rgba(0,87,255,.7)}
  #nova-fab::after{content:"";position:absolute;top:10px;right:10px;width:11px;height:11px;border-radius:50%;
    background:#FF4D4D;border:2px solid #0A0F1E;animation:nova-pulse 1.6s infinite}
  @keyframes nova-pulse{0%{box-shadow:0 0 0 0 rgba(255,77,77,.6)}70%{box-shadow:0 0 0 8px rgba(255,77,77,0)}100%{box-shadow:0 0 0 0 rgba(255,77,77,0)}}
  #nova-box{position:fixed;bottom:88px;right:24px;width:340px;max-width:92vw;height:480px;max-height:78vh;
    background:#111827;border:1px solid #1E2D40;border-radius:16px;box-shadow:0 24px 64px rgba(0,0,0,.5);
    display:flex;flex-direction:column;overflow:hidden;font-family:'DM Sans',system-ui,Segoe UI,Roboto,sans-serif;z-index:99999;
    opacity:0;visibility:hidden;transform:scale(.8) translateY(20px);transition:opacity .2s ease-out,transform .2s ease-out,visibility .2s}
  #nova-box.open{opacity:1;visibility:visible;transform:scale(1) translateY(0)}
  #nova-head{background:linear-gradient(135deg,#0057FF,#00C2FF);color:#fff;height:56px;padding:0 14px;display:flex;justify-content:space-between;align-items:center}
  #nova-head .who{display:flex;align-items:center;gap:10px;font-weight:600;font-size:15px}
  #nova-head .avatar{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.2);display:grid;place-items:center;font-weight:700;font-family:'Syne',sans-serif}
  #nova-head .who small{display:flex;align-items:center;gap:5px;font-weight:400;opacity:.92;font-size:11px}
  #nova-head .online{width:7px;height:7px;border-radius:50%;background:#00D97E;display:inline-block;animation:nova-pulse2 1.8s infinite}
  @keyframes nova-pulse2{0%{box-shadow:0 0 0 0 rgba(0,217,126,.6)}70%{box-shadow:0 0 0 6px rgba(0,217,126,0)}100%{box-shadow:0 0 0 0 rgba(0,217,126,0)}}
  #nova-head .acts{display:flex;gap:12px;align-items:center}
  #nova-head .acts span{cursor:pointer;opacity:.9;font-size:15px}
  #nova-head .acts span:hover{opacity:1}
  #nova-msgs{flex:1;overflow-y:auto;padding:16px;background:#0A0F1E;display:flex;flex-direction:column;gap:9px}
  .nova-msg{max-width:82%;padding:9px 13px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}
  .nova-user{align-self:flex-end;background:#0057FF;color:#fff;border-radius:12px 12px 2px 12px}
  .nova-bot{align-self:flex-start;background:#1C2333;color:#F0F4FF;border-radius:12px 12px 12px 2px}
  .nova-typing{align-self:flex-start;background:#1C2333;border-radius:12px 12px 12px 2px;padding:11px 14px;display:flex;gap:4px}
  .nova-typing span{width:7px;height:7px;border-radius:50%;background:#8899BB;animation:nova-bounce 1.2s infinite}
  .nova-typing span:nth-child(2){animation-delay:.2s}
  .nova-typing span:nth-child(3){animation-delay:.4s}
  @keyframes nova-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
  #nova-foot{display:flex;align-items:center;border-top:1px solid #1E2D40;padding:10px;gap:8px;background:#111827}
  #nova-input{flex:1;border:1px solid #1E2D40;background:#1C2333;color:#F0F4FF;border-radius:24px;padding:10px 16px;font-size:14px;outline:none}
  #nova-input::placeholder{color:#8899BB}
  #nova-input:focus{border-color:#0057FF}
  #nova-send{background:#0057FF;color:#fff;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:15px;flex:0 0 auto}
  #nova-send:hover{background:#0046cc}
  #nova-csat{padding:11px 14px;text-align:center;border-top:1px solid #1E2D40;background:#111827;font-size:13px;color:#F0F4FF}
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
      <div class="who">
        <span class="avatar">N</span>
        <div>Nova<small><span class="online"></span>En línea · InnovVentas</small></div>
      </div>
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
    typing.innerHTML = "<span></span><span></span><span></span>";
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
