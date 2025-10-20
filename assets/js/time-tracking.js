// assets/js/time-tracking.js
// Control de tiempo por proceso, fase y usuario - BlaaFlow
// Versión visual mejorada y unificada con tracking global

const TT = (() => {
  const LS_KEY = "time_tracking";
  const LOG_KEY_PREFIX = "proceso_";

  const now = () => Date.now();
  const loadMap = () => JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  const saveMap = (m) => localStorage.setItem(LS_KEY, JSON.stringify(m));

  const format = (sec) => {
    sec = Math.max(0, Math.floor(sec));
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const getProceso = (id) => {
    const raw = localStorage.getItem(`${LOG_KEY_PREFIX}${id}`);
    return raw ? JSON.parse(raw) : null;
  };
  const saveProceso = (p) =>
    localStorage.setItem(`${LOG_KEY_PREFIX}${p.id}`, JSON.stringify(p));

  // ====== INTERFAZ VISUAL ======
  function updateVisualState(id, state) {
    const row = document.querySelector(`#tt-time-${id}`)?.closest("td");
    if (!row) return;

    row.classList.remove("tt-running", "tt-paused", "tt-saved");

    if (state === "running") row.classList.add("tt-running");
    if (state === "paused") row.classList.add("tt-paused");
    if (state === "saved") {
      row.classList.add("tt-saved");
      setTimeout(() => row.classList.remove("tt-saved"), 1500);
    }
  }

  // ====== RENDER TIEMPO EN VIVO ======
  let timer = null;
  function initTicker() {
    if (timer) return;
    timer = setInterval(() => {
      const map = loadMap();
      Object.keys(map).forEach((id) => {
        const span = document.getElementById(`tt-time-${id}`);
        if (span) span.textContent = getTotalDisplay(id);
      });
    }, 1000);
  }

  // ====== CONTROL PRINCIPAL ======
  function ensureEntry(id, fase, user) {
    const map = loadMap();
    if (!map[id]) {
      map[id] = { fase, user, running: false, startTs: null, elapsedSec: 0 };
      saveMap(map);
    }
    return map[id];
  }

  function start(id, fase, user) {
    const map = loadMap();
    const st = ensureEntry(id, fase, user);
    if (!st.running) {
      st.running = true;
      st.startTs = now();
      map[id] = st;
      saveMap(map);
      updateVisualState(id, "running");
    }
    initTicker();
  }

  function pause(id) {
    const map = loadMap();
    const st = map[id];
    if (!st) return;
    if (st.running && st.startTs) {
      st.elapsedSec = (st.elapsedSec || 0) + (now() - st.startTs) / 1000;
      st.running = false;
      st.startTs = null;
      saveMap(map);
      updateVisualState(id, "paused");
    }
  }

  function saveLog(id) {
    const map = loadMap();
    const st = map[id];
    if (!st) return;

    let total = st.elapsedSec || 0;
    if (st.running && st.startTs) {
      total += (st.running && st.startTs) ? (now() - st.startTs) / 1000 : 0;
      st.running = false;
      st.startTs = null;
    }
    saveMap(map);

    const proc = getProceso(id);
    if (!proc) return;

    if (!Array.isArray(proc.timeLogs)) proc.timeLogs = [];
    proc.timeLogs.push({
      user: st.user || "Usuario",
      fase: st.fase || (proc.fase || proc.estado || "—"),
      seconds: Math.floor(total),
      date: new Date().toISOString(),
    });

    // === Actualizar en timeTracking global ===
    const trackingData = JSON.parse(localStorage.getItem("timeTracking")) || {};
    const faseActual = st.fase || proc.fase || "General";

    if (!trackingData[id]) {
      trackingData[id] = { fase: faseActual, sesiones: [], totalSegundos: 0 };
    }

    trackingData[id].sesiones.push({
      inicio: new Date(Date.now() - total * 1000).toISOString(),
      fin: new Date().toISOString(),
      duracion: Math.floor(total),
    });

    trackingData[id].totalSegundos += Math.floor(total);
    localStorage.setItem("timeTracking", JSON.stringify(trackingData));

    // Reiniciar
    map[id] = { fase: st.fase, user: st.user, running: false, startTs: null, elapsedSec: 0 };
    saveMap(map);
    saveProceso(proc);
    updateVisualState(id, "saved");
  }

  function getDisplay(id) {
    const st = loadMap()[id];
    if (!st) return "00:00:00";
    let sec = st.elapsedSec || 0;
    if (st.running && st.startTs) sec += (now() - st.startTs) / 1000;
    return isNaN(sec) ? "00:00:00" : format(sec);
  }

  // === 🔹 NUEVA FUNCIÓN: TOTAL ACUMULADO (sesiones + activo)
  function getTotalDisplay(id) {
    const trackingData = JSON.parse(localStorage.getItem("timeTracking")) || {};
    const activeMap = JSON.parse(localStorage.getItem(LS_KEY) || "{}");

    const base = trackingData[id]?.totalSegundos || 0;
    const st = activeMap[id];
    let running = 0;

    if (st) {
      running += (st.elapsedSec || 0);
      if (st.running && st.startTs) running += (now() - st.startTs) / 1000;
    }

    const total = base + running;
    return format(total);
  }

  // === Contar sesiones acumuladas ===
  function getSessionsCount(id) {
    const trackingData = JSON.parse(localStorage.getItem("timeTracking")) || {};
    const entry = trackingData[id];
    return entry && Array.isArray(entry.sesiones) ? entry.sesiones.length : 0;
  }

  function remove(id) {
    const map = loadMap();
    delete map[id];
    saveMap(map);
  }

  return {
    initTicker,
    start,
    pause,
    saveLog,
    getDisplay,
    getTotalDisplay, // ✅ NUEVA
    getSessionsCount,
    remove,
  };
})();

// ======= ESTILOS DINÁMICOS =======
const style = document.createElement("style");
style.textContent = `
  td.tt-running {
    background: rgba(0, 153, 0, 0.08);
    box-shadow: inset 0 0 5px #00990080;
  }
  td.tt-paused {
    background: rgba(255, 193, 7, 0.15);
    box-shadow: inset 0 0 5px #ffc10780;
  }
  td.tt-saved {
    animation: ttSavedFlash 1.2s ease;
  }
  @keyframes ttSavedFlash {
    0% { background: rgba(0,153,0,0.2); }
    100% { background: transparent; }
  }
`;
document.head.appendChild(style);
