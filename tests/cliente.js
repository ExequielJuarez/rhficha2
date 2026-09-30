// Cliente HTTP mínimo para pruebas: mantiene cookies de sesión y el token CSRF.
class Cliente {
  constructor(base) {
    this.base = base;
    this.cookies = {};
    this.csrf = "";
  }

  _cookieHeader() {
    return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  }

  _guardarCookies(res) {
    const lista = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
    for (const c of lista) {
      const [par] = c.split(";");
      const i = par.indexOf("=");
      this.cookies[par.slice(0, i)] = par.slice(i + 1);
    }
  }

  async pedir(metodo, ruta, { cuerpo, multipart, json, headers = {}, sinToken = false } = {}) {
    const opts = { method: metodo, redirect: "manual", headers: { cookie: this._cookieHeader(), ...headers } };
    let url = this.base + ruta;
    if (metodo !== "GET") {
      if (multipart) {
        multipart.append("__x", "1");
        opts.body = multipart;
        if (!sinToken) url += (url.includes("?") ? "&" : "?") + "_csrf=" + this.csrf;
      } else if (json) {
        opts.body = JSON.stringify(json);
        opts.headers["content-type"] = "application/json";
        if (!sinToken) opts.headers["x-csrf-token"] = this.csrf;
      } else {
        const datos = new URLSearchParams();
        for (const [k, v] of Object.entries(cuerpo || {})) {
          if (Array.isArray(v)) v.forEach((x) => datos.append(k, x));
          else datos.append(k, v);
        }
        if (!sinToken) datos.append("_csrf", this.csrf);
        opts.body = datos;
        opts.headers["content-type"] = "application/x-www-form-urlencoded";
      }
    }
    const res = await fetch(url, opts);
    this._guardarCookies(res);
    const texto = await res.text();
    const m = texto.match(/window\.CSRF_TOKEN = "([a-f0-9]+)"/);
    if (m) this.csrf = m[1];
    return { status: res.status, location: res.headers.get("location"), texto, headers: res.headers };
  }

  get(ruta, o) { return this.pedir("GET", ruta, o); }
  post(ruta, cuerpo, o = {}) { return this.pedir("POST", ruta, { cuerpo, ...o }); }

  async login(usuario, clave) {
    await this.get("/InicioSesion");
    const r = await this.post("/InicioSesion", { Usuario: usuario, Contrasena: clave });
    // Tras iniciar sesión la sesión se regenera: se visita una página para tomar el token nuevo
    if (r.status === 302 && r.location) await this.get(r.location);
    return r;
  }
}

module.exports = { Cliente };
