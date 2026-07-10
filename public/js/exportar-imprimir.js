/* =====================================================================
   MÓDULO REUTILIZABLE: Exportar (Excel/CSV) e Imprimir reportes COMPLETOS
   ---------------------------------------------------------------------
   Diseñado para exportar/imprimir la TOTALIDAD de los registros de una
   vista (no solo lo visible/filtrado en pantalla).
   Depende de SheetJS (XLSX) cargado vía CDN para los archivos Excel.
   ===================================================================== */
(function (window) {
  "use strict";

  const Reportes = {};

  /* ---------- Utilidades internas ---------- */

  // Formatea una fecha (Date, ISO string o "YYYY-MM-DD") a DD/MM/YYYY.
  function fmtFecha(value) {
    if (!value) return "";
    let d;
    if (value instanceof Date) d = value;
    else d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const dia = String(d.getUTCDate()).padStart(2, "0");
    const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}/${d.getUTCFullYear()}`;
  }

  // Recibe un valor y lo normaliza a texto seguro para celdas/tablas.
  function limpiar(value) {
    if (value === null || value === undefined) return "";
    return String(value);
  }

  /* ---------- EXPORTAR A EXCEL (.xlsx) ----------
     datos:    Array de objetos con TODOS los registros.
     columnas: Array de { header: "Título", key: "campo" o fn: (fila)=>valor }
     opciones: { nombreArchivo, nombreHoja }
  ----------------------------------------------------------------- */
  Reportes.exportarAExcel = function (datos, columnas, opciones = {}) {
    if (typeof XLSX === "undefined") {
      alert("La librería de exportación aún se está cargando. Intente nuevamente en unos segundos.");
      return;
    }
    if (!Array.isArray(datos) || datos.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const header = columnas.map((c) => c.header);
    const filas = datos.map((fila) =>
      columnas.map((c) => {
        const val = typeof c.fn === "function" ? c.fn(fila) : fila[c.key];
        return limpiar(val);
      })
    );

    const aoa = [header, ...filas];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, opciones.nombreHoja || "Reporte");
    XLSX.writeFile(wb, opciones.nombreArchivo || "Reporte.xlsx");
  };

  /* ---------- EXPORTAR A CSV ----------
     Igual firma que exportarAExcel.
  ----------------------------------------------------------------- */
  Reportes.exportarCSV = function (datos, columnas, opciones = {}) {
    if (!Array.isArray(datos) || datos.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    const esc = (v) => {
      let s = limpiar(typeof v === "function" ? "" : v);
      s = s.replace(/"/g, '""');
      if (/[",\n;]/.test(s)) s = `"${s}"`;
      return s;
    };

    const header = columnas.map((c) => esc(c.header)).join(";");
    const filas = datos.map((fila) =>
      columnas
        .map((c) => {
          const val = typeof c.fn === "function" ? c.fn(fila) : fila[c.key];
          return esc(val);
        })
        .join(";")
    );

    const csv = "\uFEFF" + [header, ...filas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = opciones.nombreArchivo || "Reporte.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ---------- IMPRIMIR REPORTE COMPLETO ----------
     opciones: {
       titulo:   "Título del reporte",
       columnas: [{ header, key|fn }],
       datos:    Array de objetos con TODOS los registros,
       subtitulo: "(opcional)",
       nombreVentana: "(opcional)"
     }
     Abre una ventana limpia con HTML estructurado y lanza la impresión.
  ----------------------------------------------------------------- */
  Reportes.imprimirReporte = function (opciones = {}) {
    const { titulo = "Reporte", subtitulo = "", columnas = [], datos = [] } = opciones;

    const hoy = new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const headHtml = columnas.map((c) => `<th>${c.header}</th>`).join("");

    let cuerpoHtml = "";
    if (!Array.isArray(datos) || datos.length === 0) {
      cuerpoHtml = `<tr><td colspan="${columnas.length}" style="text-align:center;padding:24px;color:#64748b;">Sin registros para mostrar.</td></tr>`;
    } else {
      cuerpoHtml = datos
        .map((fila) => {
          const celdas = columnas
            .map((c) => {
              const val = typeof c.fn === "function" ? c.fn(fila) : fila[c.key];
              return `<td>${limpiar(val)}</td>`;
            })
            .join("");
          return `<tr>${celdas}</tr>`;
        })
        .join("");
    }

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${titulo}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'DM Sans', 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 28px; }
  .encabezado { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 3px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; }
  .encabezado h1 { font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 0.04em; }
  .encabezado p { margin: 4px 0 0; font-size: 12px; color: #475569; }
  .meta { text-align: right; font-size: 11px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead th { background:#0f172a; color:#fff; padding: 8px 10px; text-align:left; text-transform:uppercase; font-size: 10px; letter-spacing:0.04em; border: 1px solid #0f172a; }
  tbody td { padding: 7px 10px; border: 1px solid #cbd5e1; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #f8fafc; }
  .pie { margin-top: 18px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px; display:flex; justify-content:space-between; }
  .total-reg { font-weight: 700; color:#0f172a; }
  @media print {
    body { padding: 14px; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="encabezado">
    <div>
      <h1>${titulo}</h1>
      ${subtitulo ? `<p>${subtitulo}</p>` : ""}
    </div>
    <div class="meta">
      Emitido: ${hoy}<br>
      <span class="total-reg">Total de registros: ${Array.isArray(datos) ? datos.length : 0}</span>
    </div>
  </div>
  <table>
    <thead><tr>${headHtml}</tr></thead>
    <tbody>${cuerpoHtml}</tbody>
  </table>
  <div class="pie">
    <span>Documento generado por el sistema de gestión de flota.</span>
    <span>Página 1</span>
  </div>
  <script>
    window.onload = function(){ setTimeout(function(){ window.focus(); window.print(); }, 300); };
  </script>
</body>
</html>`;

    const w = window.open("", opciones.nombreVentana || "_blank", "width=1000,height=700");
    if (!w) {
      alert("El navegador bloqueó la ventana emergente. Habilite las ventanas emergentes para imprimir.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  /* ---------- IMPRIMIR ELEMENTO INDIVIDUAL (remito/ficha) ----------
     Imprime solo el contenido de un contenedor del DOM (mantiene los
     remitos individuales tipo "Imprimir Remito").
  ----------------------------------------------------------------- */
  Reportes.imprimirElemento = function (elemento, titulo = "Documento") {
    if (!elemento) return;
    const hoy = new Date().toLocaleDateString("es-AR", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>${titulo}</title>
<style>
  body{font-family:'DM Sans','Segoe UI',Arial,sans-serif;color:#0f172a;margin:0;padding:28px;}
  .encabezado{border-bottom:3px solid #0f172a;padding-bottom:10px;margin-bottom:18px;display:flex;justify-content:space-between;}
  .encabezado h1{font-size:18px;margin:0;text-transform:uppercase;letter-spacing:.04em;}
  .meta{font-size:11px;color:#64748b;text-align:right;}
  table{width:100%;border-collapse:collapse;font-size:12px;}
  th{background:#f8fafc;padding:8px;text-align:left;border:1px solid #cbd5e1;font-size:11px;text-transform:uppercase;}
  td{padding:7px;border:1px solid #cbd5e1;}
  dl{margin:0;}
  dt{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;}
  dd{margin:2px 0 10px;font-size:14px;font-weight:600;}
  @media print{ thead{display:table-header-group;} tr{page-break-inside:avoid;} }
</style></head>
<body>
  <div class="encabezado">
    <div><h1>${titulo}</h1></div>
    <div class="meta">Emitido: ${hoy}</div>
  </div>
  ${elemento.innerHTML}
  <script>window.onload=function(){setTimeout(function(){window.focus();window.print();},300);};</script>
</body></html>`;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      alert("El navegador bloqueó la ventana emergente. Habilite las ventanas emergentes para imprimir.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // Exportar utilidad de fecha por si las vistas la necesitan
  Reportes.fmtFecha = fmtFecha;

  window.Reportes = Reportes;
})(window);
