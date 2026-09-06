# Laboratorio 04: aplicación de estilos CSS con Node.js

## Descripción

Este laboratorio continúa el sitio Web construido en las sesiones anteriores de la asignatura **Ingeniería Web**. Se aplicó una hoja de estilos externa al formulario de contacto y se configuró el servidor Node.js para entregar el archivo CSS mediante una petición HTTP independiente.

El formulario realiza una petición `POST` hacia la ruta `/contacto`. En esta etapa, el servidor únicamente reconoce la petición y devuelve el mensaje `Formulario recibido correctamente`; todavía no interpreta ni almacena los datos ingresados.

## Objetivos

- Vincular una hoja de estilos externa con un documento HTML.
- Aplicar estilos al formulario de contacto.
- Servir un archivo CSS desde Node.js.
- Comprobar que el navegador solicita el HTML y el CSS mediante peticiones independientes.
- Mantener funcionando el envío del formulario mediante `POST /contacto`.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Protocolo HTTP

## Estructura del proyecto

```text
laboratorio-04/
├── index_rutas.html
├── acerca.html
├── servicios.html
├── contacto.html
├── styles.css
├── server.js
└── README.md
```

## Archivos principales

| Archivo | Descripción |
|---|---|
| `index_rutas.html` | Página principal del sitio. |
| `acerca.html` | Página con información acerca del curso. |
| `servicios.html` | Página con información de los servicios. |
| `contacto.html` | Página con el formulario de contacto. |
| `styles.css` | Hoja de estilos aplicada al formulario. |
| `server.js` | Servidor HTTP y definición de rutas. |

## Rutas disponibles

| Método | Ruta | Resultado |
|---|---|---|
| `GET` | `/` | Entrega `index_rutas.html`. |
| `GET` | `/acerca` | Entrega `acerca.html`. |
| `GET` | `/servicios` | Entrega `servicios.html`. |
| `GET` | `/contacto` | Entrega `contacto.html`. |
| `GET` | `/styles.css` | Entrega la hoja de estilos con el tipo `text/css`. |
| `POST` | `/contacto` | Confirma la recepción del formulario. |

Las rutas inexistentes generan una respuesta con código `404`.

## Vinculación de la hoja de estilos

El archivo `contacto.html` vincula la hoja de estilos dentro de `<head>`:

```html
<link rel="stylesheet" href="/styles.css">
```

Cuando el navegador recibe el documento, encuentra la etiqueta `link` y realiza automáticamente otra petición:

```text
GET /styles.css
```

El servidor responde leyendo `styles.css` y declarando el tipo de contenido correcto:

```javascript
else if (req.method === 'GET' && req.url === '/styles.css') {
    const css = fs.readFileSync('styles.css');

    res.writeHead(200, {
        'Content-Type': 'text/css; charset=UTF-8'
    });

    res.end(css);
}
```

## Formulario de contacto

El formulario conserva el método y la ruta definidos en el laboratorio anterior:

```html
<form action="/contacto" method="POST">
```

Cuando se presiona el botón **Enviar**, el servidor atiende la petición:

```javascript
else if (req.method === 'POST' && req.url === '/contacto') {
    console.log('Formulario recibido');
    res.statusCode = 200;
    res.end('Formulario recibido correctamente');
}
```

El navegador debe mostrar:

```text
Formulario recibido correctamente
```

## Requisitos de ejecución

- Tener Node.js instalado.
- Mantener todos los archivos en la misma carpeta.
- Tener disponible el puerto `3000`.

No es necesario instalar paquetes externos.

## Ejecución local

1. Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

2. Entrar en la carpeta del proyecto:

```bash
cd laboratorio-04
```

3. Iniciar el servidor:

```bash
node server.js
```

4. Abrir en el navegador:

```text
http://localhost:3000/contacto
```

5. Para detener el servidor, utilizar `Ctrl + C` en la terminal.

## Comprobación del funcionamiento

Al abrir el formulario y enviarlo, la terminal debe mostrar una salida similar a la siguiente:

```text
Método: GET
URL: /contacto
Método: GET
URL: /styles.css
Método: POST
URL: /contacto
Formulario recibido
```

Esto demuestra que:

1. El navegador solicitó `contacto.html`.
2. El navegador realizó otra petición para obtener `styles.css`.
3. El formulario generó una petición `POST /contacto`.
4. El servidor reconoció el envío y respondió al navegador.

## Alcance actual

El laboratorio llega únicamente hasta la presentación visual del formulario y la confirmación de su envío.

En esta versión todavía no se realiza:

- Lectura del cuerpo de la petición `POST`.
- Visualización de los valores enviados.
- Validación de los datos en el servidor.
- Almacenamiento en archivos o bases de datos.
- Uso de SQL o SQLite.
- Implementación de operaciones CRUD.

## Autor

**Luis Miguel Gómez Meneses**

Asignatura: Ingeniería Web  
Programa: Ingeniería de Software  
Universidad Cooperativa de Colombia

