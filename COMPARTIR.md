# Compartir el sistema desde tu PC (para que otras personas lo prueben)

El sistema corre **en tu PC** y un túnel gratuito de Cloudflare le da un link `https://algo.trycloudflare.com` que podés pasar a quien quieras.
No hace falta abrir puertos del router, tener IP fija ni pagar nada.

## Qué necesitás (una sola vez)
1. **Node.js (LTS)**: https://nodejs.org
2. **MySQL encendido**: lo más simple es **XAMPP** (https://www.apachefriends.org) → botón *Start* en MySQL.
3. **cloudflared** (el túnel, ~40 MB). En una terminal:
   ```
   winget install --id Cloudflare.cloudflared
   ```
   Cerrá y abrí la terminal para que lo reconozca. Si no tenés `winget`, bajá `cloudflared-windows-amd64.exe` de
   https://github.com/cloudflare/cloudflared/releases y guardalo como `herramientas\cloudflared.exe` dentro del proyecto.

## Cómo se usa
En una terminal dentro de la carpeta del proyecto (rama `claude/compartir-local`):

```
npm install            # solo la primera vez
npm run compartir
```

Cuando termina de arrancar muestra algo así:

```
 LINK PARA COMPARTIR (válido mientras esta ventana siga abierta)
    https://mis-vehiculos-123.trycloudflare.com
 Usuarios para pasar a quienes van a probar:
    usuario  ->  clave: Xk3d9...   (sin reportes ni auditoría)
    admin    ->  clave: Qp7s2...   (ve TODO: no se la pases a cualquiera)
```

Pasale a la gente **el link y el usuario `usuario` con su clave**. El `admin` guardalo para vos.

- Las claves se generan **al azar** la primera vez (no se usan las de ejemplo porque el sistema queda en internet).
  Si ya existían y no las recordás: `npm run compartir -- --nuevas-claves` genera otras y las muestra.
  También podés fijarlas con `ADMIN_PASSWORD` y `USUARIO_PASSWORD` en un archivo `.env`.
- El sistema arranca **vacío**: quienes prueben cargan sus propios vehículos y choferes.
- Vos seguís entrando por `http://localhost:3000` (o por el mismo link).
- Para **cortar el acceso**: `Ctrl + C` en la terminal (o cerrarla). El link deja de funcionar al instante.

## Preguntas frecuentes
**¿Dónde se guardan los archivos que suban?**
En **tu PC**. El sistema, la base de datos y los archivos están en tu computadora; el túnel solo pasa el tráfico.
Los documentos (PDF, DNI, actas) quedan en la carpeta `uploads/documentos`, las fotos de cédula/título/seguro/licencia en `public/img/...`
y los datos en la base MySQL de XAMPP. No se suben a ninguna nube.

**¿Les va a andar bien?**
Sí, para pruebas con pocas personas. Depende de tu conexión: lo que importa es tu velocidad de **subida** (la que ven los demás). Las pantallas son
livianas; subir PDF o fotos grandes es lo más lento. Condiciones:
- Tu PC tiene que estar **encendida, con internet y sin suspenderse** (Configuración > Sistema > Inicio/apagado y suspensión → "Nunca" mientras dure la prueba).
- La ventana de la terminal tiene que seguir abierta.
- **El link cambia cada vez** que volvés a ejecutar `npm run compartir`; hay que pasar el nuevo.
- Es un servicio gratuito sin garantías: sirve para probar, no para producción.

**¿Es seguro?**
Mientras esté prendido, cualquiera que tenga el link puede ver la pantalla de ingreso. El sistema tiene bloqueo tras 5 intentos fallidos, cookies seguras,
protección CSRF y permisos por usuario, pero conviene: no difundir el link, no pasar la clave de `admin`, y cortar (`Ctrl + C`) cuando terminen.
Tu PC no queda expuesta: solo se publica este sistema, no el resto de tus archivos ni la base de datos.

**Dice que falta cloudflared** → instalalo (paso 3) y volvé a ejecutar `npm run compartir`.
**No conecta a la base de datos** → encendé MySQL en XAMPP. Si tu MySQL tiene contraseña, copiá `.env.example` a `.env` y completá `DB_PASSWORD=`.
**Antes de apagar la PC** hacé una copia de la carpeta `uploads/` y de `public/img/` si querés conservar lo que subieron, y de la base desde phpMyAdmin (Exportar).
