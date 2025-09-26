function confirmarEliminar(event) {
  event.preventDefault();

  // Confirmación básica
  if (confirm("¿Estás seguro de que deseas eliminar este proceso? Esta acción no se puede deshacer.")) {
    // 🔹 Aquí, en el proyecto real, se haría la llamada a Laravel con fetch/axios
    alert("✅ Proceso eliminado correctamente.");

    // Simulación: redirige al listado de la fase
    // Detectamos en qué fase estamos por la URL
    const url = window.location.href;

    if (url.includes("catalogacion")) {
      window.location.href = "../catalogacion/catalogacion.html";
    } else if (url.includes("digitalizacion")) {
      window.location.href = "../digitalizacion/digitalizacion.html";
    } else if (url.includes("empaste")) {
      window.location.href = "../empaste/empaste.html";
    } else if (url.includes("calidad")) {
      window.location.href = "../calidad/calidad.html";
    } else if (url.includes("entrega")) {
      window.location.href = "../entrega/entrega.html";
    } else if (url.includes("terminado")) {
      window.location.href = "../terminado/terminado.html";
    } else if (url.includes("alistamiento")) {
      window.location.href = "../alistamiento/alistamiento.html";
    } else {
      window.location.href = "../control-procesos/procesos.html";
    }
  }
}
