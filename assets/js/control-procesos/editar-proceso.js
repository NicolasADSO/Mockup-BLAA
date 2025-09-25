// assets/js/control-procesos/editar-proceso.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-editar-proceso");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // 🚫 Evita recarga de página
      alert("✅ Cambios guardados correctamente");

      // 🔄 Redirigir al listado de procesos
      window.location.href = "procesos.html";
    });
  }
});
