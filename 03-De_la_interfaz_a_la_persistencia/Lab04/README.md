Laboratorio 04: aplicación de estilos CSS con Node.js

Descripción

Este laboratorio continúa el sitio Web construido en las sesiones anteriores de la asignatura Ingeniería Web. Se aplicó una hoja de estilos externa al formulario de contacto y se configuró el servidor Node.js para entregar el archivo CSS mediante una petición HTTP independiente.

El formulario realiza una petición POST hacia la ruta /contacto. En esta etapa, el servidor únicamente reconoce la petición y devuelve el mensaje Formulario recibido correctamente; todavía no interpreta ni almacena los datos ingresados.

Objetivos

Vincular una hoja de estilos externa con un documento HTML.

Aplicar estilos al formulario de contacto.

Servir un archivo CSS desde Node.js.

Comprobar que el navegador solicita el HTML y el CSS mediante peticiones independientes.

Mantener funcionando el envío del formulario mediante POST /contacto.

Tecnologías utilizadas

HTML5

CSS3

JavaScript

Node.js

Protocolo HTTP

Estructura del proyecto

laboratorio-04/
├── index_rutas.html
├── acerca.html
├── servicios.html
├── contacto.html
├── styles.css
├── server.js
└── README.md

Archivos principales

Archivo

Descripción

index_rutas.html

Página principal del sitio.

acerca.html

Página con información acerca del curso.

servicios.html

Página con información de los servicios.

contacto.html

Página con el formulario de contacto.

styles.css

Hoja de estilos aplicada al formulario.

server.js

Servidor HTTP y definición de rutas.

Rutas disponibles

Método

Ruta

Resultado

GET

/

Entrega index_rutas.html.

GET

/acerca

Entrega acerca.html.

GET

/servicios

Entrega servicios.html.

GET

/contacto

Entrega contacto.html.

GET

/styles.css

Entrega la hoja de estilos con el tipo text/css.

POST

/contacto

Confirma la recepción del formulario.

Las rutas inexistentes generan una respuesta con código 404.

Vinculación de la hoja de estilos

El archivo contacto.html vincula la hoja de estilos dentro de <head>:

<link rel="stylesheet" href="/styles.css">

Cuando el navegador recibe el documento, encuentra la etiqueta link y realiza automáticamente otra petición:

GET /styles.css

El servidor responde leyendo styles.css y declarando el tipo de contenido correcto:

else if (req.method === 'GET' && req.url === '/styles.css') {
    const css = fs.readFileSync('styles.css');

    res.writeHead(200, {
        'Content-Type': 'text/css; charset=UTF-8'
    });

    res.end(css);
}

Formulario de contacto

El formulario conserva el método y la ruta definidos en el laboratorio anterior:

<form action="/contacto" method="POST">

Cuando se presiona el botón Enviar, el servidor atiende la petición:

else if (req.method === 'POST' && req.url === '/contacto') {
    console.log('Formulario recibido');
    res.statusCode = 200;
    res.end('Formulario recibido correctamente');
}

El navegador debe mostrar:

Formulario recibido correctamente

Requisitos de ejecución

Tener Node.js instalado.

Mantener todos los archivos en la misma carpeta.

Tener disponible el puerto 3000.

No es necesario instalar paquetes externos.

Ejecución local

Clonar el repositorio:

git clone URL_DEL_REPOSITORIO

Entrar en la carpeta del proyecto:

cd laboratorio-04

Iniciar el servidor:

node server.js

Abrir en el navegador:

http://localhost:3000/contacto

Para detener el servidor, utilizar Ctrl + C en la terminal.

Comprobación del funcionamiento

Al abrir el formulario y enviarlo, la terminal debe mostrar una salida similar a la siguiente:

Método: GET
URL: /contacto
Método: GET
URL: /styles.css
Método: POST
URL: /contacto
Formulario recibido

Esto demuestra que:

El navegador solicitó contacto.html.

El navegador realizó otra petición para obtener styles.css.

El formulario generó una petición POST /contacto.

El servidor reconoció el envío y respondió al navegador.

Alcance actual

El laboratorio llega únicamente hasta la presentación visual del formulario y la confirmación de su envío.

En esta versión todavía no se realiza:

Lectura del cuerpo de la petición POST.

Visualización de los valores enviados.

Validación de los datos en el servidor.

Almacenamiento en archivos o bases de datos.

Uso de SQL o SQLite.

Implementación de operaciones CRUD.

Autor

Nombre del estudiante: [Escribir nombre completo]

Asignatura: Ingeniería Web
Programa: Ingeniería de Software
Universidad Cooperativa de Colombia
