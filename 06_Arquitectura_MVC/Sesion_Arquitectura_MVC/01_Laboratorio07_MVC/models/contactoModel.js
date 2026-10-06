// Modelo: reglas del contacto y coordinación con el acceso a datos.
// El modelo incluye comportamiento; no equivale al archivo contactos.db.
const repositorio = require('../data/contactoRepository');
class ErrorValidacion extends Error {}
function listarContactos() {
    return repositorio.listar();
}
function crearContacto(datos) {
    const contacto = {
        nombre: String(datos.nombre ?? '').trim(),
        correo: String(datos.correo ?? '').trim(),
        mensaje: String(datos.mensaje ?? '').trim()
    };
    // Se conserva la regla del Laboratorio 06: tres campos obligatorios.
    if (!contacto.nombre || !contacto.correo || !contacto.mensaje) {
        throw new ErrorValidacion('Todos los campos son obligatorios.');
    }
    if (contacto.mensaje.length < 10) {
        throw new ErrorValidacion(
            'El mensaje debe tener al menos 10 caracteres.'
        );
    }
    
    return repositorio.insertar(contacto);
}
module.exports = { listarContactos, crearContacto, ErrorValidacion };
