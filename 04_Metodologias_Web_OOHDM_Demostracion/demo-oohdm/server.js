const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'datos');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'soporte.db'));
db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS solicitudes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  );
`);

function escapar(valor = '') {
  return String(valor)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function plantilla(titulo, contenido) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapar(titulo)} | Soporte Web</title><link rel="stylesheet" href="/styles.css"></head><body><header><a class="marca" href="/">Soporte Web</a><nav aria-label="Navegación principal"><a href="/">Inicio</a><a href="/acerca">Acerca de</a><a href="/clientes">Clientes</a></nav></header><main>${contenido}</main><footer>Ingeniería Web · Demostración académica</footer></body></html>`;
}

function responderHtml(res, html, estado = 200) {
  res.writeHead(estado, { 'Content-Type': 'text/html; charset=UTF-8' });
  res.end(html);
}

function servirArchivo(res, nombre, tipo) {
  fs.readFile(path.join(PUBLIC_DIR, nombre), (error, contenido) => {
    if (error) return responderError(res, 404, 'Recurso no encontrado');
    res.writeHead(200, { 'Content-Type': tipo });
    res.end(contenido);
  });
}

function responderError(res, estado, mensaje) {
  responderHtml(res, plantilla('Error', `<section class="panel error"><p class="etiqueta">Error ${estado}</p><h1>${escapar(mensaje)}</h1><a class="boton secundario" href="/clientes">Volver a clientes</a></section>`), estado);
}

function leerFormulario(req) {
  return new Promise((resolve, reject) => {
    let cuerpo = '';
    req.on('data', fragmento => {
      cuerpo += fragmento;
      if (cuerpo.length > 1_000_000) req.destroy();
    });
    req.on('end', () => resolve(Object.fromEntries(new URLSearchParams(cuerpo))));
    req.on('error', reject);
  });
}

function paginaClientes(res) {
  const clientes = db.prepare('SELECT id, nombre, correo FROM clientes ORDER BY nombre').all();
  const filas = clientes.length
    ? clientes.map(c => `<article class="fila"><div><strong>${escapar(c.nombre)}</strong><small>ID ${c.id} · ${escapar(c.correo)}</small></div><a class="enlace" href="/clientes/${c.id}">Ver detalle</a></article>`).join('')
    : '<div class="panel"><p>Todavía no hay clientes registrados.</p></div>';
  responderHtml(res, plantilla('Clientes', `<section class="encabezado-pagina"><p class="etiqueta">Estructura de acceso</p><h1>Índice de clientes</h1><p>Seleccione un cliente para consultar su información y registrar una solicitud.</p><a class="boton" href="/clientes/nuevo">Registrar cliente</a></section><section class="lista">${filas}</section>`));
}

function paginaNuevoCliente(res) {
  responderHtml(res, plantilla('Nuevo cliente', `<section class="encabezado-pagina"><p class="etiqueta">Nodo</p><h1>Registrar cliente</h1></section><section class="panel"><form method="POST" action="/clientes"><label>Nombre completo<input name="nombre" required maxlength="80" autocomplete="name"></label><label>Correo electrónico<input type="email" name="correo" required maxlength="120" autocomplete="email"></label><div><button type="submit">Guardar cliente</button></div></form></section>`));
}

function paginaDetalleCliente(res, id) {
  const cliente = db.prepare('SELECT id, nombre, correo FROM clientes WHERE id = ?').get(id);
  if (!cliente) return responderError(res, 404, 'El cliente no existe');
  const solicitudes = db.prepare('SELECT id, descripcion, fecha, estado FROM solicitudes WHERE cliente_id = ? ORDER BY id DESC').all(id);
  const filas = solicitudes.length
    ? `<table><thead><tr><th>ID</th><th>Problema</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${solicitudes.map(s => `<tr><td>${s.id}</td><td>${escapar(s.descripcion)}</td><td>${escapar(s.fecha)}</td><td>${escapar(s.estado)}</td></tr>`).join('')}</tbody></table>`
    : '<p>Este cliente todavía no tiene solicitudes.</p>';
  responderHtml(res, plantilla('Detalle del cliente', `<section class="encabezado-pagina"><p class="etiqueta">Nodo de detalle</p><h1>${escapar(cliente.nombre)}</h1><p>ID ${cliente.id} · ${escapar(cliente.correo)}</p><div class="acciones"><a class="boton" href="/clientes/${cliente.id}/solicitudes/nueva">Nueva solicitud</a><a class="boton secundario" href="/clientes">Volver al índice</a></div></section><section class="panel"><h2>Solicitudes registradas</h2>${filas}</section>`));
}

