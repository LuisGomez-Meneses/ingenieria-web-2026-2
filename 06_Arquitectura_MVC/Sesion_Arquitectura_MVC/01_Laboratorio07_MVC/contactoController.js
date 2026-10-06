// Controlador: interpreta HTTP, llama al modelo y prepara la respuesta.
const modelo = require('../models/contactoModel');
const vista = require('../views/respuestas');
function listarContactos(req, res) {
    try {
        const contactos = modelo.listarContactos();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        return res.end(JSON.stringify(contactos));
    } catch (error) {
        console.error('Error al consultar:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        return res.end(JSON.stringify({ error: 'No fue posible consultar los contactos' }));
    }
}
async function registrarContacto(req, res) {
    const fragmentos = [];
    let tamano = 0;
    // La lectura de HTTP pertenece al controlador, no al repositorio SQL.
    for await (const fragmento of req) {
        tamano += fragmento.length;
        if (tamano > 65536) {
            res.writeHead(413, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(vista.errorHtml(413, 'Formulario demasiado grande', 'Reduce el texto e intenta de nuevo.'));
            return;
        }
        fragmentos.push(fragmento);
    }
    const formulario = new URLSearchParams(Buffer.concat(fragmentos).toString('utf8'));
    const datos = Object.fromEntries(formulario);
    try {
        const id = modelo.crearContacto(datos);
        console.log('Contacto almacenado con id:', id);
        res.writeHead(201, { 'Content-Type': 'text/html; charset=UTF-8' });
        return res.end(vista.confirmacion());
    } catch (error) {
        const esValidacion = error instanceof modelo.ErrorValidacion;
        const codigo = esValidacion ? 400 : 500;
        if (!esValidacion) console.error('Error al almacenar:', error.message);
        res.writeHead(codigo, { 'Content-Type': 'text/html; charset=UTF-8' });
        return res.end(vista.errorHtml(codigo,
            esValidacion ? 'Solicitud incorrecta' : 'Error interno',
            esValidacion ? error.message : 'No fue posible guardar el contacto.'));
    }
}
module.exports = { listarContactos, registrarContacto };
