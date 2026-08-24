const http = require('http');
const fs = require('fs'); //File System. Nos permite hacer que Node.js lea archivos de tu computador.
const server = http.createServer((req, res) => {
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    const html = fs.readFileSync('index.html');//leeemos el archivo HTML
    res.end(html);//MOSTRAMOS HTML Envía ese contenido como respuesta al navegador.
});
server.listen(3000, () => {
    console.log('http://localhost:3000');
});