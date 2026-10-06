function escapar(valor = '') {
    return String(valor)
        .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function plantilla(titulo, contenido) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapar(titulo)} | Soporte Web</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header>
        <a class="marca" href="/">Soporte Web</a>
        <nav aria-label="Navegación principal">      <a href="/">Inicio</a>      <a href="/acerca">Acerca de</a>      <a href="/servicios">Servicios</a>      <a href="/contacto">Contacto</a>      <a href="/contactos">Consultar contactos</a></nav>
    </header>
    <main>${contenido}</main>
    <footer>Ingeniería Web · Demostración académica</footer>
</body>
</html>`;
}


module.exports = { plantilla };
