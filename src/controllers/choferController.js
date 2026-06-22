const path = require("path");
const fs = require("fs");
const db = require("../model/database/models");
const choferService = require("../data/choferService");
const auditoriaService = require("../data/auditoriaService"); // <-- Conectamos al Espía
const { validationResult } = require("express-validator");

// Formateador a prueba de Zonas Horarias
const formatYMD = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const choferController = {
  ListChoferes: async (req, res) => {
    try {
      const filtros = req.query;

      const { choferes, totalRegistros, totalPaginas, paginaActual, limite } =
        await choferService.getAll(filtros);

      const queryFiltros = { ...req.query };
      delete queryFiltros.pagina;
      const queryString = new URLSearchParams(queryFiltros).toString();

      res.render("listadoChofer", {
        choferes,
        totalRegistros,
        totalPaginas,
        paginaActual,
        limite,
        queryString,
      });
    } catch (error) {
      console.log(error);
      res.send("Error");
    }
  },

  createChofer: (req, res) => {
    res.render("cargaChofer", {
      errors: {},
      old: {},
      chofer: {}
    });
  },

  processChofer: async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.render("cargaChofer", {
          errors: errors.mapped(),
          old: req.body,
          chofer: {}
        });
      }

      let newChofer = await choferService.create(req);
      
      // LÓGICA DE AUDITORÍA: Registrar Alta
      const userId = req.session?.usuarioLogueado?.id || 1;
      await auditoriaService.registrarAuditoria(
        userId, 
        "chofer", 
        newChofer.id_chofer, 
        "CREAR", 
        null, 
        { nombre: req.body.nombre, apellido: req.body.apellido, dni: req.body.dni },
        `Alta de chofer: ${req.body.nombre} ${req.body.apellido}`
      );

      return res.redirect("/Choferes");
    } catch (error) {
      console.log(error);
      return res.send("Error");
    }
  },

  editChofer: async (req, res) => {
    try {
      const chofer = await choferService.getOneConLicencia(req.params.id);

      if (!chofer) return res.send("Chofer no encontrado");

      const licencia = chofer.licencias?.[0] || {};

      res.render("EditarChofer", {
        errors: {},
        old: {
          nombre: chofer.nombre,
          apellido: chofer.apellido,
          dni: chofer.dni,
          fechaNacimiento: chofer.fechaNacimiento,
          telefono: chofer.telefono,
          email: chofer.email,
          direccion: chofer.direccion,
          fechaIngreso: chofer.fechaIngreso,
          "activo-inactivo": chofer.estado,
          Turno: chofer.turno,
          numero_licencia: licencia.numero || "",
          categoria: licencia.categoria || "",
          fecha_emision: formatYMD(licencia.fecha_emision),
          fecha_vencimiento: formatYMD(licencia.fecha_vencimiento),
        },
        chofer,
      });
    } catch (error) {
      console.log(error);
      res.send("Error");
    }
  },

  processEdit: async (req, res) => {
    try {
      const errors = validationResult(req);
      const chofer = await choferService.getOneConLicencia(req.params.id);

      if (!chofer) return res.send("Chofer no encontrado");

      if (!errors.isEmpty()) {
        const licencia = chofer.licencias?.[0] || {};
        return res.render("EditarChofer", {
          errors: errors.mapped(),
          chofer,
          old: {
            ...req.body,
            numero_licencia: licencia.numero || "",
            categoria: licencia.categoria || "",
            fecha_emision: formatYMD(licencia.fecha_emision),
            fecha_vencimiento: formatYMD(licencia.fecha_vencimiento),
          },
        });
      }

      const body = req.body;
      const nombreImagen = req.file ? req.file.filename : undefined;

      await choferService.update(req.params.id, {
        nombre: body.nombre,
        apellido: body.apellido,
        dni: body.dni,
        telefono: body.telefono,
        direccion: body.direccion,
        estado: body["activo-inactivo"],
        email: body.email || null,
        fechaNacimiento: body.fechaNacimiento || null,
        fechaIngreso: body.fechaIngreso || null,
        turno: body.Turno || null,
      });

      const licencia = chofer.licencias?.[0];

      let datosLicencia = {
        numero: body.numero_licencia,
        categoria: body.categoria,
        fecha_emision: body.fecha_emision || null,
        fecha_vencimiento: body.fecha_vencimiento || null,
      };

      if (nombreImagen) {
        datosLicencia.imagen = nombreImagen;
      }

      if (licencia) {
        await db.LicenciaChofer.update(datosLicencia, {
          where: { id_chofer: chofer.id_chofer },
        });
      } else {
        datosLicencia.id_chofer = chofer.id_chofer;
        await db.LicenciaChofer.create(datosLicencia);
      }

      // LÓGICA DE AUDITORÍA: Registrar Edición
      const userId = req.session?.usuarioLogueado?.id || 1;
      await auditoriaService.registrarAuditoria(
        userId, 
        "chofer", 
        req.params.id, 
        "EDITAR", 
        { nombre: chofer.nombre, apellido: chofer.apellido, estado: chofer.estado }, 
        { nombre: body.nombre, apellido: body.apellido, estado: body["activo-inactivo"] },
        `Edición de chofer ID: ${req.params.id} (${body.nombre} ${body.apellido})`
      );

      return res.redirect("/Choferes");
    } catch (error) {
      console.log(error);
      return res.send("Error");
    }
  },

  desactivarChofer: async (req, res) => {
    try {
      await choferService.update(req.params.id, { estado: "Inactivo" });
      
      const userId = req.session?.usuarioLogueado?.id || 1;
      await auditoriaService.registrarAuditoria(userId, "chofer", req.params.id, "EDITAR", null, { estado: "Inactivo" }, `Desactivación de chofer ID: ${req.params.id}`);

      return res.redirect("/Choferes");
    } catch (error) {
      console.log(error);
      return res.send("Error");
    }
  },

  activarChofer: async (req, res) => {
    try {
      await choferService.update(req.params.id, { estado: "Activo" });

      const userId = req.session?.usuarioLogueado?.id || 1;
      await auditoriaService.registrarAuditoria(userId, "chofer", req.params.id, "EDITAR", null, { estado: "Activo" }, `Activación de chofer ID: ${req.params.id}`);

      return res.redirect("/Choferes");
    } catch (error) {
      console.log(error);
      return res.send("Error");
    }
  },
};

module.exports = choferController;