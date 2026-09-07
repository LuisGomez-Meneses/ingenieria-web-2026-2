# Laboratorio 05: del formulario a la base de datos

## Descripción

Este laboratorio continúa el proyecto desarrollado en el Laboratorio 04 de la asignatura **Ingeniería Web**. El formulario de contacto ya no solo genera una petición `POST`: ahora el servidor lee el cuerpo de la petición, interpreta los campos, valida los datos y almacena un registro en una base de datos SQLite.

El flujo implementado es:

```text
Formulario HTML
    → POST /contacto
    → Node.js recibe el cuerpo
    → URLSearchParams interpreta los campos
    → validación del servidor
    → INSERT parametrizado
    → SQLite
    → contactos.db
```

## Objetivos

- Leer el cuerpo de una petición `POST` con los eventos `data` y `end`.
- Interpretar datos codificados como `application/x-www-form-urlencoded`.
- Obtener los campos `nombre`, `correo` y `mensaje` mediante `URLSearchParams`.
- Validar los campos recibidos en el servidor.
- Crear una base de datos y una tabla con SQLite.
- Ejecutar una sentencia SQL `INSERT` parametrizada.
- Confirmar la creación del registro mediante el código HTTP `201`.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js 24
- Módulo incorporado `node:sqlite`
- SQLite
- SQL
- Protocolo HTTP

## Estructura del proyecto

```text
Lab05/
├── index_rutas.html
├── acerca.html
├── servicios.html
├── contacto.html
├── styles.css
├── server.js
├── contactos.db
└── README.md
```

El archivo `contactos.db` es creado automáticamente por SQLite al iniciar el servidor por primera vez.

## Archivos principales

| Archivo | Descripción |
|---|---|
| `contacto.html` | Contiene el formulario que envía nombre, correo y mensaje. |
| `styles.css` | Define la presentación visual del formulario. |
| `server.js` | Implementa las rutas, procesa el formulario y administra SQLite. |
| `contactos.db` | Conserva la tabla y los registros almacenados. |

## Rutas disponibles

| Método | Ruta | Resultado |
|---|---|---|
| `GET` | `/` | Entrega `index_rutas.html`. |
| `GET` | `/acerca` | Entrega `acerca.html`. |
| `GET` | `/servicios` | Entrega `servicios.html`. |
| `GET` | `/contacto` | Entrega el formulario de contacto. |
| `GET` | `/styles.css` | Entrega la hoja de estilos. |
| `POST` | `/contacto` | Valida y almacena un nuevo contacto. |

Las rutas inexistentes producen una respuesta `404`.

## Formulario HTML

El formulario envía los datos mediante `POST`:

```html
<form action="/contacto" method="POST">
```

Los atributos `name` determinan las claves que recibe el servidor:

```html
<input type="text" id="nombre" name="nombre" required>
<input type="email" id="correo" name="correo" required>
<textarea id="mensaje" name="mensaje" required></textarea>
```

## Lectura del cuerpo de la petición

Node.js recibe el cuerpo como un flujo. Los fragmentos se acumulan con `data` y se procesan cuando ocurre `end`:

```javascript
let cuerpo = '';

req.on('data', fragmento => {
    cuerpo += fragmento.toString();
});

req.on('end', () => {
    const datos = new URLSearchParams(cuerpo);

    const nombre = datos.get('nombre')?.trim();
    const correo = datos.get('correo')?.trim();
    const mensaje = datos.get('mensaje')?.trim();
});
```

## Base de datos SQLite

El módulo `node:sqlite` viene incorporado en Node.js 24 y no requiere instalar paquetes externos:

```javascript
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('contactos.db');
```

Algunas versiones pueden mostrar una advertencia indicando que SQLite es una característica experimental. Esta advertencia no impide la ejecución del laboratorio.

## Tabla `contactos`

La tabla se crea al iniciar el servidor:

```sql
CREATE TABLE IF NOT EXISTS contactos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL,
    mensaje TEXT NOT NULL
);
```

| Columna | Tipo | Propósito |
|---|---|---|
| `id` | `INTEGER` | Identificador generado automáticamente. |
| `nombre` | `TEXT` | Nombre escrito por el usuario. |
| `correo` | `TEXT` | Correo electrónico recibido. |
| `mensaje` | `TEXT` | Mensaje enviado desde el formulario. |

## Inserción del registro

La sentencia se prepara con parámetros para evitar concatenar los datos del usuario dentro del SQL:

```javascript
const insertarContacto = db.prepare(`
    INSERT INTO contactos (nombre, correo, mensaje)
    VALUES (?, ?, ?)
`);
```

Después de validar los datos, se ejecuta:

```javascript
const resultado = insertarContacto.run(
    nombre,
    correo,
    mensaje
);

console.log(
    'Contacto almacenado con id:',
    resultado.lastInsertRowid
);
```

Los valores reemplazan los signos `?` en el mismo orden en que fueron declarados.

## Respuestas HTTP

| Código | Significado en el proyecto |
|---|---|
| `201 Created` | El contacto fue almacenado correctamente. |
| `400 Bad Request` | Falta uno o más campos obligatorios. |
| `404 Not Found` | La ruta solicitada no existe. |
| `500 Internal Server Error` | Ocurrió un error al almacenar el contacto. |

## Requisitos de ejecución

- Node.js 24 instalado.
- Puerto `3000` disponible.
- Todos los archivos ubicados en la misma carpeta.

No es necesario ejecutar `npm install`.

## Ejecución

1. Abrir una terminal en la carpeta del laboratorio.

2. Comprobar la versión de Node.js:

```bash
node --version
```

3. Iniciar el servidor:

```bash
node server.js
```

4. Abrir el formulario:

```text
http://localhost:3000/contacto
```

5. Completar los tres campos y presionar **Enviar**.

6. Detener el servidor cuando sea necesario mediante `Ctrl + C`.

## Resultado esperado

Después de enviar el formulario, el navegador debe mostrar:

```text
Contacto registrado
La información fue almacenada correctamente.
```

La terminal debe presentar una salida similar a:

```text
Método: POST
URL: /contacto
Nombre: Luis
Correo: usuario@correo.com
Mensaje: Hola, este es un mensaje de prueba.
Contacto almacenado con id: 1
```

El archivo `contactos.db` debe aparecer en la carpeta del proyecto.

## Pruebas realizadas

### Envío correcto

- Completar todos los campos.
- Confirmar la respuesta `201`.
- Confirmar la aparición de `lastInsertRowid` en la terminal.

### Segundo envío

- Enviar otro contacto.
- Comprobar que SQLite genera un identificador diferente.

### Correo y caracteres especiales

- Enviar un correo que contenga `@`.
- Utilizar espacios y tildes en el mensaje.
- Comprobar que `URLSearchParams` interpreta los valores correctamente.

### Campo vacío

El atributo `required` normalmente impide el envío desde el navegador. Para probar la validación del servidor puede retirarse temporalmente desde las herramientas de desarrollo. El servidor debe responder `400` y no ejecutar el `INSERT`.

## Alcance actual

El laboratorio implementa la creación e inserción de registros. Todavía no incluye:

- Consulta de contactos mediante `SELECT`.
- Visualización de registros en el navegador.
- Actualización mediante `UPDATE`.
- Eliminación mediante `DELETE`.
- CRUD completo.

Estas operaciones se desarrollarán en la siguiente sesión.

## Autor

**Nombre:** Luis Miguel Gómez Meneses  
**Asignatura:** Ingeniería Web  
**Programa:** Ingeniería de Software  
**Institución:** Universidad Cooperativa de Colombia

