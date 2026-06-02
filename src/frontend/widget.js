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
  #nova-fab{position:fixed;bottom:24px;right:24px;width:62px;height:62px;border-radius:50%;
    background:linear-gradient(135deg,#0057FF,#00C2FF);color:#fff;border:none;cursor:pointer;
    display:grid;place-items:center;box-shadow:0 10px 30px rgba(0,87,255,.5);z-index:99999;
    transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s}
  #nova-fab svg{width:27px;height:27px}
  #nova-fab:hover{transform:scale(1.08) rotate(-4deg);box-shadow:0 14px 38px rgba(0,87,255,.7)}
  #nova-fab:active{transform:scale(.95)}
  #nova-fab::after{content:"";position:absolute;top:9px;right:9px;width:13px;height:13px;border-radius:50%;
    background:#FF4D4D;border:2.5px solid #0A0F1E;animation:nova-pulse 1.8s infinite}
  @keyframes nova-pulse{0%{box-shadow:0 0 0 0 rgba(255,77,77,.6)}70%{box-shadow:0 0 0 9px rgba(255,77,77,0)}100%{box-shadow:0 0 0 0 rgba(255,77,77,0)}}
  #nova-box{position:fixed;bottom:96px;right:24px;width:374px;max-width:92vw;height:548px;max-height:80vh;
    background:#0F1526;border:1px solid #20304a;border-radius:12px;box-shadow:0 30px 80px rgba(0,0,0,.6);
    display:flex;flex-direction:column;overflow:hidden;font-family:'Roboto',system-ui,Segoe UI,Roboto,sans-serif;z-index:99999;
    opacity:0;visibility:hidden;transform:scale(.9) translateY(24px);transform-origin:bottom right;
    transition:opacity .25s ease,transform .28s cubic-bezier(.34,1.4,.5,1),visibility .25s}
  #nova-box.open{opacity:1;visibility:visible;transform:scale(1) translateY(0)}
  #nova-head{position:relative;background:linear-gradient(135deg,#0057FF,#00C2FF);color:#fff;padding:15px 16px;display:flex;justify-content:space-between;align-items:center;overflow:hidden}
  #nova-head::before{content:"";position:absolute;inset:0;background:radial-gradient(140px 90px at 88% -25%,rgba(255,255,255,.28),transparent 70%)}
  #nova-head>*{position:relative}
  #nova-head .who{display:flex;align-items:center;gap:11px;font-weight:700;font-size:15px;font-family:'Poppins',sans-serif}
  #nova-head .avatar{position:relative;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.22);backdrop-filter:blur(4px);display:grid;place-items:center;font-weight:800;font-family:'Poppins',sans-serif;font-size:16px;border:1px solid rgba(255,255,255,.3)}
  #nova-head .who small{display:flex;align-items:center;gap:6px;font-weight:500;opacity:.95;font-size:11.5px;font-family:'Roboto',sans-serif;margin-top:2px}
  #nova-head .online{width:8px;height:8px;border-radius:50%;background:#26ED9E;display:inline-block;box-shadow:0 0 8px #26ED9E;animation:nova-pulse2 1.8s infinite}
  @keyframes nova-pulse2{0%{box-shadow:0 0 0 0 rgba(38,237,158,.6)}70%{box-shadow:0 0 0 7px rgba(38,237,158,0)}100%{box-shadow:0 0 0 0 rgba(38,237,158,0)}}
  #nova-head .acts{display:flex;gap:6px;align-items:center}
  #nova-head .acts span{cursor:pointer;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-size:15px;transition:background .15s}
  #nova-head .acts span:hover{background:rgba(255,255,255,.2)}
  #nova-msgs{flex:1;overflow-y:auto;padding:18px 16px;background:#0A0F1E;display:flex;flex-direction:column;gap:11px}
  #nova-msgs::-webkit-scrollbar{width:7px}
  #nova-msgs::-webkit-scrollbar-thumb{background:#243453;border-radius:6px}
  .nova-msg{max-width:84%;padding:10px 14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;animation:nova-in .28s ease}
  @keyframes nova-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .nova-user{align-self:flex-end;background:linear-gradient(135deg,#0057FF,#0A74FF);color:#fff;border-radius:10px 10px 3px 10px;box-shadow:0 4px 14px rgba(0,87,255,.3)}
  .nova-bot{align-self:flex-start;background:#19223A;color:#EAF1FF;border:1px solid #243453;border-radius:10px 10px 10px 3px}
  .nova-typing{align-self:flex-start;background:#19223A;border:1px solid #243453;border-radius:10px 10px 10px 3px;padding:13px 16px;display:flex;gap:5px}
  .nova-typing span{width:7px;height:7px;border-radius:50%;background:#7E93BC;animation:nova-bounce 1.2s infinite}
  .nova-typing span:nth-child(2){animation-delay:.2s}
  .nova-typing span:nth-child(3){animation-delay:.4s}
  @keyframes nova-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-6px);opacity:1}}
  #nova-foot{display:flex;align-items:center;border-top:1px solid #20304a;padding:11px 12px;gap:9px;background:#0F1526}
  #nova-input{flex:1;border:1px solid #243453;background:#19223A;color:#EAF1FF;border-radius:10px;padding:11px 16px;font-size:14px;outline:none;transition:border .15s,box-shadow .15s}
  #nova-input::placeholder{color:#7E93BC}
  #nova-input:focus{border-color:#0057FF;box-shadow:0 0 0 3px rgba(0,87,255,.18)}
  #nova-send{background:linear-gradient(135deg,#0057FF,#00C2FF);color:#fff;border:none;border-radius:11px;width:42px;height:42px;cursor:pointer;font-size:16px;flex:0 0 auto;display:grid;place-items:center;transition:transform .15s,filter .15s}
  #nova-send:hover{filter:brightness(1.1);transform:scale(1.05)}
  #nova-send:active{transform:scale(.94)}
  #nova-csat{padding:12px 14px;text-align:center;border-top:1px solid #20304a;background:#0F1526;font-size:13px;color:#EAF1FF}
  #nova-csat button{font-size:22px;background:none;border:none;cursor:pointer;transition:transform .12s;filter:grayscale(.15)}
  #nova-csat button:hover{transform:scale(1.25);filter:grayscale(0)}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- DOM ----------
  const fab = document.createElement("button");
  fab.id = "nova-fab";
  fab.title = "Chatea con Nova";
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';
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
