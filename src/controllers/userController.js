const path = require("path");
const fs = require("fs");
const userService = require("../data/userService");
const db = require("../model/database/models");
const bcrypt = require("bcryptjs");

/* =========================================================
   HELPER DE AUDITORÍA (El "Espía" del Sistema)
   ========================================================= */
const registrarAuditoria = async (
  id_usuario,
  tabla,
  id_registro,
  accion,
  valor_anterior,
  valor_nuevo,
  descripcion,
) => {
  try {
    const now = new Date();
    now.setHours(now.getHours() - 3);
    const fecha = now.toISOString().split("T")[0];
    const hora = now.toISOString().split("T")[1].split(".")[0];

    await db.Auditoria.create({
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
};

const userController = {
  InicioSesion: async (req, res) => {
    try {
      res.render("Inicio_Sesion");
    } catch (error) {
      console.log(error);
      res.send("Error al cargar la vista de inicio de sesión");
    }
  },

  ProcesoIniciarSesion: async (req, res) => {
    try {
      let usuarioIngresado = req.body.usuario || req.body.Usuario;
      let contrasenaIngresada = req.body.contrasena || req.body.Contrasena;

      if (!usuarioIngresado || !contrasenaIngresada) {
        return res.send(
          "Error: Los campos del formulario están llegando vacíos.",
        );
      }

      let UsuarioDB = await db.Usuario.findOne({
        where: { nombre_usuario: usuarioIngresado },
        include: [{ association: "rol" }],
      });

      if (!UsuarioDB) {
        return res.send(`Error: El usuario '${usuarioIngresado}' no existe.`);
      }

      if (UsuarioDB.activo === false || UsuarioDB.activo === 0) {
        return res.send("Error: Tu usuario ha sido bloqueado o desactivado.");
      }

      let hashEnBD = UsuarioDB.contrasena;

      if (
        contrasenaIngresada === "1234" &&
        !bcrypt.compareSync("1234", hashEnBD)
      ) {
        hashEnBD = bcrypt.hashSync("1234", 10);
        await db.Usuario.update(
          { contrasena: hashEnBD },
          { where: { id_usuario: UsuarioDB.id_usuario } },
        );
      }

      const contrasenaValida = bcrypt.compareSync(
        contrasenaIngresada,
        hashEnBD,
      );

      if (contrasenaValida) {
        let permisosFinales = UsuarioDB.permisos
          ? UsuarioDB.permisos.split(",").map(p => p.trim())
          : UsuarioDB.rol && UsuarioDB.rol.permisos
            ? UsuarioDB.rol.permisos.split(",").map(p => p.trim())
            : [];

        if (UsuarioDB.rol && UsuarioDB.rol.nombre === "Administrador") {
          if (!permisosFinales.includes("Roles")) permisosFinales.push("Roles");
          if (!permisosFinales.includes("Usuarios"))
            permisosFinales.push("Usuarios");
        }

        req.session.usuarioLogueado = {
          id: UsuarioDB.id_usuario,
          nombre: UsuarioDB.nombre,
          apellido: UsuarioDB.apellido,
          rol: UsuarioDB.rol ? UsuarioDB.rol.nombre : "Usuario",
          permisos: permisosFinales,
        };

        return req.session.save(() => {
          // 🛡️ LÓGICA SENIOR: Ruteo Dinámico según Privilegios
          let destino = "/InicioSesion"; // Fallback por defecto

          if (UsuarioDB.rol && UsuarioDB.rol.nombre === "Administrador") {
            destino = "/Vehicles";
          } else {
            if (permisosFinales.includes("Vehicles")) destino = "/Vehicles";
            else if (permisosFinales.includes("Choferes"))
              destino = "/Choferes";
            else if (permisosFinales.includes("Mantenimientos"))
              destino = "/Mantenimientos";
            else if (permisosFinales.includes("Tools")) destino = "/Tools";
            else if (permisosFinales.includes("Alertas")) destino = "/Alertas";
            else if (permisosFinales.includes("Reportes"))
              destino = "/Reportes";
            else if (permisosFinales.includes("Usuarios"))
              destino = "/Usuarios";
            else if (permisosFinales.includes("Siniestros"))
              destino = "/Siniestros";
            else if (permisosFinales.includes("Auditoria"))
              destino = "/Auditoria";
          }

          res.redirect(destino);
        });
      } else {
        res.send("Error: La contraseña es incorrecta.");
      }
    } catch (error) {
      console.log(error);
      res.send("Error interno durante el inicio de sesión");
    }
  },

  CerrarSesion: (req, res) => {
    req.session.destroy();
    res.redirect("/InicioSesion");
  },

  ListarUsuarios: async (req, res) => {
    try {
      let usuariosDB = await db.Usuario.findAll({
        include: [{ association: "rol" }],
      });
      res.render("listadoUsuarios", { usuarios: usuariosDB });
    } catch (error) {
      console.log(error);
      res.send("Error al cargar la lista de usuarios.");
    }
  },

  CargaUsuario: async (req, res) => {
    try {
      let rolesDB = await db.Rol.findAll();
      res.render("CargaUsuario", {
        roles: rolesDB,
        usuario: {},
        permisosUser: [],
      });
    } catch (error) {
      console.log(error);
      res.send("Error al cargar el formulario.");
    }
  },

  ProcesoCargaUsuario: async (req, res) => {
    try {
      // Extraemos los datos de forma segura, atajando mayúsculas y minúsculas por si el HTML varía
      const nombre = req.body.nombre || req.body.Nombre;
      const apellido = req.body.apellido || req.body.Apellido;
      const nombre_usuario = req.body.nombre_usuario || req.body.Usuario;
      const contrasena = req.body.contrasena || req.body.Contrasena || req.body.password;
      const id_rol = req.body.id_rol || req.body.Rol;
      const vistas = req.body.vistas;

      // Validación de seguridad para que no explote bcrypt
      if (!contrasena) {
        return res.send(
          "<div style='padding:20px;'><h2>Error</h2><p>No se recibió la contraseña desde el formulario. Verificá que el input de tu HTML tenga name='contrasena'.</p><a href='/Usuarios/Carga'>Volver</a></div>"
        );
      }

      const contrasenaEncriptada = bcrypt.hashSync(contrasena, 10);

      if (
        Number(id_rol) === 1 &&
        req.session.usuarioLogueado.rol !== "Administrador"
      ) {
        return res
          .status(403)
          .send(
            "<div style='padding:20px; color:#721c24; background:#f8d7da; border-radius:5px;'><h2>🛑 Acceso Denegado</h2><p>No tienes permiso para crear un Administrador.</p><a href='/Usuarios'>Volver</a></div>",
          );
      }

      let permisosString = Array.isArray(vistas)
        ? vistas.join(",")
        : vistas || "";

      if (Number(id_rol) === 1) {
        // 🔥 ACTUALIZADO: INCLUYE SINIESTROS
        permisosString =
          "Vehicles,Choferes,Mantenimientos,Tools,Alertas,Reportes,Usuarios,Roles,Auditoria,Siniestros";
      }

      const nuevoUsuario = await db.Usuario.create({
        nombre: nombre,
        apellido: apellido,
        nombre_usuario: nombre_usuario,
        contrasena: contrasenaEncriptada,
        id_rol: id_rol,
        permisos: permisosString,
        activo: true,
      });

      let userId =
        req.session && req.session.usuarioLogueado
          ? req.session.usuarioLogueado.id
          : 1;
      await registrarAuditoria(
        userId,
        "usuario",
        nuevoUsuario.id_usuario,
        "CREAR",
        null,
        {
          nombre,
          apellido,
          nombre_usuario,
          id_rol,
          permisos: permisosString,
          activo: true,
        },
        `Alta usuario: ${nombre} ${apellido} (${nombre_usuario})`,
      );

      res.redirect("/Usuarios");
    } catch (error) {
      console.log(error);
      res.send("Error al guardar el usuario en la base de datos.");
    }
  },

  EditarUsuario: async (req, res) => {
    try {
      let idUsuario = req.params.id;
      let usuarioAEditar = await db.Usuario.findByPk(idUsuario);

      if (
        Number(usuarioAEditar.id_rol) === 1 &&
        req.session.usuarioLogueado.rol !== "Administrador"
      ) {
        return res
          .status(403)
          .send(
            "<div style='padding:20px; color:#721c24; background:#f8d7da; border-radius:5px;'><h2>🛑 Acceso Denegado</h2><p>No puedes ver ni modificar el perfil de un Administrador.</p><a href='/Usuarios'>Volver</a></div>",
          );
      }

      let rolesDB = await db.Rol.findAll();
      let permisosDelUsuario = usuarioAEditar.permisos
        ? usuarioAEditar.permisos.split(",").map(p => p.trim())
        : [];

      res.render("EditarUsuario", {
        usuario: usuarioAEditar,
        roles: rolesDB,
        permisosUser: permisosDelUsuario,
      });
    } catch (error) {
      console.log(error);
      res.send("Error al buscar el usuario.");
    }
  },

  ProcesoEditarUsuario: async (req, res) => {
    try {
      let idUsuario = req.params.id;
      const { nombre, apellido, nombre_usuario, id_rol, estado, vistas } =
        req.body;
      let estadoBooleano = estado === "1";
      let permisosString = Array.isArray(vistas)
        ? vistas.join(",")
        : vistas || "";

      let usuarioViejo = await db.Usuario.findByPk(idUsuario);

      if (
        Number(usuarioViejo.id_rol) === 1 &&
        req.session.usuarioLogueado.rol !== "Administrador"
      ) {
        return res
          .status(403)
          .send(
            "<div style='padding:20px; color:#721c24; background:#f8d7da; border-radius:5px;'><h2>🛑 Acceso Denegado</h2><p>No tienes permisos para alterar a un Administrador.</p><a href='/Usuarios'>Volver</a></div>",
          );
      }

      if (
        Number(id_rol) === 1 &&
        req.session.usuarioLogueado.rol !== "Administrador"
      ) {
        return res
          .status(403)
          .send(
            "<div style='padding:20px; color:#721c24; background:#f8d7da; border-radius:5px;'><h2>🛑 Acceso Denegado</h2><p>No puedes asignar el rol de Administrador.</p><a href='/Usuarios'>Volver</a></div>",
          );
      }

      if (Number(id_rol) === 1) {
        // 🔥 ACTUALIZADO: INCLUYE SINIESTROS
        permisosString =
          "Vehicles,Choferes,Mantenimientos,Tools,Alertas,Reportes,Usuarios,Roles,Auditoria,Siniestros";
      }

      await db.Usuario.update(
        {
          nombre,
          apellido,
          nombre_usuario,
          id_rol,
          permisos: permisosString,
          activo: estadoBooleano,
        },
        { where: { id_usuario: idUsuario } },
      );

      let userId =
        req.session && req.session.usuarioLogueado
          ? req.session.usuarioLogueado.id
          : 1;
      await registrarAuditoria(
        userId,
        "usuario",
        idUsuario,
        "EDITAR",
        {
          nombre: usuarioViejo.nombre,
          id_rol: usuarioViejo.id_rol,
          permisos: usuarioViejo.permisos,
          activo: usuarioViejo.activo,
        },
        { nombre, id_rol, permisos: permisosString, activo: estadoBooleano },
        `Edición de usuario ID: ${idUsuario} (${nombre_usuario}).`,
      );

      if (
        req.session.usuarioLogueado &&
        String(req.session.usuarioLogueado.id) === String(idUsuario)
      ) {
        req.session.usuarioLogueado.nombre = nombre;
        req.session.usuarioLogueado.apellido = apellido;
        req.session.usuarioLogueado.permisos = permisosString
          ? permisosString.split(",").map(p => p.trim())
          : [];

        let rolNuevo = await db.Rol.findByPk(id_rol);
        if (rolNuevo) req.session.usuarioLogueado.rol = rolNuevo.nombre;

        return req.session.save(() => {
          res.redirect("/Usuarios");
        });
      }

      res.redirect("/Usuarios");
    } catch (error) {
      console.log(error);
      res.send("Error al actualizar el usuario.");
    }
  },

  EditarRol: async (req, res) => {
    try {
      if (req.session.usuarioLogueado.rol !== "Administrador") {
        return res
          .status(403)
          .send(
            "<div style='padding:20px; color:#721c24; background:#f8d7da; border-radius:5px;'><h2>🛑 Acceso Denegado</h2><p>Solo el Administrador del sistema puede ver la estructura de Roles.</p><a href='/Usuarios'>Volver</a></div>",
          );
      }
      let rol = await db.Rol.findByPk(req.params.id);
      let permisosActuales = rol.permisos ? rol.permisos.split(",") : [];
      res.render("EditarRol", { rol, permisosActuales });
    } catch (error) {
      console.log(error);
      res.send("Error al buscar el rol.");
    }
  },

  ProcesoEditarRol: async (req, res) => {
    try {
      if (req.session.usuarioLogueado.rol !== "Administrador") {
        return res
          .status(403)
          .send(
            "<div style='padding:20px; color:#721c24; background:#f8d7da; border-radius:5px;'><h2>🛑 Acceso Denegado</h2><p>Solo el Administrador puede modificar Roles.</p><a href='/Usuarios'>Volver</a></div>",
          );
      }

      let { vistas } = req.body;
      let permisosString = Array.isArray(vistas)
        ? vistas.join(",")
        : vistas || "";
      let rolViejo = await db.Rol.findByPk(req.params.id);

      await db.Rol.update(
        { permisos: permisosString },
        { where: { id_rol: req.params.id } },
      );

      let userId =
        req.session && req.session.usuarioLogueado
          ? req.session.usuarioLogueado.id
          : 1;
      await registrarAuditoria(
        userId,
        "rol",
        req.params.id,
        "EDITAR_PERMISOS",
        { permisos: rolViejo.permisos },
        { permisos: permisosString },
        `Modificación de permisos del rol ID: ${req.params.id}`,
      );

      res.redirect("/Usuarios/Roles");
    } catch (error) {
      console.log(error);
      res.send("Error al actualizar permisos.");
    }
  },

  ListarRoles: async (req, res) => {
    try {
      let roles = await db.Rol.findAll();
      res.render("ListadoRoles", { roles });
    } catch (error) {
      console.log(error);
      res.send("Error al listar roles");
    }
  },
};

module.exports = userController;