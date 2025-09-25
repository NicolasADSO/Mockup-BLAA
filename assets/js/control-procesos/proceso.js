// Función para abrir/cerrar un bloque de orden
function toggleOrder(id) {
  const section = document.getElementById(id);
  const header = section.previousElementSibling;

  if (section.classList.contains("hidden")) {
    section.classList.remove("hidden");
    header.classList.add("active");
  } else {
    section.classList.add("hidden");
    header.classList.remove("active");
  }
}

// Renderizar pedidos guardados en localStorage
function renderPedidos() {
  const contenedor = document.querySelector(".content");

  // Buscar el header para insertar después de él
  const header = contenedor.querySelector(".header");

  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  pedidos.forEach((pedido, index) => {
    const block = document.createElement("div");
    block.classList.add("order-block");
    block.innerHTML = `
      <button class="order-header" onclick="toggleOrder('order-${index}')">
        Número de Orden: ${pedido.numeroOrden} <span class="arrow">▼</span>
      </button>
      <div id="order-${index}" class="order-content hidden">
        <table class="process-table">
          <thead>
            <tr>
              <th>Cantidad</th>
              <th>ISBN</th>
              <th>Título</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${pedido.procesos
              .map(
                (p, i) => `
              <tr class="process-row" data-id="${index}-${i}">
                <td>${p.cantidad}</td>
                <td>${p.isbn}</td>
                <td>${p.titulo}</td>
                <td>${p.valor}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    header.insertAdjacentElement("afterend", block);
  });

  // Hacer las filas clickeables → llevan al detalle
  document.querySelectorAll(".process-row").forEach(row => {
    row.addEventListener("click", () => {
      window.location.href = "detalle-proceso.html?id=" + row.dataset.id;
    });
  });
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", renderPedidos);
