// Datos ficticios. No elimina registros y no duplica estos correos al repetirlo.
const modelo = require('../models/contactoModel');
const { cerrarBase } = require('../data/contactoRepository');
try {
    const ejemplos = [
        { nombre: 'Ana', correo: 'ana@example.com', mensaje: 'Necesito información sobre una página web.' },
        { nombre: 'Beatriz', correo: 'beatriz@example.com', mensaje: 'Quisiera soporte para el formulario de contacto.' }
    ];
    const existentes = new Set(modelo.listarContactos().map(c => c.correo));
    for (const contacto of ejemplos) {
        if (!existentes.has(contacto.correo)) console.log('Contacto ficticio creado:', modelo.crearContacto(contacto));
    }
    console.log('Total de contactos:', modelo.listarContactos().length);
} finally { cerrarBase(); }
