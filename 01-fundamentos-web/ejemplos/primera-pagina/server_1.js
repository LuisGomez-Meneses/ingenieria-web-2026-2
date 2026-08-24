const http = require('http');
const server = http.createServer((res) => {
    res.end('Hola desde mi servidor Node.js');
});
server.listen(3000, () => {
    console.log('http://localhost:3000');
});