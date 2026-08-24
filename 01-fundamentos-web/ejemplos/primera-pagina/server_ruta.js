const http = require('http');
const fs = require('fs'); //File System. Nos permite hacer que Node.js lea archivos de tu computador.

const server = http.createServer((req, res) => {
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    if (req.url === '/') {
        const html = fs.readFileSync('index_rutas.html');
        res.end(html);
    }
    else if(req.url === '/acerca'){//ruta especifica dentro de la ruta principal
        res.end('acerca del curso de ingeniería web');
    }
    else {
        res.statusCode = 404;
        res.end('404 - Pagina no encontrada');
    }
});
server.listen(3000, () => {
    console.log('http://localhost:3000');
});