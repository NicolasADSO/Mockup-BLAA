const proveedorSelect = document.getElementById('proveedor');
const pdfSection = document.getElementById('pdf-section');
const procesarBtn = document.getElementById('procesarBtn');
const tablaSection = document.getElementById('tabla-section');
const tablaBody = document.getElementById('tabla-body');

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

// Simular extracción PDF
procesarBtn.addEventListener('click', (e) => {
  e.preventDefault();
  datosSimulados = [
    { titulo: "Historia de Colombia", isbn: "9789581234567", cantidad: 3, valor: "$120.000" },
    { titulo: "Literatura Universal", isbn: "9789589876543", cantidad: 2, valor: "$80.000" }
  ];

  tablaBody.innerHTML = datosSimulados.map(d => `
    <tr>
      <td>${d.cantidad}</td>
      <td>${d.isbn}</td>
      <td>${d.titulo}</td>
      <td>${d.valor}</td>
    </tr>
  `).join("");

  tablaSection.classList.remove('hidden');
});

// Crear procesos en localStorage con FLUJO
function crearProceso() {
  const orden = document.getElementById('orden').value || "ORD-0001";
  const proveedor = document.getElementById('proveedor').value || "sin-proveedor";

  if (!orden || datosSimulados.length === 0) {
    alert("Debes ingresar un número de orden y procesar un PDF primero.");
    return;
  }

  let primerId = null;

  datosSimulados.forEach((d) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    if (!primerId) primerId = id;

    FLUJO.crear({
      id,
      titulo: `${d.titulo} (${proveedor})`,
      cantidad: d.cantidad,
      orden,
      isbn: d.isbn,
      valor: d.valor
    });
  });

  alert("✅ Procesos creados exitosamente");
  FLUJO.goDetalleActual(primerId); // redirige al detalle del primer proceso
}
