// assets/js/acta-pdf.js
// Acta Final de Proceso con resumen de tiempos
// Requiere jsPDF cargado (jspdf.umd.min.js)

function generarActaPDF(proceso) {
  console.log("✅ Generando acta PDF con tiempos...");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 20;

  // === ENCABEZADO ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ACTA FINAL DE PROCESO", 105, y, { align: "center" });

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Sistema BlaaFlow - Biblioteca Luis Ángel Arango", 105, y, { align: "center" });

  y += 5;
  doc.line(20, y, 190, y);
  y += 10;

  // === DATOS GENERALES ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("DATOS GENERALES", 20, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const gen = [
    ["Título", proceso.titulo || "—"],
    ["ISBN", proceso.isbn || "—"],
    ["Cantidad", proceso.cantidad || "—"],
    ["Orden", proceso.orden || "—"],
    ["Estado", proceso.estado || "—"],
    ["Fecha de Finalización", proceso.fechaFinalizacion || "—"],
  ];

  gen.forEach(([k, v]) => {
    doc.text(`${k}: ${v}`, 25, y);
    y += 6;
  });

  y += 4;
  doc.setDrawColor(180);
  doc.line(20, y, 190, y);
  y += 8;

  // === FASES ===
  const fases = proceso.fases || {};
  const faseKeys = Object.keys(fases);

  if (faseKeys.length === 0) {
    doc.text("No hay información registrada en las fases.", 25, y);
    y += 6;
  } else {
    for (const rawKey of faseKeys) {
      const key = rawKey
        .replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑ\s:]/g, "")
        .replace(/fase[:\s]*/i, "")
        .trim();

      const datos = fases[rawKey];
      y += 6;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(153, 15, 12);
      doc.text(`FASE: ${key.toUpperCase()}`, 20, y);

      y += 5;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      Object.entries(datos).forEach(([campo, valor]) => {
        if (typeof valor === "object") return;

        const campoLimpio = campo
          .replace(/([A-Z])/g, " $1")
          .replace(/_/g, " ")
          .replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑ\s:]/g, "")
          .trim();

        const valorLimpio =
          typeof valor === "string"
            ? valor.replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑ\s:.,-]/g, "").trim()
            : valor;

        const texto = `${campoLimpio}: ${valorLimpio}`;
        doc.text(texto, 25, y);
        y += 6;

        if (y > 250) {
          doc.addPage();
          y = 20;
        }
      });

      y += 2;
      doc.setDrawColor(230);
      doc.line(20, y, 190, y);
      y += 6;
    }
  }

  // === BLOQUE DE TIEMPOS ===
  y += 10;
  if (y > 230) {
    doc.addPage();
    y = 30;
  }

  const tracking = JSON.parse(localStorage.getItem("timeTracking")) || {};
  const registro = tracking[proceso.id];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(153, 15, 12);
  doc.text("RESUMEN DE TIEMPOS", 20, y);
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  if (!registro || !registro.sesiones || registro.sesiones.length === 0) {
    doc.text("No hay registros de tiempo para este proceso.", 25, y);
    y += 8;
  } else {
    const tiemposPorFase = registro.sesiones.reduce((acc, s) => {
      const fase = s.fase || "Sin fase";
      acc[fase] = (acc[fase] || 0) + (s.segundos || 0);
      return acc;
    }, {});

    let totalSegundos = 0;
    Object.entries(tiemposPorFase).forEach(([fase, seg]) => {
      const h = Math.floor(seg / 3600);
      const m = Math.floor((seg % 3600) / 60);
      const s = seg % 60;
      totalSegundos += seg;

      doc.text(`Fase ${fase}: ${h}h ${m}m ${s}s`, 25, y);
      y += 6;
      if (y > 260) {
        doc.addPage();
        y = 25;
      }
    });

    const hT = Math.floor(totalSegundos / 3600);
    const mT = Math.floor((totalSegundos % 3600) / 60);
    const sT = totalSegundos % 60;
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text(`Tiempo Total del Proceso: ${hT}h ${mT}m ${sT}s`, 25, y);
    y += 8;
  }

  // === PIE Y BLOQUE DE FIRMAS ===
  y += 10;
  if (y > 220) {
    doc.addPage();
    y = 40;
  }

  doc.setDrawColor(120);
  doc.line(20, y, 190, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("FIRMAS DE RESPONSABILIDAD", 105, y, { align: "center" });

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Firma responsable del proceso
  doc.text("______________________________", 40, y + 15);
  doc.text("Responsable del Proceso", 40, y + 22);
  doc.text("(Firma y sello)", 40, y + 28);

  // Firma supervisor / Biblioteca
  doc.text("______________________________", 130, y + 15);
  doc.text("Supervisor / Biblioteca L.A.A.", 130, y + 22);
  doc.text("(Firma y sello)", 130, y + 28);

  y += 45;
  doc.setDrawColor(180);
  doc.line(20, y, 190, y);

  const fechaActual = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generado automáticamente el ${fechaActual} por BlaaFlow`, 105, 292, { align: "center" });

  // === DESCARGA ===
  const nombreArchivo = `Acta_Final_${proceso.isbn || proceso.titulo || "Proceso"}.pdf`;
  doc.save(nombreArchivo);
}
