// src/middlewares/authMiddleware.js

function authMiddleware(req, res, next) {
  if (!req.session || !req.session.usuarioLogueado) {
    return res.redirect("/InicioSesion");
  }

  const user = req.session.usuarioLogueado;

  if (user.rol === "Administrador") {
    return next();
  }

  const permisos = user.permisos || [];
  const rutaSolicitada = req.path;

  const reglasDeAcceso = [
    { prefijo: "/Usuarios/Roles", permisoRequerido: "Roles" },
    { prefijo: "/Usuarios", permisoRequerido: "Usuarios" },
    { prefijo: "/Vehicles", permisoRequerido: "Vehicles" },
    { prefijo: "/CargaVehiculo", permisoRequerido: "Vehicles" },
    { prefijo: "/ActualizarKm", permisoRequerido: "Vehicles" },
    { prefijo: "/asignaciones", permisoRequerido: "Vehicles" },
    { prefijo: "/Choferes", permisoRequerido: "Choferes" },
    { prefijo: "/Mantenimientos", permisoRequerido: "Mantenimientos" },
    { prefijo: "/CargaMantenimiento", permisoRequerido: "Mantenimientos" },
    { prefijo: "/Tools", permisoRequerido: "Tools" },
    { prefijo: "/Alertas", permisoRequerido: "Alertas" },
    { prefijo: "/Reportes", permisoRequerido: "Reportes" },
    { prefijo: "/Auditoria", permisoRequerido: "Auditoria" },
    { prefijo: "/Siniestros", permisoRequerido: "Siniestros" }, // NUEVO MÓDULO BLINDADO
  ];

  let permisoNecesario = null;

  for (let regla of reglasDeAcceso) {
    if (rutaSolicitada.startsWith(regla.prefijo)) {
      permisoNecesario = regla.permisoRequerido;
      break;
    }
  }

  if (permisoNecesario) {
    if (permisos.includes(permisoNecesario)) {
      return next(); 
    } else {
      return res.status(403).send(`
        <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; max-width: 500px; border-top: 5px solid #ef4444;">
                <svg style="width: 60px; height: 60px; color: #ef4444; margin: 0 auto 15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">Acceso Denegado</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                    No tienes los privilegios necesarios para acceder a esta sección.
                </p>
                <a href="javascript:history.back()" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; transition: background 0.3s;">
                    Volver a mi área segura
                </a>
            </div>
        </div>
      `);
    }
  }

  return next();
}

module.exports = authMiddleware;