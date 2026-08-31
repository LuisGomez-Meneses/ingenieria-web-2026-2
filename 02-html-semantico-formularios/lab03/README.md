# Laboratorio 03 — Formulario Web y método POST

## Ingeniería Web

Este laboratorio continúa el sitio Web desarrollado en el laboratorio anterior.

En esta actividad se incorpora un **formulario de contacto** utilizando HTML y se modifica el servidor Node.js para diferenciar peticiones HTTP `GET` y `POST` sobre una misma ruta.

---

## Objetivos

Al finalizar el laboratorio, el estudiante estará en capacidad de:

- Construir un formulario utilizando HTML.
- Utilizar los elementos `<form>`, `<label>`, `<input>`, `<textarea>` y `<button>`.
- Comprender la función de los atributos `action` y `method`.
- Enviar un formulario mediante el método HTTP `POST`.
- Diferenciar peticiones `GET` y `POST`.
- Utilizar `req.method` y `req.url` en Node.js.
- Comprender que una misma ruta puede responder de manera diferente dependiendo del método HTTP utilizado.

---

## Estructura del laboratorio

```text
lab03/
│
├── README.md
├── index_rutas.html
├── acerca.html
├── servicios.html
├── contacto.html
└── server.js
```

Los archivos `index_rutas.html`, `acerca.html` y `servicios.html` conservan la estructura desarrollada anteriormente.

En este laboratorio los principales cambios se realizan sobre:

```text
contacto.html
server.js
```

---

# 1. Formulario de contacto

El archivo `contacto.html` incorpora un formulario dentro de una estructura HTML semántica.

```html
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Contacto</title>
</head>

<body>

    <header>
        <h1>Contacto</h1>
    </header>

    <nav>
        <a href="/">Inicio</a>
        <a href="/acerca">Acerca</a>
        <a href="/servicios">Servicios</a>
        <a href="/contacto">Contacto</a>
    </nav>

    <main>

        <section>

            <h2>Formulario de contacto</h2>

            <form action="/contacto" method="POST">

                <label for="nombre">Nombre:</label>

                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                >

                <br><br>

                <label for="correo">Correo:</label>

                <input
                    type="email"
                    id="correo"
                    name="correo"
                    required
                >

                <br><br>

                <label for="mensaje">Mensaje:</label>

                <textarea
                    id="mensaje"
                    name="mensaje"
                    required>
                </textarea>

                <br><br>

                <button type="submit">
                    Enviar
                </button>

            </form>

        </section>

    </main>

    <footer>
        <p>Universidad Cooperativa de Colombia</p>
    </footer>

</body>

</html>
```

---

# 2. Elementos del formulario

El formulario utiliza los siguientes elementos HTML:

| Elemento | Función |
|---|---|
| `<form>` | Agrupa los controles del formulario |
| `<label>` | Describe el dato que debe introducir el usuario |
| `<input>` | Permite introducir datos de una línea |
| `<textarea>` | Permite introducir texto de varias líneas |
| `<button>` | Permite enviar el formulario |

---

# 3. `for`, `id` y `name`

En el siguiente ejemplo:

```html
<label for="nombre">Nombre:</label>

<input
    type="text"
    id="nombre"
    name="nombre"
>
```

`for` e `id` establecen una relación entre la etiqueta y el control:

```text
for="nombre"  ↔  id="nombre"
```

El atributo:

```html
name="nombre"
```

define el nombre asociado al dato cuando el formulario es enviado.

---

# 4. Action y Method

El formulario se define mediante:

```html
<form action="/contacto" method="POST">
```

## `action`

```html
action="/contacto"
```

indica la ruta a la que el navegador enviará los datos.

En este laboratorio:

```text
/contacto
```

es la ruta de destino.

## `method`

```html
method="POST"
```

indica el método HTTP utilizado para realizar la petición.

Por lo tanto, al presionar el botón **Enviar**, el navegador genera una petición:

```text
POST /contacto
```

---

# 5. Servidor Node.js

El archivo `server.js` contiene el servidor HTTP utilizado en el laboratorio.

