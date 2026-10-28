// Utilidades del script "compartir" (no levanta túneles ni toca la base).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { extraerUrl, generarClave } = require("../scripts/compartir");

test("extrae el link público de la salida de cloudflared", () => {
  const salida = [
    "2026-10-28T12:00:00Z INF Thank you for trying Cloudflare Tunnel. Doing so, without a Cloudflare account, is a quick way to experiment.",
    "2026-10-28T12:00:02Z INF Requesting new quick Tunnel on trycloudflare.com...",
    "2026-10-28T12:00:04Z INF +--------------------------------------------------------------------------------------------+",
    "2026-10-28T12:00:04Z INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |",
    "2026-10-28T12:00:04Z INF |  https://mis-vehiculos-prueba-123.trycloudflare.com                                        |",
  ].join("\n");
  assert.equal(extraerUrl(salida), "https://mis-vehiculos-prueba-123.trycloudflare.com");
  assert.equal(extraerUrl("sin link acá, solo api.trycloudflare.com sin https"), null);
  assert.equal(extraerUrl(""), null);
});

test("las contraseñas generadas son largas, distintas y sin caracteres raros", () => {
  const claves = new Set(Array.from({ length: 50 }, generarClave));
  assert.equal(claves.size, 50);
  for (const c of claves) {
    assert.equal(c.length, 12);
    assert.match(c, /^[A-Za-z0-9_-]+$/);
  }
});
