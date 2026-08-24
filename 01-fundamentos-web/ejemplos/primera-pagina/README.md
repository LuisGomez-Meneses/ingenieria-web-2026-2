# Fundamentos de Ingeniería Web — Primera aplicación Web

Ejemplos desarrollados durante la primera sesión de **Ingeniería Web 2026-2**.

El propósito de esta práctica es comprender progresivamente cómo un documento HTML puede visualizarse directamente en el navegador y posteriormente ser servido mediante HTTP utilizando **Node.js**.

Durante los ejemplos se trabajan los conceptos de:

* HTML.
* Cliente y servidor.
* HTTP.
* Node.js.
* `localhost`.
* Puertos.
* Request y Response.
* Lectura de archivos con `fs`.
* Rutas.
* Códigos de estado HTTP.

---

## 1. Estructura del proyecto

```text
primera-pagina/
│
├── README.md
├── index.html
├── index_rutas.html
├── server_1.js
├── server.js
└── server_ruta.js
```

Cada archivo corresponde a una etapa diferente de la práctica.

---

## 2. Primera página HTML

El archivo `index.html` contiene una estructura básica de HTML:

```html
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Mi primera página Web</title>
</head>

<body>
    <h1>Ingeniería Web</h1>
    <p>Esta es mi primera página Web.</p>
</body>

</html>
```

### Elementos utilizados

* `<!DOCTYPE html>`: declara que el documento utiliza HTML5.
* `<html>`: elemento raíz del documento.
* `lang="es"`: establece el idioma principal del contenido.
* `<head>`: contiene metadatos y configuración del documento.
* `<meta charset="UTF-8">`: establece la codificación de caracteres.
* `<title>`: define el texto mostrado en la pestaña del navegador.
* `<body>`: contiene el contenido visible.
* `<h1>`: encabezado principal.
* `<p>`: párrafo.

### Estructura general

```text
HTML
├── HEAD
│   ├── Metadatos
│   └── Título
│
└── BODY
    └── Contenido visible
```

---

## 3. Visualización como archivo local

El archivo `index.html` puede abrirse directamente desde un navegador Web.

Por ejemplo:

```text
file:///C:/web/index.html
```

En este caso:

```text
index.html ──────────► Navegador
```

El navegador lee el archivo directamente desde el sistema de archivos del computador.

**No existe todavía una petición HTTP ni un servidor Web involucrado.**

---

## 4. Primer servidor HTTP con Node.js

Para pasar del archivo local a una arquitectura cliente-servidor utilizamos **Node.js**.

Node.js permite ejecutar JavaScript fuera del navegador y utilizarlo, entre otras cosas, para construir aplicaciones del lado servidor.

El módulo `http` está incluido en Node.js:

```javascript
const http = require('http');
```

A partir de este módulo podemos crear un servidor:

```javascript
const server = http.createServer((req, res) => {

    console.log('Método:', req.method);
    console.log('URL:', req.url);

    res.end('Hola desde mi servidor Node.js');

});
```

El objeto `req` representa la petición (**Request**) recibida por el servidor.

El objeto `res` permite construir la respuesta (**Response**) que será enviada al cliente.

Por ejemplo:

```javascript
req.method
```

permite consultar el método HTTP solicitado, mientras que:

```javascript
req.url
```

permite consultar la ruta solicitada.

---

## 5. Puerto y localhost

El servidor queda escuchando mediante:

```javascript
server.listen(3000, () => {
    console.log('http://localhost:3000');
});
```

La dirección:

```text
http://localhost:3000
```

puede interpretarse como:

```text
http://   localhost   :3000
   │          │          │
protocolo    host      puerto
```

* `http`: protocolo utilizado para la comunicación.
* `localhost`: representa la propia máquina.
* `3000`: puerto en el que está escuchando nuestra aplicación.

`localhost` normalmente resuelve a la dirección de loopback:

```text
127.0.0.1
```

---

## 6. Ejecutar el servidor

Desde una terminal ubicada en la carpeta del proyecto:

```bash
node server_1.js
```

Si el servidor inicia correctamente aparecerá:

```text
http://localhost:3000
```

Luego se puede abrir en el navegador:

```text
http://localhost:3000
```

Cuando el navegador realiza una petición, en la terminal se puede observar información similar a:

```text
Método: GET
URL: /
```

El navegador también puede realizar automáticamente otras peticiones, por ejemplo:

```text
Método: GET
URL: /favicon.ico
```

Estas salidas permiten observar las peticiones que están llegando al servidor.

Para detener el servidor:

```text
Ctrl + C
```

---

## 7. Request y Response

La comunicación básica puede representarse de la siguiente manera:

```text
CLIENTE                                  SERVIDOR
Navegador                                Node.js

    │                                        │
    │──── HTTP Request: GET / ──────────────►│
    │                                        │
    │                                  procesa petición
    │                                        │
    │◄────── HTTP Response ──────────────────│
    │                                        │
```

