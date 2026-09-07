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

// Preparar la sentencia SQL
const insertarContacto = db.prepare(`
    INSERT INTO contactos (nombre, correo, mensaje)
    VALUES (?, ?, ?)
`);

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

                return res.end(`
                    <h1>Solicitud incorrecta</h1>
                    <p>Todos los campos son obligatorios.</p>
                    <a href="/contacto">Regresar</a>
                `);
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

                return res.end(`
                    <h1>Contacto registrado</h1>
                    <p>La información fue almacenada correctamente.</p>
                    <a href="/contacto">Registrar otro contacto</a>
                `);
            }

            catch (error) {
                console.error(
                    'Error al almacenar el contacto:',
                    error
                );

                res.writeHead(500, {
                    'Content-Type': 'text/html; charset=UTF-8'
                });

                return res.end(`
                    <h1>Error interno</h1>
                    <p>No fue posible almacenar la información.</p>
                `);
            }
        });

        return;
    }

    else {
        res.writeHead(404, {
            'Content-Type': 'text/html; charset=UTF-8'
        });

        return res.end('404 - Página no encontrada');
    }
});

server.listen(3000, () => {
    console.log(
        'Servidor disponible en http://localhost:3000'
    );
});