// Persistencia: este archivo concentra SQLite y las sentencias SQL.
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const archivo = process.env.LAB07_DB_PATH
    ? path.resolve(process.env.LAB07_DB_PATH)
    : path.join(__dirname, 'contactos.db');
fs.mkdirSync(path.dirname(archivo), { recursive: true });
const db = new DatabaseSync(archivo);
db.exec(`CREATE TABLE IF NOT EXISTS contactos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL,
    mensaje TEXT NOT NULL
)`);
const consultarContactos = db.prepare(`
    SELECT id, nombre, correo, mensaje FROM contactos ORDER BY id`);
const insertarContacto = db.prepare(`
    INSERT INTO contactos (nombre, correo, mensaje) VALUES (?, ?, ?)`);
function listar() { return consultarContactos.all(); }
function insertar({ nombre, correo, mensaje }) {
    const resultado = insertarContacto.run(nombre, correo, mensaje);
    return Number(resultado.lastInsertRowid);
}
function cerrarBase() { db.close(); }
module.exports = { listar, insertar, cerrarBase };
