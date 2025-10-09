// assets/js/dashboard.js
// Dashboard Admin BlaaFlow - Calendario sincronizado con Centro de Ruta

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  // =========================================================
  // 🔹 1. Cargar agendamientos desde localStorage compartido
  // =========================================================
  let agendamientos = JSON.parse(localStorage.getItem("agendamientos") || "[]");

  const colorPorTipo = {
    "Proveedor": "#009f00",
    "Biblioteca": "#990f0c",
    "Banco": "#5b3dbd"
  };

  // =========================================================
  // 🔹 2. Inicializar FullCalendar
  // =========================================================
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    height: 600,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay"
    },
    events: cargarEventos(),
    dateClick: (info) => crearModalNuevo(info.dateStr),
    eventClick: mostrarDetallesEvento
  });

  calendar.render();

  // =========================================================
  // 🔹 3. Función para construir los eventos desde localStorage
  // =========================================================
  function cargarEventos() {
    return agendamientos.map(a => ({
      id: a.id,
      title: `${a.proveedor} - Orden ${a.orden}`,
      start: `${a.fecha}T${a.hora}`,
      color: colorPorTipo[a.tipo] || "#999",
      extendedProps: a
    }));
  }

  // =========================================================
  // 🔹 4. Modal de detalle / confirmación / eliminación
  // =========================================================
  function mostrarDetallesEvento(info) {
    const evento = info.event;
    const a = evento.extendedProps;
    const fecha = a.fecha || evento.start.toLocaleDateString("es-CO");
    const hora = a.hora || evento.start.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

    const html = `
      <h3 style="color:#990f0c;">📦 ${a.proveedor}</h3>
      <p><b>Orden:</b> ${a.orden}</p>
      <p><b>Tipo:</b> ${a.tipo}</p>
      <p><b>Fecha:</b> ${fecha}</p>
      <p><b>Hora:</b> ${hora}</p>
      <p><b>Estado:</b> ${a.estado}</p>

      <div style="margin-top:15px;text-align:right;">
        <button id="btnConfirmar" style="background:#009f00;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;">✅ Confirmar</button>
        <button id="btnEliminar" style="background:#d11a2a;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;margin-left:6px;">🗑️ Eliminar</button>
        <button id="cerrarModal" style="margin-left:6px;background:#777;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer;">Cerrar</button>
      </div>
    `;
    mostrarModal(html, evento.id);
  }

  // =========================================================
  // 🔹 5. Modal genérico
  // =========================================================
  function mostrarModal(html, eventId = null) {
    const existente = document.getElementById("modal-info");
    if (existente) existente.remove();

    const modal = document.createElement("div");
    modal.id = "modal-info";
    Object.assign(modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999"
    });

    const cont = document.createElement("div");
    Object.assign(cont.style, {
      background: "white",
      padding: "1.8rem",
      borderRadius: "12px",
      maxWidth: "420px",
      width: "90%",
      boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
    });
    cont.innerHTML = html;
    modal.appendChild(cont);
    document.body.appendChild(modal);

    // Cerrar modal
    document.getElementById("cerrarModal").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });

    // Confirmar agendamiento
    const btnConfirmar = document.getElementById("btnConfirmar");
    if (btnConfirmar) {
      btnConfirmar.addEventListener("click", () => {
        const ag = agendamientos.find(a => a.id === eventId);
        if (!ag) return;
        ag.estado = "Confirmado";
        localStorage.setItem("agendamientos", JSON.stringify(agendamientos));
        actualizarCalendario();
        modal.remove();
        alert("✅ Cita confirmada correctamente.");
      });
    }

    // Eliminar agendamiento
    const btnEliminar = document.getElementById("btnEliminar");
    if (btnEliminar) {
      btnEliminar.addEventListener("click", () => {
        if (!confirm("¿Eliminar este agendamiento?")) return;
        agendamientos = agendamientos.filter(a => a.id !== eventId);
        localStorage.setItem("agendamientos", JSON.stringify(agendamientos));
        actualizarCalendario();
        modal.remove();
        alert("🗑️ Agendamiento eliminado.");
      });
    }
  }

  // =========================================================
  // 🔹 6. Crear nuevo agendamiento
  // =========================================================
  function crearModalNuevo(fechaSeleccionada) {
    const existente = document.getElementById("modal-nuevo");
    if (existente) existente.remove();

    const modal = document.createElement("div");
    modal.id = "modal-nuevo";
    Object.assign(modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999"
    });

    const cont = document.createElement("div");
    Object.assign(cont.style, {
      background: "white",
      padding: "2rem",
      borderRadius: "12px",
      maxWidth: "400px",
      width: "90%",
      boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
    });

    cont.innerHTML = `
      <h3 style="color:#990f0c;">Nuevo Agendamiento</h3>
      <label>Proveedor:</label>
      <input type="text" id="prov" style="width:100%;padding:6px;margin-bottom:8px;">
      <label>N° Orden:</label>
      <input type="text" id="orden" style="width:100%;padding:6px;margin-bottom:8px;">
      <label>Fecha:</label>
      <input type="date" id="fecha" value="${fechaSeleccionada}" style="width:100%;padding:6px;margin-bottom:8px;">
      <label>Hora:</label>
      <input type="time" id="hora" style="width:100%;padding:6px;margin-bottom:8px;">
      <label>Tipo:</label>
      <select id="tipo" style="width:100%;padding:6px;">
        <option value="Proveedor">Proveedor</option>
        <option value="Biblioteca">Biblioteca</option>
        <option value="Banco">Banco</option>
      </select>
      <div style="text-align:right;margin-top:1rem;">
        <button id="guardarAg" style="background:#990f0c;color:#fff;border:none;padding:8px 15px;border-radius:6px;cursor:pointer;">Guardar</button>
        <button id="cancelarAg" style="margin-left:6px;background:#777;color:#fff;border:none;padding:8px 15px;border-radius:6px;cursor:pointer;">Cancelar</button>
      </div>
    `;

    modal.appendChild(cont);
    document.body.appendChild(modal);

    document.getElementById("cancelarAg").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });

    document.getElementById("guardarAg").addEventListener("click", () => {
      const proveedor = document.getElementById("prov").value.trim();
      const orden = document.getElementById("orden").value.trim();
      const fecha = document.getElementById("fecha").value;
      const hora = document.getElementById("hora").value;
      const tipo = document.getElementById("tipo").value;

      if (!proveedor || !orden || !fecha || !hora) {
        alert("Por favor completa todos los campos.");
        return;
      }

      const nuevo = {
        id: "ag_" + Date.now(),
        proveedor,
        orden,
        fecha,
        hora,
        tipo,
        estado: "Pendiente"
      };

      agendamientos.push(nuevo);
      localStorage.setItem("agendamientos", JSON.stringify(agendamientos));

      calendar.addEvent({
        id: nuevo.id,
        title: `${proveedor} - Orden ${orden}`,
        start: `${fecha}T${hora}`,
        color: colorPorTipo[tipo] || "#999",
        extendedProps: nuevo
      });

      modal.remove();
      alert("✅ Agendamiento creado correctamente.");
    });
  }

  // =========================================================
  // 🔹 7. Sincronización con Centro de Ruta
  // =========================================================
  window.addEventListener("storage", function (e) {
    if (e.key === "agendamientos") {
      agendamientos = JSON.parse(localStorage.getItem("agendamientos") || "[]");
      actualizarCalendario();
    }
  });

  // =========================================================
  // 🔹 8. Actualizar calendario completo
  // =========================================================
  function actualizarCalendario() {
    calendar.removeAllEvents();
    calendar.addEventSource(cargarEventos());
  }
});
