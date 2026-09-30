const http = require('http');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

// Abrir o crear la base de datos
const db = new DatabaseSync('contactos.db');

// Crear la tabla si todavía no existe
db.exec(`
    CREATE TABLE IF NOT EXISTS contactos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL,
        mensaje TEXT NOT NULL
    )
`);

const insertarContacto = db.prepare(`
    INSERT INTO contactos (nombre, correo, mensaje)
    VALUES (?, ?, ?)
`);

const consultarContactos = db.prepare(`
    SELECT id, nombre, correo, mensaje
    FROM contactos
    ORDER BY id`);

// Presentación compartida: misma estructura visual de Soporte Web.
// Esta función presenta las confirmaciones y errores del formulario en HTML.
function escapar(valor = '') {
    return String(valor)
        .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function plantilla(titulo, contenido) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapar(titulo)} | Soporte Web</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header>
        <a class="marca" href="/">Soporte Web</a>
        <nav aria-label="Navegación principal">      <a href="/">Inicio</a>      <a href="/acerca">Acerca de</a>      <a href="/servicios">Servicios</a>      <a href="/contacto">Contacto</a>      <a href="/contactos">Consultar contactos</a></nav>
    </header>
    <main>${contenido}</main>
    <footer>Ingeniería Web · Demostración académica</footer>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
    console.log('Método:', req.method);
    console.log('URL:', req.url);

    if (req.method === 'GET' && req.url === '/') {
        const html = fs.readFileSync('index_rutas.html');

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8'
        });

        return res.end(html);
    }

    else if (req.method === 'GET' && req.url === '/acerca') {
        const html = fs.readFileSync('acerca.html');

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8'
        });

        return res.end(html);
    }

    else if (req.method === 'GET' && req.url === '/servicios') {
        const html = fs.readFileSync('servicios.html');

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8'
        });

        return res.end(html);
    }

    else if (req.method === 'GET' && req.url === '/contacto') {
        const html = fs.readFileSync('contacto.html');

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8'
        });

        return res.end(html);
    }

    else if (req.method === 'GET' && req.url === '/styles.css') {
        const css = fs.readFileSync('styles.css');

        res.writeHead(200, {
            'Content-Type': 'text/css; charset=UTF-8'
        });

        return res.end(css);
    }

    // PARTE A: operación de consulta mostrada en la diapositiva 17.
    else if (req.method === 'GET' && req.url === '/api/contactos') {
        try {
            const contactos = consultarContactos.all();
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            return res.end(JSON.stringify(contactos));
        } catch (error) {
            console.error('Error al consultar:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'No fue posible consultar los contactos'
            }));
        }
    }

    // PARTE B: ruta de la página mostrada en la diapositiva 18.
    else if (req.method === 'GET' &&
        req.url === '/contactos') {
      const html = fs.readFileSync(
          'contactos.html');
      res.writeHead(200, { 'Content-Type':
          'text/html; charset=UTF-8' });
      return res.end(html);
    }

    else if (req.method === 'POST' && req.url === '/contacto') {
        let cuerpo = '';

        req.on('data', fragmento => {
            cuerpo += fragmento.toString();
        });

        req.on('end', () => {
            const datos = new URLSearchParams(cuerpo);

            const nombre = datos.get('nombre')?.trim();
            const correo = datos.get('correo')?.trim();
            const mensaje = datos.get('mensaje')?.trim();

            console.log('Nombre:', nombre);
            console.log('Correo:', correo);
            console.log('Mensaje:', mensaje);

            if (!nombre || !correo || !mensaje) {
                res.writeHead(400, {
                    'Content-Type': 'text/html; charset=UTF-8'
                });

                return res.end(plantilla('Solicitud incorrecta', `
                    <section class="panel error">
                        <p class="etiqueta">Error 400</p>
                        <h1>Solicitud incorrecta</h1>
                        <p>Todos los campos son obligatorios.</p>
                        <a class="boton secundario" href="/contacto">Volver al formulario</a>
                    </section>
                `));
            }

            try {
                const resultado = insertarContacto.run(
                    nombre,
                    correo,
                    mensaje
                );

                console.log(
                    'Contacto almacenado con id:',
                    resultado.lastInsertRowid
                );

                res.writeHead(201, {
                    'Content-Type': 'text/html; charset=UTF-8'
                });

                return res.end(plantilla('Contacto registrado', `
                    <section class="panel">
                        <p class="etiqueta">Confirmación</p>
                        <h1>Contacto registrado</h1>
                        <p>La información fue almacenada correctamente.</p>
                        <div class="acciones">
                            <a class="boton" href="/contacto">Registrar otro contacto</a>
                            <a class="boton secundario" href="/contactos">Consultar contactos</a>
                        </div>
                    </section>
                `));
            }

            catch (error) {
                console.error(
                    'Error al almacenar el contacto:',
                    error
                );

                res.writeHead(500, {
                    'Content-Type': 'text/html; charset=UTF-8'
                });

                return res.end(plantilla('Error interno', `
                    <section class="panel error">
                        <p class="etiqueta">Error 500</p>
                        <h1>No fue posible guardar el contacto</h1>
                        <p>Inténtalo de nuevo.</p>
                        <a class="boton secundario" href="/contacto">Volver al formulario</a>
                    </section>
                `));
            }
        });

        return;
    }

    else {
        res.writeHead(404, {
            'Content-Type': 'text/html; charset=UTF-8'
        });

        return res.end(plantilla('Página no encontrada', `
            <section class="panel error">
                <p class="etiqueta">Error 404</p>
                <h1>Página no encontrada</h1>
                <p>La dirección solicitada no está disponible.</p>
                <a class="boton secundario" href="/">Volver al inicio</a>
            </section>
        `));
    }
});

server.listen(3000, () => {
    console.log(
        'Servidor disponible en http://localhost:3000'
    );
});
