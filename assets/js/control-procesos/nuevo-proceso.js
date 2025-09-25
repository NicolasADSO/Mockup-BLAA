
    const proveedorSelect = document.getElementById('proveedor');
    const pdfSection = document.getElementById('pdf-section');
    const procesarBtn = document.getElementById('procesarBtn');
    const tablaSection = document.getElementById('tabla-section');
    const tablaBody = document.getElementById('tabla-body');

     let datosSimulados = [];

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
  // Guardar en localStorage al crear proceso
  function crearProceso() {
    const orden = document.getElementById('orden').value;
    if (!orden || datosSimulados.length === 0) {
      alert("Debes ingresar un número de orden y procesar un PDF primero.");
      return;
    }

    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push({ numeroOrden: orden, procesos: datosSimulados });
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    window.location.href = "procesos.html";
  }


  