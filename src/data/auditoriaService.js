const db = require("../model/database/models");

const auditoriaService = {
  registrarAuditoria: async (id_usuario, tabla, id_registro, accion, valor_anterior, valor_nuevo, descripcion) => {
    try {
      const now = new Date();
      now.setHours(now.getHours() - 3); // Ajuste horario Argentina
      const fecha = now.toISOString().split("T")[0];
      const hora = now.toISOString().split("T")[1].split(".")[0];

      await db.Auditoria.create({
        // Si no hay usuario logueado, por seguridad se asigna al ID 1 (Administrador)
        id_usuario: id_usuario || 1, 
        tabla_afectada: tabla,
        id_registro_afectado: id_registro,
        accion: accion,
        fecha: fecha,
        hora: hora,
        valor_anterior: valor_anterior ? JSON.stringify(valor_anterior) : null,
        valor_nuevo: valor_nuevo ? JSON.stringify(valor_nuevo) : null,
        descripcion: descripcion,
      });
    } catch (error) {
      console.error("Error Crítico: Fallo al registrar la auditoría:", error);
    }
  }
};

module.exports = auditoriaService;