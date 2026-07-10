/* =====================================================================
   CONFIGURACIÓN DE COLUMNAS PARA REPORTES (Exportar / Imprimir)
   ---------------------------------------------------------------------
   Define, para cada módulo, las columnas que se exportan/imprimen.
   Cada columna es: { header: "Título", key: "campo" }  o
                     { header: "Título", fn: (fila) => valor }
   Reutiliza window.Reportes.fmtFecha para formatear fechas.
   ===================================================================== */
(function (window) {
  "use strict";

  const f = (window.Reportes && window.Reportes.fmtFecha) || ((v) => v || "");

  const Columnas = {

    /* ---------- VEHÍCULOS ---------- */
    vehiculos: [
      { header: "Patente", key: "patente" },
      { header: "Legajo", key: "legajo" },
      { header: "Marca", key: "marca" },
      { header: "Modelo", key: "modelo" },
      { header: "Año", key: "anio" },
      { header: "Tipo", fn: (v) => v.TipoVehiculo?.descripcion || "" },
      { header: "Chasis", key: "num_chasis" },
      { header: "Motor", key: "num_motor" },
      { header: "Km Actual", key: "km_actual" },
      { header: "Estado", key: "estado_actual" },
      { header: "Distrito", key: "distrito" },
      { header: "Cédula N°", key: "cedula_numero" },
      { header: "Titular Cédula", key: "cedula_titular" },
      { header: "Seguro", key: "seguro_compania" },
      { header: "Venc. Seguro", fn: (v) => f(v.seguro_vencimiento) },
      { header: "Venc. RTO", fn: (v) => f(v.rto_vencimiento) },
      { header: "Chofer Asignado", fn: (v) => {
          const a = v.asignacionActiva || v.AsignacionVehiculo;
          if (a && a.Chofer) return `${a.Chofer.apellido}, ${a.Chofer.nombre}`;
          return "";
      } },
      { header: "Fecha Alta", fn: (v) => f(v.fecha_alta) },
    ],

    /* ---------- CHOFERES ---------- */
    choferes: [
      { header: "Nombre", key: "nombre" },
      { header: "Apellido", key: "apellido" },
      { header: "DNI", key: "dni" },
      { header: "Teléfono", key: "telefono" },
      { header: "Email", key: "email" },
      { header: "Turno", key: "turno" },
      { header: "Estado", key: "estado" },
      { header: "Dirección", key: "direccion" },
      { header: "Fecha Ingreso", fn: (c) => f(c.fechaIngreso || c.createdAt) },
      { header: "Licencia(s)", fn: (c) => {
          if (Array.isArray(c.licencias) && c.licencias.length) {
            return c.licencias.map(l => l.categoria).join(", ");
          }
          return "";
      } },
    ],

    /* ---------- MANTENIMIENTOS ---------- */
    mantenimientos: [
      { header: "Fecha Inicio", fn: (m) => f(m.fecha_inicio) },
      { header: "Vehículo", fn: (m) => m.vehiculo ? `${m.vehiculo.marca} ${m.vehiculo.modelo}`.trim() : "" },
      { header: "Patente", fn: (m) => m.vehiculo?.patente || "" },
      { header: "Tipo de Servicio", key: "tipo_servicio" },
      { header: "Km Servicio", key: "km_servicio" },
      { header: "Estado", key: "estado" },
      { header: "Costo Repuestos", key: "costo_repuestos" },
      { header: "Mano de Obra", key: "mano_obra" },
      { header: "Costo Total", key: "costo_total" },
      { header: "Próx. Servicio (Km)", key: "proximo_km" },
      { header: "Próx. Fecha", fn: (m) => f(m.proxima_fecha) },
      { header: "Descripción", key: "descripcion" },
    ],

    /* ---------- HERRAMIENTAS ---------- */
    herramientas: [
      { header: "Código", key: "codigo_activo" },
      { header: "Nombre", key: "nombre" },
      { header: "Sector", key: "sector" },
      { header: "Estado", key: "estado" },
      { header: "Stock", key: "stock" },
      { header: "Combustible/Energía", key: "combustible_energia" },
      { header: "Observaciones", key: "observaciones" },
      { header: "Fecha Alta", fn: (h) => f(h.fecha_alta) },
    ],

    /* ---------- PRÉSTAMOS ---------- */
    prestamos: [
      { header: "Código", fn: (p) => p.herramienta?.codigo_activo || "" },
      { header: "Herramienta", fn: (p) => p.herramienta?.nombre || "" },
      { header: "Operario", key: "nombre_operario" },
      { header: "Sector Destino", key: "sector_destino" },
      { header: "Fecha Salida", fn: (p) => f(p.fecha_salida) },
      { header: "Devolución Estimada", fn: (p) => f(p.fecha_devolucion_estimada) },
      { header: "Devolución Real", fn: (p) => f(p.fecha_devolucion_real) },
      { header: "Estado", key: "estado_prestamo" },
    ],

    /* ---------- SINIESTROS ---------- */
    siniestros: [
      { header: "Fecha", fn: (s) => f(s.fecha_siniestro) },
      { header: "Vehículo (Patente)", fn: (s) => s.Vehiculo?.patente || "" },
      { header: "Vehículo (Marca/Modelo)", fn: (s) =>
          `${s.Vehiculo?.marca || ""} ${s.Vehiculo?.modelo || ""}`.trim() },
      { header: "Chofer", fn: (s) => {
          if (s.Chofer) return `${s.Chofer.apellido}, ${s.Chofer.nombre}`;
          return s.chofer_involucrado || "";
      } },
      { header: "Ubicación", key: "ubicacion" },
      { header: "Tercero Vehículo", key: "tercero_vehiculo" },
      { header: "Tercero Seguro", key: "tercero_seguro" },
      { header: "Tercero Conductor", key: "tercero_conductor" },
      { header: "Estado", key: "estado" },
    ],

    /* ---------- ALERTAS ---------- */
    alertas: [
      { header: "Fecha", fn: (a) => f(a.createdAt) },
      { header: "Tipo", key: "tipo" },
      { header: "Prioridad", key: "prioridad" },
      { header: "Mensaje", key: "mensaje" },
      { header: "Entidad", fn: (a) =>
          `${a.entidad_tipo || ""} ${a.entidad_nombre ? "- " + a.entidad_nombre : ""}`.trim() },
      { header: "Leída", fn: (a) => (a.leida ? "Sí" : "No") },
    ],

    /* ---------- USUARIOS ---------- */
    usuarios: [
      { header: "Usuario", key: "nombre_usuario" },
      { header: "Nombre", key: "nombre" },
      { header: "Apellido", key: "apellido" },
      { header: "Rol", fn: (u) => u.rol?.nombre || "" },
      { header: "Activo", fn: (u) => (u.activo ? "Sí" : "No") },
      { header: "Permisos", key: "permisos" },
    ],
  };

  window.ReportesColumnas = Columnas;
})(window);
