function userMiddleware(req, res, next) {
  // Si hay un usuario logueado en la sesión, lo pasamos a res.locals
  // para que todas las vistas (incluido el sidebar) puedan verlo
  if (req.session && req.session.usuarioLogueado) {
    res.locals.usuarioLocal = req.session.usuarioLogueado;
  } else {
    res.locals.usuarioLocal = null;
  }
  next();
}

module.exports = userMiddleware;
