const proveedorSelect = document.getElementById('proveedor');
const pdfSection = document.getElementById('pdf-section');
const procesarBtn = document.getElementById('procesarBtn');
const tablaSection = document.getElementById('tabla-section');
const tablaBody = document.getElementById('tabla-body');
const crearProcesosBtn = document.getElementById('crearProcesosBtn');

let datosSimulados = [];

// Mostrar carga PDF cuando se seleccione proveedor
proveedorSelect.addEventListener('change', () => {
  if (proveedorSelect.value) {
    pdfSection.classList.remove('hidden');
  } else {
    pdfSection.classList.add('hidden');
    tablaSection.classList.add('hidden');
  }
});

// Simular extracción PDF con inputs editables
procesarBtn.addEventListener('click', (e) => {
  e.preventDefault();
  datosSimulados = [
    { titulo: "Historia de Colombia", isbn: "9789581234567", cantidad: 3, valor: "$120.000" },
    { titulo: "Literatura Universal", isbn: "9789589876543", cantidad: 2, valor: "$80.000" }
  ];

  renderTabla(datosSimulados);
});

// Renderizar filas en la tabla
function renderTabla(datos) {
  tablaBody.innerHTML = datos.map(d => `
    <tr>
      <td><input type="number" value="${d.cantidad || 1}" /></td>
      <td><input type="text" value="${d.isbn || ''}" placeholder="ISBN (obligatorio)" required /></td>
      <td><input type="text" value="${d.titulo || ''}" /></td>
      <td><input type="text" value="${d.valor || ''}" placeholder="Valor" /></td>
      <td><button class="btn red btn-sm eliminarFila">🗑</button></td>
    </tr>
  `).join("");

  tablaSection.classList.remove('hidden');

  // Eventos para eliminar fila
  document.querySelectorAll(".eliminarFila").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.target.closest("tr").remove();
    });
  });
}

// Botón para añadir filas manualmente
function agregarFilaVacia() {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="number" value="1" /></td>
    <td><input type="text" value="" placeholder="ISBN (obligatorio)" required /></td>
    <td><input type="text" value="Nuevo título" /></td>
    <td><input type="text" value="" placeholder="Valor" /></td>
    <td><button class="btn red btn-sm eliminarFila">🗑</button></td>
  `;
  tablaBody.appendChild(tr);

  // Evento para eliminar esta fila
  tr.querySelector(".eliminarFila").addEventListener("click", (e) => {
    e.preventDefault();
    tr.remove();
  });

  tablaSection.classList.remove("hidden");
}

// Crear procesos leyendo los inputs
crearProcesosBtn?.addEventListener('click', () => {
  const orden = document.getElementById('orden').value || "ORD-0001";
  const proveedor = document.getElementById('proveedor').value || "sin-proveedor";

  const filas = document.querySelectorAll("#tabla-body tr");
  if (!orden || filas.length === 0) {
    alert("⚠️ Debes ingresar un número de orden y tener al menos una fila en la tabla.");
    return;
  }

  let error = false;

  filas.forEach((fila) => {
    const inputs = fila.querySelectorAll("input");
    const cantidad = (inputs[0]?.value || "1").trim();
    const isbn     = (inputs[1]?.value || "").trim();
    const titulo   = (inputs[2]?.value || proveedor).trim();
    const valor    = (inputs[3]?.value || "").trim();

    if (!isbn) {
      error = true;
      inputs[1].style.border = "2px solid red"; // 🚨 marcar error en ISBN
    } else {
      inputs[1].style.border = ""; // ✅ limpiar error si ya está bien
    }

    const id = Date.now() + Math.floor(Math.random() * 1000);

    if (isbn) { // ✅ Solo guarda si hay ISBN válido
      FLUJO.crear({
        id,
        titulo,
        cantidad,
        orden,
        isbn,
        valor,
        fase: "alistamiento"
      });
    }
  });

  if (error) {
    alert("⚠️ Todas las filas deben tener un ISBN válido.");
    return;
  }

  alert("✅ Procesos creados exitosamente");
  window.location.href = "../control-procesos/procesos.html";
});

// 🔹 Crear botón dinámico “Añadir fila” si no existe
document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("addFilaBtn")) {
    const btn = document.createElement("button");
    btn.id = "addFilaBtn";
    btn.className = "btn";
    btn.textContent = "+ Añadir fila";
    btn.style.marginTop = "1rem";
    tablaSection.appendChild(btn);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      agregarFilaVacia();
    });
  }
});
