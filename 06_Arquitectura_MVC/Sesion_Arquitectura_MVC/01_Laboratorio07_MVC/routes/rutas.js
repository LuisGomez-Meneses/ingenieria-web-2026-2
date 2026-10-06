// Enrutador: asocia un método y una ruta con una acción o una página.
const fs = require('node:fs');
const path = require('node:path');
const controlador = require('../controllers/contactoController');
const { errorHtml } = require('../views/respuestas');
const paginas = {
    '/': 'index_rutas.html', '/acerca': 'acerca.html',
    '/servicios': 'servicios.html', '/contacto': 'contacto.html',
    '/contactos': 'contactos.html'
};
async function atenderRuta(req, res) {
    const ruta = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && Object.hasOwn(paginas, ruta)) {
        const html = fs.readFileSync(path.join(__dirname, '..', 'views', paginas[ruta]));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        return res.end(html);
    }
    if (req.method === 'GET' && ruta === '/styles.css') {
        const css = fs.readFileSync(path.join(__dirname, '..', 'public', 'styles.css'));
        res.writeHead(200, { 'Content-Type': 'text/css; charset=UTF-8' });
        return res.end(css);
    }
    if (req.method === 'GET' && ruta === '/api/contactos') {
        return controlador.listarContactos(req, res);
    }
    if (req.method === 'POST' && ruta === '/contacto') {
        return controlador.registrarContacto(req, res);
    }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
    return res.end(errorHtml(404, 'Página no encontrada', 'La dirección solicitada no está disponible.'));
}
module.exports = { atenderRuta };
