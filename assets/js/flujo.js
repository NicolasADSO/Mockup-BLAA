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

  function crear({ id, titulo, cantidad = 1, orden = "", fase }) {
    const proceso = {
      id: String(id),
      titulo: titulo || "Proceso sin título",
      cantidad,
      orden,
      fase: fase || FASES[0], // si no pasas fase, arranca en alistamiento
      creadoEn: Date.now(),
      fases: {}
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

  // 🔧 Adaptado: ahora se puede decidir si ir al detalle o al listado
  function avanzar(id, irADetalle = true) {
    const p = get(id);
    if (!p) return alert("❌ Proceso no encontrado");
    const i = idx(p.fase);
    if (i === -1) return alert("❌ Fase inválida");
    if (i >= FASES.length - 1) {
      alert("✅ Ya estás en la última fase (Entrega).");
      if (irADetalle) {
        return goDetalleActual(id);
      } else {
        return window.location.href = `../${p.fase}/${p.fase}.html`;
      }
    }
    p.fase = FASES[i + 1];
    set(p);
    alert("➡️ Avanzó a la fase: " + p.fase);
    if (irADetalle) {
      goDetalleActual(id);
    } else {
      window.location.href = `../${p.fase}/${p.fase}.html`;
    }
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

    // Detectar página actual
    if (window.location.pathname.includes("procesos.html")) {
      window.location.href = "../control-procesos/procesos.html";
    } else {
      window.location.href = `../${p.fase}/${p.fase}.html`;
    }
  }

  function readId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  // ✅ Guardar datos de una fase
  function guardarFase(id, fase, datos) {
    const p = get(id);
    if (!p) return alert("❌ Proceso no encontrado");

    if (!p.fases) p.fases = {};
    p.fases[fase] = datos;

    p.fase = fase;
    set(p);
  }

  // ✅ Guardar y saltar a la siguiente fase → al LISTADO
  function goDetalleSiguiente(id) {
    avanzar(id, false);
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

  // ✅ Finalizar proceso (última fase)
  function finalizar(id) {
    const p = get(id);
    if (!p) return alert("❌ Proceso no encontrado");

    // Si ya está finalizado, no repetir
    if (p.estado === "Finalizado") {
      alert("ℹ️ Este proceso ya está finalizado.");
      return window.location.href = "../control-procesos/procesos.html";
    }

    // Actualizar estado y fecha
    p.estado = "Finalizado";
    p.fase = "finalizado"; // lo manejamos como pseudo-fase para control
    p.fechaFinalizacion = new Date().toLocaleString("es-CO");

    set(p);

    alert("✅ Proceso marcado como FINALIZADO.");
    window.location.href = "../control-procesos/procesos.html";
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
    guardarFase,
    goDetalleSiguiente,
    finalizar // 👈 NUEVO
  };
})(window);
