
# Laboratorio 02 — HTML Semántico y Rutas Web

## Ingeniería Web

Este laboratorio continúa el trabajo realizado en la sesión anterior, donde se construyó un servidor HTTP básico utilizando Node.js y se implementaron diferentes rutas.

En esta actividad se evolucionará ese servidor para construir un pequeño sitio Web multipágina, donde cada ruta entregará un documento HTML diferente y cada página utilizará elementos semánticos de HTML5.

---

## Objetivos

Al finalizar el laboratorio, el estudiante estará en capacidad de:

- Aplicar elementos semánticos de HTML5 para estructurar una página Web.
- Utilizar elementos como `<header>`, `<nav>`, `<main>`, `<section>` y `<footer>`.
- Comprender la relación entre una ruta Web y el documento HTML entregado por el servidor.
- Implementar navegación entre diferentes páginas mediante enlaces HTML.
- Utilizar Node.js para entregar diferentes documentos HTML según la ruta solicitada.
- Identificar una respuesta HTTP `404` cuando se solicita una ruta inexistente.

---

## Estructura del laboratorio

El laboratorio utiliza los siguientes archivos:

```text
lab02/
│
├── index_rutas.html
├── acerca.html
├── servicios.html
├── contacto.html
└── server_rutas.js
```

Cada documento HTML representa una página diferente del sitio Web.

---

## Rutas del sitio

El servidor manejará las siguientes rutas:

| Ruta | Archivo entregado | Descripción |
|---|---|---|
| `/` | `index_rutas.html` | Página principal |
| `/acerca` | `acerca.html` | Información acerca del curso |
| `/servicios` | `servicios.html` | Descripción de la asignatura |
| `/contacto` | `contacto.html` | Información de contacto |
| Cualquier otra | — | Respuesta `404 - Página no encontrada` |

---

## 1. Página principal

El archivo `index_rutas.html` representa la página principal del sitio.

La estructura utiliza elementos semánticos como:

```html
<header>
<nav>
<main>
<section>
<footer>
```

El elemento `<nav>` contiene los enlaces que permiten navegar entre las diferentes rutas:

```html
<nav>
    <a href="/">Inicio</a>
    <a href="/acerca">Acerca</a>
    <a href="/servicios">Servicios</a>
    <a href="/contacto">Contacto</a>
</nav>
```

Cuando el usuario selecciona uno de estos enlaces, el navegador realiza una nueva petición HTTP al servidor.

Por ejemplo:

```text
Servicios
    ↓
href="/servicios"
    ↓
GET /servicios
    ↓
Node.js
    ↓
servicios.html
```

---

## 2. Estructura semántica

Todas las páginas del laboratorio utilizan una estructura semántica básica.

```html
<body>

    <header>
        ...
    </header>

    <nav>
        ...
    </nav>

    <main>

        <section>
            ...
        </section>

    </main>

    <footer>
        ...
    </footer>

</body>
```

Cada elemento describe la función que cumple el contenido dentro del documento:

- `<header>`: encabezado de la página.
- `<nav>`: bloque de navegación.
- `<main>`: contenido principal.
- `<section>`: agrupación temática de contenido.
- `<footer>`: información ubicada al final de la página.

No es necesario utilizar todos los elementos semánticos disponibles en HTML. Se deben utilizar únicamente aquellos que describan adecuadamente la función del contenido.

---

## 3. Página Acerca

La ruta:

```text
/acerca
```

entrega el archivo:

```text
acerca.html
```

Esta página contiene información general acerca del curso de Ingeniería Web.

---

## 4. Página Servicios

La ruta:

```text
/servicios
```

entrega el archivo:

```text
servicios.html
```

Esta página presenta una descripción breve de la asignatura de Ingeniería Web.

---

## 5. Página Contacto

La ruta:

```text
/contacto
```

entrega el archivo:

```text
contacto.html
```

La página presenta la información de contacto definida para el ejercicio.

---

## 6. Servidor Web con Node.js

El archivo `server_rutas.js` contiene el servidor HTTP.

El servidor recibe las peticiones realizadas por el navegador y utiliza `req.url` para identificar la ruta solicitada.

Ejemplo:

```javascript
if (req.url === '/') {

    const html = fs.readFileSync('index_rutas.html');
    res.end(html);

} else if (req.url === '/acerca') {

    const html = fs.readFileSync('acerca.html');
    res.end(html);

} else if (req.url === '/servicios') {

    const html = fs.readFileSync('servicios.html');
    res.end(html);

} else if (req.url === '/contacto') {

    const html = fs.readFileSync('contacto.html');
    res.end(html);

} else {

    res.statusCode = 404;
    res.end('404 - Pagina no encontrada');

}
```

La relación entre una ruta y un archivo HTML es definida por el servidor.

Por ejemplo:

```javascript
req.url === '/servicios'
```

hace que el servidor entregue:

```text
servicios.html
```

El archivo HTML por sí mismo no determina la ruta en la que será mostrado.

---

## 7. Ejecutar el servidor

Desde una terminal, ubicarse en la carpeta del laboratorio y ejecutar:

```bash
node server_rutas.js
```

Si el servidor inicia correctamente se mostrará:

```text
Servidor disponible en http://localhost:3000
```

Abrir el navegador e ingresar a:

```text
http://localhost:3000
```

> Los archivos HTML de este laboratorio deben probarse a través del servidor Node.js y no abriéndolos directamente desde el sistema de archivos.

---

## 8. Probar las rutas

Comprobar las siguientes direcciones desde el navegador:

```text
http://localhost:3000/
http://localhost:3000/acerca
http://localhost:3000/servicios
http://localhost:3000/contacto
```

También se debe probar una ruta que no exista, por ejemplo:

```text
http://localhost:3000/pepito
```

El servidor deberá responder:

```text
404 - Pagina no encontrada
```

con código de estado HTTP:

```text
404
```

---

## 9. Flujo completo

El funcionamiento general del laboratorio puede representarse de la siguiente manera:

```text
Usuario
   ↓
Navegador
   ↓
GET /servicios
   ↓
Servidor Node.js
   ↓
req.url === '/servicios'
   ↓
fs.readFileSync('servicios.html')
   ↓
Respuesta HTTP
   ↓
Navegador muestra servicios.html
```

El mismo principio se aplica a las demás rutas.

---

## Conceptos trabajados

Al finalizar el laboratorio se habrán integrado los siguientes conceptos:

```text
HTML semántico
      ↓
Navegación mediante <a>
      ↓
Rutas Web
      ↓
Petición HTTP GET
      ↓
Servidor Node.js
      ↓
Respuesta con documento HTML