function paginaNuevaSolicitud(res, clienteId) {
  const cliente = db.prepare('SELECT id, nombre FROM clientes WHERE id = ?').get(clienteId);
  if (!cliente) return responderError(res, 404, 'El cliente no existe');
  responderHtml(res, plantilla('Nueva solicitud', `<section class="encabezado-pagina"><p class="etiqueta">Nodo de operación</p><h1>Nueva solicitud de soporte</h1></section><section class="panel"><form method="POST" action="/solicitudes"><div><label>Cliente seleccionado</label><p class="dato">ID ${cliente.id} · ${escapar(cliente.nombre)}</p></div><input type="hidden" name="cliente_id" value="${cliente.id}"><label>Descripción del problema<textarea name="descripcion" rows="5" required maxlength="500"></textarea></label><div><button type="submit">Registrar solicitud</button></div></form></section>`));
}

async function crearCliente(req, res) {
  const datos = await leerFormulario(req);
  const nombre = (datos.nombre || '').trim();
  const correo = (datos.correo || '').trim().toLowerCase();
  if (!nombre || !correo || !correo.includes('@')) return responderError(res, 400, 'Nombre y correo válido son obligatorios');
  try {
    const resultado = db.prepare('INSERT INTO clientes (nombre, correo) VALUES (?, ?)').run(nombre, correo);
    console.log(`Cliente registrado con ID: ${resultado.lastInsertRowid}`);
    res.writeHead(303, { Location: `/clientes/${resultado.lastInsertRowid}` });
    res.end();
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return responderError(res, 409, 'Ya existe un cliente con ese correo');
    throw error;
  }
}

async function crearSolicitud(req, res) {
  const datos = await leerFormulario(req);
  const clienteId = Number(datos.cliente_id);
  const descripcion = (datos.descripcion || '').trim();
  const cliente = db.prepare('SELECT id, nombre FROM clientes WHERE id = ?').get(clienteId);
  if (!Number.isInteger(clienteId) || !cliente) return responderError(res, 400, 'El cliente indicado no existe');
  if (!descripcion) return responderError(res, 400, 'La descripción es obligatoria');
  const fecha = new Date().toISOString().slice(0, 10);
  const resultado = db.prepare('INSERT INTO solicitudes (cliente_id, descripcion, fecha, estado) VALUES (?, ?, ?, ?)').run(clienteId, descripcion, fecha, 'Pendiente');
  console.log(`Solicitud registrada con ID: ${resultado.lastInsertRowid}`);
  responderHtml(res, plantilla('Confirmación', `<section class="panel"><p class="etiqueta">Confirmación</p><h1>Solicitud registrada</h1><p>La solicitud <strong>#${resultado.lastInsertRowid}</strong> quedó vinculada con <strong>${escapar(cliente.nombre)}</strong>.</p><p>Estado inicial: <strong>Pendiente</strong> · Fecha: ${fecha}</p><div class="acciones"><a class="boton" href="/clientes/${clienteId}">Ver cliente</a><a class="boton secundario" href="/clientes">Índice de clientes</a></div></section>`), 201);
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  console.log(`${req.method} ${url.pathname}`);
  try {
    if (req.method === 'GET' && url.pathname === '/') return servirArchivo(res, 'index.html', 'text/html; charset=UTF-8');
    if (req.method === 'GET' && url.pathname === '/acerca') return servirArchivo(res, 'acerca.html', 'text/html; charset=UTF-8');
    if (req.method === 'GET' && url.pathname === '/styles.css') return servirArchivo(res, 'styles.css', 'text/css; charset=UTF-8');
    if (req.method === 'GET' && url.pathname === '/clientes') return paginaClientes(res);
    if (req.method === 'GET' && url.pathname === '/clientes/nuevo') return paginaNuevoCliente(res);
    if (req.method === 'POST' && url.pathname === '/clientes') return await crearCliente(req, res);
    const nuevaSolicitud = url.pathname.match(/^\/clientes\/(\d+)\/solicitudes\/nueva$/);
    if (req.method === 'GET' && nuevaSolicitud) return paginaNuevaSolicitud(res, Number(nuevaSolicitud[1]));
    const detalleCliente = url.pathname.match(/^\/clientes\/(\d+)$/);
    if (req.method === 'GET' && detalleCliente) return paginaDetalleCliente(res, Number(detalleCliente[1]));
    if (req.method === 'POST' && url.pathname === '/solicitudes') return await crearSolicitud(req, res);
    if (req.method === 'GET' && url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    responderError(res, 404, 'Ruta no encontrada');
  } catch (error) {
    console.error(error);
    responderError(res, 500, 'Ocurrió un error interno');
  }
});

servidor.listen(PORT, () => console.log(`Servidor disponible en http://localhost:${PORT}`));
