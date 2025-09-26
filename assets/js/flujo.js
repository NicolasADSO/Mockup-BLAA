// Motor de flujo de fases para mockup (localStorage)
(function (w) {
  const FASES = [
    "alistamiento",
    "catalogacion",
    "empaste",
    "digitalizacion",
    "calidad",
    "terminado",
    "entrega"
  ];

  const key = (id) => `proceso_${id}`;
  const idx = (fase) => FASES.indexOf(fase);

  function get(id) {
    if (!id) return null;
    const raw = localStorage.getItem(key(id));
    return raw ? JSON.parse(raw) : null;
  }

  function set(proceso) {
    localStorage.setItem(key(proceso.id), JSON.stringify(proceso));
  }

  function crear({ id, titulo, cantidad = 1, orden = "" }) {
    const proceso = {
      id: String(id),
      titulo: titulo || "Proceso sin título",
      cantidad,
      orden,
      fase: FASES[0],
      creadoEn: Date.now()
    };
    set(proceso);
    return proceso;
  }

  function detallePath(fase) {
    return `../${fase}/detalle-${fase}.html`;
  }

  function goDetalleActual(id) {
    const p = get(id);
    if (!p) {
      alert("❌ Proceso no encontrado");
      return;
    }
    window.location.href =
      `${detallePath(p.fase)}?id=${encodeURIComponent(p.id)}`;
  }

  function avanzar(id) {
    const p = get(id);
    if (!p) return alert("❌ Proceso no encontrado");
    const i = idx(p.fase);
    if (i === -1) return alert("❌ Fase inválida");
    if (i >= FASES.length - 1) {
      alert("✅ Ya estás en la última fase (Entrega).");
      return goDetalleActual(id);
    }
    p.fase = FASES[i + 1];
    set(p);
    alert("➡️ Avanzó a la fase: " + p.fase);
    goDetalleActual(id);
  }

  function retroceder(id) {
    const p = get(id);
    if (!p) return alert("❌ Proceso no encontrado");
    const i = idx(p.fase);
    if (i <= 0) {
      alert("ℹ️ Ya estás en la primera fase.");
      return goDetalleActual(id);
    }
    p.fase = FASES[i - 1];
    set(p);
    alert("↩️ Volvió a la fase: " + p.fase);
    goDetalleActual(id);
  }

  function eliminar(id) {
    const p = get(id);
    if (!p) return alert("❌ Proceso no encontrado");
    const ok = confirm("¿Eliminar este proceso? Esta acción no se puede deshacer.");
    if (!ok) return;
    localStorage.removeItem(key(id));
    alert("🗑️ Proceso eliminado.");
    // Redirige a listado de la fase donde estabas
    window.location.href = `../${p.fase}/${p.fase}.html`;
  }

  function readId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  // Hidrata campos básicos si existen en el DOM
  function hidratarDetalle() {
    const id = readId();
    const p = get(id);
    if (!p) return; // si entras sin id, no rompe

    const setText = (sel, val) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = val;
    };

    setText("#titulo", p.titulo);
    setText("#fase", p.fase);
    setText("#cantidad", p.cantidad ?? "");
    setText("#numeroOrden", p.orden ?? "");
  }

  // Exponer API
  w.FLUJO = {
    FASES,
    crear,
    get,
    set,
    avanzar,
    retroceder,
    eliminar,
    readId,
    goDetalleActual,
    hidratarDetalle,
  };
})(window);
