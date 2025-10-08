document.addEventListener("DOMContentLoaded", () => {
  const cont = document.getElementById("historial-container");
  const inputBusqueda = document.getElementById("busqueda-historial");
  const modal = document.getElementById("detalle-modal");
  const detalleContainer = document.getElementById("detalle-container");
  const closeBtn = modal.querySelector(".close-btn");

  let historial = JSON.parse(localStorage.getItem("historial_procesos") || "[]");

  if (historial.length === 0) {
    cont.innerHTML = "<p>No hay órdenes finalizadas aún.</p>";
    return;
  }

  // 🔹 Función para resaltar texto buscado
  function resaltarTexto(texto, busqueda) {
    if (!busqueda) return texto;
    const regex = new RegExp(`(${busqueda})`, "gi");
    return texto.replace(regex, `<mark style="background:#ffeb3b;">$1</mark>`);
  }

  // 🔹 Renderizado de tarjetas
  function renderHistorial(lista, busqueda = "") {
    cont.innerHTML = "";
    lista.forEach(item => {
      // Contenido de los procesos con resaltado
      const listaProcesos = item.procesos?.map(p => `
        <li><b>${resaltarTexto(p.titulo || '', busqueda)}</b> 
        (ISBN: ${resaltarTexto(p.isbn || '', busqueda)}) - 
        ${p.faseActual || 'Completado'}</li>
      `).join("") || "<li>Sin procesos registrados</li>";

      const div = document.createElement("div");
      div.classList.add("order-block");
      div.innerHTML = `
        <h3 style="color:#990f0c;">Orden ${resaltarTexto(item.orden, busqueda)}</h3>
        <p><b>Fecha de Finalización:</b> ${item.fechaFinalizacion}</p>
        <p><b>Procesos Incluidos:</b> ${item.cantidadProcesos}</p>
        <div style="margin-top:10px;">
          <button class="btn btn-pdf" onclick="exportarHistorial('${item.orden}')">📄 Ver Acta Consolidada</button>
          <button class="ver-detalle-btn" data-orden="${item.orden}">🔍 Ver Detalle</button>
          <button class="btn red" onclick="eliminarHistorial('${item.orden}')">🗑️ Eliminar</button>
        </div>
        <ul style="margin-top:10px;">${listaProcesos}</ul>
      `;
      cont.appendChild(div);
    });

    if (lista.length === 0) {
      cont.innerHTML = `<p style="text-align:center;">No se encontraron resultados para tu búsqueda.</p>`;
    }
  }

  // 🔹 Render inicial
  renderHistorial(historial);

  // 🔍 Filtro en tiempo real con resaltado
  inputBusqueda.addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase().trim();
    if (!texto) {
      renderHistorial(historial);
      return;
    }

    const filtrados = historial.filter(item => {
      const matchOrden = item.orden.toString().toLowerCase().includes(texto);
      const matchProcesos = item.procesos?.some(p =>
        p.titulo?.toLowerCase().includes(texto) ||
        p.isbn?.toLowerCase().includes(texto)
      );
      return matchOrden || matchProcesos;
    });

    renderHistorial(filtrados, texto);
  });

  // 🪟 Modal Detalle
  cont.addEventListener("click", e => {
    if (e.target.classList.contains("ver-detalle-btn")) {
      const orden = e.target.dataset.orden;
      const item = historial.find(h => h.orden === orden);
      if (!item) return alert("No se encontró la orden.");

      detalleContainer.innerHTML = `
        <p><b>Orden:</b> ${item.orden}</p>
        <p><b>Fecha Finalización:</b> ${item.fechaFinalizacion}</p>
        <h4>Procesos:</h4>
        <ul>
          ${item.procesos?.map(p => `
            <li><b>${p.titulo}</b> (ISBN: ${p.isbn}) - ${p.faseActual || 'Completado'}</li>
          `).join("") || "<li>Sin procesos registrados</li>"}
        </ul>
      `;
      modal.classList.add("active");
    }
  });

  closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("active"); });
});

function exportarHistorial(orden) {
  const historial = JSON.parse(localStorage.getItem("historial_procesos") || "[]");
  const item = historial.find(h => h.orden === orden);
  if (item && typeof generarActaConsolidada === "function") {
    generarActaConsolidada(orden, item.procesos);
  } else {
    alert("No se encontró el acta consolidada para esta orden.");
  }
}

function eliminarHistorial(orden) {
  if (!confirm(`¿Eliminar el registro histórico de la orden ${orden}?`)) return;
  let historial = JSON.parse(localStorage.getItem("historial_procesos") || "[]");
  historial = historial.filter(h => h.orden !== orden);
  localStorage.setItem("historial_procesos", JSON.stringify(historial));
  location.reload();
}
