// Presentación: vistas HTML de confirmación y error.
const { plantilla } = require('./plantilla');
function escapar(texto) {
    return String(texto).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function confirmacion() {
    return plantilla('Contacto registrado', `
      <section class="panel"><p class="etiqueta">Confirmación</p>
      <h1>Contacto registrado</h1>
      <p>La información fue almacenada correctamente.</p>
      <div class="acciones"><a class="boton" href="/contacto">Registrar otro contacto</a>
      <a class="boton secundario" href="/contactos">Consultar contactos</a></div></section>`);
}
function errorHtml(codigo, titulo, detalle) {
    return plantilla(titulo, `<section class="panel error">
      <p class="etiqueta">Error ${codigo}</p><h1>${escapar(titulo)}</h1>
      <p>${escapar(detalle)}</p><a class="boton secundario" href="/contacto">
      Volver al formulario</a></section>`);
}
module.exports = { confirmacion, errorHtml };