```javascript
const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {

    console.log('Método:', req.method);
    console.log('URL:', req.url);

    if (req.method === 'GET' && req.url === '/') {

        const html = fs.readFileSync('index_rutas.html');
        res.end(html);

    }

    else if (req.method === 'GET' && req.url === '/acerca') {

        const html = fs.readFileSync('acerca.html');
        res.end(html);

    }

    else if (req.method === 'GET' && req.url === '/servicios') {

        const html = fs.readFileSync('servicios.html');
        res.end(html);

    }

    else if (req.method === 'GET' && req.url === '/contacto') {

        const html = fs.readFileSync('contacto.html');
        res.end(html);

    }

    else if (req.method === 'POST' && req.url === '/contacto') {

        console.log('Formulario recibido');

        res.statusCode = 200;
        res.end('Formulario recibido correctamente');

    }

    else {

        res.statusCode = 404;
        res.end('404 - Pagina no encontrada');

    }

});

server.listen(3000, () => {

    console.log('Servidor disponible en http://localhost:3000');

});
```

---

# 6. GET `/contacto`

Cuando el usuario ingresa en:

```text
http://localhost:3000/contacto
```

el navegador genera:

```text
GET /contacto
```

El servidor identifica:

```javascript
req.method === 'GET'
req.url === '/contacto'
```

y entrega:

```text
contacto.html
```

El flujo es:

```text
Navegador
    │
    │ GET /contacto
    ▼
Node.js
    │
    │ lee contacto.html
    ▼
Navegador muestra el formulario
```

---

# 7. POST `/contacto`

Cuando el usuario completa el formulario y presiona **Enviar**, el navegador genera:

```text
POST /contacto
```

El servidor identifica:

```javascript
req.method === 'POST'
req.url === '/contacto'
```

y ejecuta:

```javascript
console.log('Formulario recibido');

res.statusCode = 200;
res.end('Formulario recibido correctamente');
```

Por lo tanto, el navegador recibe:

```text
Formulario recibido correctamente
```

---

# 8. Misma ruta, diferente método

Uno de los conceptos principales del laboratorio es que una misma ruta puede utilizarse con diferentes métodos HTTP.

```text
GET /contacto
      │
      ▼
Mostrar contacto.html
```

mientras que:

```text
POST /contacto
      │
      ▼
Recibir el envío del formulario
```

Node.js puede distinguir ambas peticiones utilizando:

```javascript
req.method
```

y:

```javascript
req.url
```

En nuestro ejemplo:

```text
GET  + /contacto → entregar contacto.html

POST + /contacto → responder "Formulario recibido correctamente"
```

---

# 9. Ejecutar el laboratorio

Abrir una terminal dentro de la carpeta `lab03` y ejecutar:

```bash
node server.js
```

El servidor deberá mostrar:

```text
Servidor disponible en http://localhost:3000
```

Luego ingresar desde el navegador a:

```text
http://localhost:3000/contacto
```

---

# 10. Probar el formulario

Completar los campos:

```text
Nombre
Correo
Mensaje
```

y presionar:

```text
Enviar
```

Antes de enviar el formulario, la terminal mostrará una petición similar a:

```text
Método: GET
URL: /contacto
```

Después de presionar **Enviar**, deberá aparecer:

```text
Método: POST
URL: /contacto
Formulario recibido
```

Esto permite comprobar que el formulario produjo una petición HTTP `POST`.

---

# 11. Flujo completo

```text
Usuario
   │
   │ introduce nombre, correo y mensaje
   ▼
Formulario HTML
   │
   │ clic en "Enviar"
   ▼
Navegador
   │
   │ POST /contacto
   ▼
Servidor Node.js
   │
   │ req.method = POST
   │ req.url = /contacto
   ▼
Respuesta HTTP
   │
   ▼
Formulario recibido correctamente
```

---

# Resultado del laboratorio

Al finalizar el laboratorio se habrá construido un formulario HTML capaz de generar una petición HTTP `POST` hacia el servidor Node.js.

Se integraron los siguientes conceptos:

```text
Formulario HTML
      ↓
action + method
      ↓
POST /contacto
      ↓
req.method + req.url
      ↓
Node.js
      ↓
Respuesta HTTP
```

> En este laboratorio se comprueba la recepción de la petición `POST`. El contenido de los campos enviados todavía no se procesa ni se almacena en el servidor.
