const http = require('http');
const fs = require('fs');
const server = http.createServer((req, res) => {
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    if (req.method === 'GET' && req.url === '/') {
        const html = fs.readFileSync('index_rutas.html');
        res.end(html);
    }
    else if (req.method === 'GET' && req.url === '/acerca') {
        const html = fs.readFileSync('acerca.html');
        res.end(html);
    }
    else if (req.method === 'GET' && req.url === '/servicios') {
        const html = fs.readFileSync('servicios.html');
        res.end(html);
    }
    else if (req.method === 'GET' && req.url === '/contacto') {
        const html = fs.readFileSync('contacto.html');
        res.end(html);
    }
    else if (req.method === 'POST' && req.url === '/contacto') {
        console.log('Formulario recibido');
        res.statusCode = 200;
        res.end('Formulario recibido correctamente');
    }
    else {
        res.statusCode = 404;
        res.end('404 - Pagina no encontrada');
    }
});
server.listen(3000, () => {
    console.log('Servidor disponible en http://localhost:3000');
});