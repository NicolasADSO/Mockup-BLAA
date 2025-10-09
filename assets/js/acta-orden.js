// assets/js/acta-orden.js
// Acta Consolidada por Orden - Versión corporativa BlaaFlow
// Requiere jsPDF y jsPDF-Autotable cargados en el HTML

function generarActaConsolidada(orden, procesos, infoExtra = {}) {
  console.log("🧾 Generando Acta Consolidada para la orden:", orden);

  const { fechaFinalizacion, cantidad, totalGeneral, fuente } = infoExtra; // 🔹 NUEVO
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const colorRojo = [153, 15, 12];
  const colorGris = [80, 80, 80];

  // =======================
  // PORTADA CORPORATIVA
  // =======================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...colorRojo);
  doc.text("BlaaFlow", 105, 40, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("Sistema de Gestión de Procesos Documentales", 105, 48, { align: "center" });

  doc.setDrawColor(...colorRojo);
  doc.line(40, 52, 170, 52);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...colorRojo);
  doc.text("ACTA CONSOLIDADA DE PROCESOS", 105, 75, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...colorGris);
  doc.text(`Número de Orden: ${orden}`, 105, 85, { align: "center" });

  // 🔹 NUEVO: Mostrar datos adicionales si vienen desde historial
  if (cantidad) doc.text(`Total de Procesos: ${cantidad}`, 105, 92, { align: "center" });
  if (fechaFinalizacion) doc.text(`Fecha Finalización: ${fechaFinalizacion}`, 105, 99, { align: "center" });
  if (totalGeneral) doc.text(`Valor Total Estimado: $${totalGeneral.toLocaleString("es-CO")}`, 105, 106, { align: "center" });

  doc.setDrawColor(160);
  doc.line(40, 112, 170, 112);

  doc.setFontSize(11);
  doc.text(
    "Este documento consolida los procesos completados en la orden\n" +
    "correspondiente al flujo documental gestionado a través del sistema BlaaFlow,\n" +
    "en la Biblioteca Luis Ángel Arango.",
    105, 126, { align: "center" }
  );

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  doc.text(`Generado automáticamente el ${fecha}`, 105, 146, { align: "center" });

  // Logo opcional si existe variable global logoBase64
  if (typeof logoBase64 !== "undefined" && logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", 80, 155, 50, 40);
    } catch (err) {
      console.warn("⚠️ No se pudo cargar el logo en la portada:", err);
    }
  }

  // Separador visual
  doc.setDrawColor(180);
  doc.line(30, 205, 180, 205);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Biblioteca Luis Ángel Arango - División de Gestión Documental", 105, 215, { align: "center" });

  // 🔹 NUEVO: Texto extra si el acta viene del historial
  if (fuente === "historial") {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("(Documento generado desde el historial de procesos)", 105, 222, { align: "center" });
  }

  doc.addPage();

  // =======================
  // CONTENIDO DE PROCESOS
  // =======================
  procesos.forEach((proceso, index) => {
    let y = 25;

    // Encabezado de cada proceso
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...colorRojo);
    doc.text(`PROCESO ${index + 1}: ${proceso.titulo || "Sin título"}`, 105, y, { align: "center" });

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const gen = [
      ["Título", proceso.titulo || "—"],
      ["ISBN", proceso.isbn || "—"],
      ["Cantidad", proceso.cantidad || "—"],
      ["Valor", proceso.valor || "—"],
      ["Orden", proceso.orden || "—"],
      ["Estado", proceso.estado || proceso.faseActual || "—"],
      ["Fecha Finalización", proceso.fechaFinalizacion || fechaFinalizacion || "—"], // 🔹 NUEVO fallback
    ];

    gen.forEach(([k, v]) => {
      doc.text(`${k}: ${v}`, 25, y);
      y += 6;
    });

    y += 4;
    doc.setDrawColor(180);
    doc.line(20, y, 190, y);
    y += 8;

    // Fases del proceso
    const fases = proceso.fases || {};
    const faseKeys = Object.keys(fases);

    if (faseKeys.length === 0) {
      doc.text("No hay información registrada en las fases.", 25, y);
      y += 10;
    } else {
      faseKeys.forEach((key) => {
        const datos = fases[key];
        y += 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...colorRojo);
        doc.text(`FASE: ${key.toUpperCase()}`, 25, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        Object.entries(datos).forEach(([campo, valor]) => {
          if (typeof valor === "object") return;
          const texto = `${campo.replace(/_/g, " ")}: ${valor}`;
          doc.text(texto, 30, y);
          y += 6;
          if (y > 250) {
            doc.addPage();
            y = 25;
          }
        });

        y += 3;
        doc.setDrawColor(220);
        doc.line(20, y, 190, y);
      });
    }

    // Bloque de firmas
    y += 20;
    if (y > 220) {
      doc.addPage();
      y = 40;
    }

    doc.setDrawColor(120);
    doc.line(20, y, 190, y);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...colorRojo);
    doc.text("FIRMAS DE RESPONSABILIDAD", 105, y, { align: "center" });

    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text("______________________________", 40, y + 15);
    doc.text("Responsable del Proceso", 40, y + 22);
    doc.text("(Firma y sello)", 40, y + 28);

    doc.text("______________________________", 130, y + 15);
    doc.text("Supervisor / Biblioteca L.A.A.", 130, y + 22);
    doc.text("(Firma y sello)", 130, y + 28);

    if (index < procesos.length - 1) doc.addPage();
  });

  // =======================
  // PIE DE DOCUMENTO FINAL
  // =======================
  const fechaActual = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.line(20, 285, 190, 285);
  doc.text(`Acta consolidada generada el ${fechaActual} por BlaaFlow`, 105, 292, { align: "center" });

  // Descargar
  doc.save(`Acta_Consolidada_Orden_${orden}.pdf`);
}
