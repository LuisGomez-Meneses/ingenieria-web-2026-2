// Punto de entrada: inicia HTTP y delega las solicitudes al enrutador.
const http = require('node:http');
const { atenderRuta } = require('./routes/rutas');
const { cerrarBase } = require('./data/contactoRepository');
const puerto = Number(process.env.PORT || 3000);
const server = http.createServer(async (req, res) => {
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    try {
        await atenderRuta(req, res);
    } catch (error) {
        console.error('Error no esperado:', error.message);
        if (res.headersSent) return res.end();
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('No fue posible completar la solicitud.');
    }
});
server.on('error', error => {
    console.error(error.code === 'EADDRINUSE'
        ? `El puerto ${puerto} está ocupado. Detén el servidor anterior con Ctrl + C.`
        : error.message);
    cerrarBase();
    process.exitCode = 1;
});
server.listen(puerto, '127.0.0.1', () => {
    console.log(`Servidor disponible en http://localhost:${puerto}`);
});
function finalizar() {
    server.close(() => { cerrarBase(); process.exit(0); });
}
process.on('SIGINT', finalizar);
process.on('SIGTERM', finalizar);