En Node.js:

```javascript
http.createServer((req, res) => {
    // req → petición recibida
    // res → respuesta que será enviada
});
```

Los nombres `req` y `res` son utilizados por convención:

* `req` → Request.
* `res` → Response.

---

## 8. Servir un archivo HTML mediante HTTP

El módulo `fs` (**File System**) permite leer archivos del computador desde Node.js.

```javascript
const fs = require('fs');
```

Podemos leer `index.html`:

```javascript
const html = fs.readFileSync('index.html');
```

y posteriormente enviarlo como respuesta:

```javascript
res.end(html);
```

El flujo cambia entonces a:

```text
Navegador
    │
    │ GET /
    ▼
Servidor Node.js
    │
    │ lee index.html
    ▼
index.html
    │
    │ HTTP Response
    ▼
Navegador
```

A diferencia del primer ejemplo, ahora el navegador no abre directamente el archivo desde el disco.

El contenido es solicitado y entregado mediante HTTP.

---

## 9. Introducción a las rutas

Una aplicación Web puede responder de manera diferente dependiendo de la ruta solicitada.

El archivo `server_ruta.js` utiliza:

```javascript
req.url
```

para identificar la ruta solicitada.

Por ejemplo:

```javascript
if (req.url === '/') {

    const html = fs.readFileSync('index_rutas.html');
    res.end(html);

}
else if (req.url === '/acerca') {

    res.end('Acerca del curso de Ingeniería Web');

}
else {

    res.statusCode = 404;
    res.end('404 - Pagina no encontrada');

}
```

De esta manera el servidor puede decidir qué respuesta entregar.

| Ruta                | Respuesta             | Código esperado |
| ------------------- | --------------------- | --------------: |
| `/`                 | Página principal      |             200 |
| `/acerca`           | Información del curso |             200 |
| Cualquier otra ruta | Página no encontrada  |             404 |

---

## 10. Navegación desde HTML

El archivo `index_rutas.html` incorpora un enlace:

```html
<a href="/acerca">Acerca del curso</a>
```

Cuando el usuario hace clic en el enlace ocurre el siguiente flujo:

```text
Usuario hace clic
       │
       ▼
<a href="/acerca">
       │
       ▼
Navegador genera GET /acerca
       │
       ▼
Node.js recibe la petición
       │
       ▼
req.url === '/acerca'
       │
       ▼
Servidor genera la respuesta
       │
       ▼
Navegador muestra el contenido
```

Esto permite integrar el frontend HTML con las rutas definidas en el servidor.

---

## 11. Código HTTP 404

Si el usuario solicita una ruta que el servidor no tiene definida:

```text
http://localhost:3000/pepito
```

el servidor ejecuta:

```javascript
res.statusCode = 404;
res.end('404 - Pagina no encontrada');
```

El código **404 Not Found** indica que el servidor recibió la petición, pero no encontró un recurso asociado con la ruta solicitada.

---

## 12. Conceptos principales

Al finalizar estos ejemplos se pueden identificar los siguientes elementos:

```text
Usuario
   │
   ▼
Navegador
   │
   │ HTTP Request
   ▼
Servidor Node.js
   │
   ├── req.method
   ├── req.url
   ├── routing
   └── fs
   │
   │ HTTP Response
   ▼
Navegador
```

### Frontend

Corresponde a la parte que se ejecuta y presenta en el navegador.

En estos ejemplos:

```text
index.html
index_rutas.html
```

### Backend

Corresponde al código ejecutado del lado servidor.

En estos ejemplos, los archivos JavaScript ejecutados mediante Node.js cumplen esta función:

```text
server_1.js
server.js
server_ruta.js
```

### HTTP

Es el protocolo utilizado para intercambiar peticiones y respuestas entre cliente y servidor.

---

## 13. Requisitos

Para ejecutar los ejemplos que utilizan servidor se requiere:

* Node.js instalado.
* Navegador Web.
* Editor de código como Visual Studio Code o Cursor.

No se requieren librerías externas ni ejecutar:

```bash
npm install
```

Los ejemplos utilizan únicamente módulos incorporados en Node.js:

```javascript
require('http');
require('fs');
```

---

## 14. Ejecución de los ejemplos

Ejecutar un servidor:

```bash
node server_1.js
```

o:

```bash
node server.js
```

Para trabajar con rutas:

```bash
node server_ruta.js
```

Posteriormente abrir:

```text
http://localhost:3000
```

Para finalizar el servidor:

```text
Ctrl + C
```

---

## Ingeniería Web 2026-2

Material práctico de la asignatura **Ingeniería Web**.

**Sesión 01 — Fundamentos de Ingeniería Web**

