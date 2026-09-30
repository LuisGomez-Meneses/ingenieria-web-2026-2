# Laboratorio 06: consultar contactos mediante una API web

**Guía de demostraciones para el docente**  
Ingeniería Web · Universidad Cooperativa de Colombia  
Docente: Luis Miguel Gómez Meneses

## 1. Laboratorio 06 según la presentación

Un laboratorio con dos demostraciones encadenadas, realizadas por el docente:

| Demostración | Pregunta que responde | Resultado | Tiempo |
|---|---|---|---|
| A. Publicar una consulta de contactos | ¿Cómo entrega datos el servidor a un cliente? | `GET /api/contactos` devuelve JSON obtenido de SQLite. | 25 min |
| B. Consumir la API desde una página | ¿Cómo utiliza esos datos el navegador? | Un botón ejecuta `fetch` y llena una tabla sin recargar la página. | 25 min |

Los estudiantes observan, predicen resultados y responden preguntas durante la demostración. La ampliación individual queda como tarea. SOAP, WSDL, GraphQL, XML, YAML y OpenAPI pertenecen al panorama conceptual de esta sesión; estas dos demostraciones implementan HTTP, una API de consulta y JSON.

### Correspondencia con las diapositivas

| Diapositivas | Parte del laboratorio | Código de esta entrega |
|---|---|---|
| 15 | Propósito y organización en partes A y B | Un Laboratorio 06, con dos momentos consecutivos de 25 minutos. |
| 16–17 | Parte A: crear la API | `server_rutas.js`: SELECT de cuatro campos y `GET /api/contactos`. |
| 18 | Parte B: crear la página de consulta | `contactos.html` y ruta `/contactos`. |
| 19–20 | Parte B: consumir y presentar los datos | `cargarContactos()`, `mostrarContactos()` y `agregarCelda()`. |
| 21–22 | Comprobación y preguntas | Registrar, volver a consultar y explicar el recorrido. |
| 23 | Tarea | Mostrar el mensaje ya recibido y el total de contactos. |

Las carpetas son versiones de avance del mismo laboratorio. La parte B incluye lo realizado en la parte A. El HTML completo añade la estructura de la página y sus estilos alrededor de los fragmentos mostrados en las diapositivas.

### Distribución de las dos horas

| Minutos | Actividad |
|---|---|
| 0–55 | Explicación apoyada en la presentación: API, cliente/servidor, HTTP, formatos de datos y panorama REST/SOAP/GraphQL y WSDL/OpenAPI. |
| 55–80 | Demostración A: SQLite → consulta del servidor → respuesta JSON. |
| 80–105 | Demostración B: botón → `fetch` → tabla. |
| 105–115 | Comprobaciones y preguntas sobre el recorrido de los datos. |
| 115–120 | Explicación de la tarea. |

## 2. Punto de partida confirmado

Esta versión mantiene el laboratorio de contactos de las diapositivas 15–23 y aplica la apariencia del proyecto `demo-oohdm.rar` compartido por el docente. Se reutiliza **la hoja `public/styles.css` original, sin cambiar sus reglas**, como `styles.css` en las dos partes. El HTML utiliza las clases `marca`, `hero`, `encabezado-pagina`, `panel`, `etiqueta`, `acciones`, `boton` y `secundario`.

La página inicial, Acerca de, Servicios, el formulario, la confirmación y los errores HTML utilizan el mismo diseño. La parte B añade la página de consulta con ese diseño. El contenedor de la tabla permite desplazamiento horizontal en pantallas estrechas.

La base `soporte.db` del ejemplo OOHDM contiene clientes y solicitudes. Este Laboratorio 06 sigue usando **`contactos.db` y la tabla `contactos`**, como la presentación. Se reutiliza el diseño visual de Soporte Web y se conservan las operaciones del laboratorio de contactos. No se convierten los registros de una base en registros de la otra.

El servidor original utiliza CommonJS, `http`, `fs` y `DatabaseSync` de `node:sqlite`. Ya dispone de `GET /contacto`, `POST /contacto`, validación de campos obligatorios, `INSERT` parametrizado y respuestas HTML. El archivo anterior se llamaba `server.js`. En este paquete se llama **`server_rutas.js`** para coincidir con la presentación. Si continúas sobre tu copia anterior, renómbralo antes de seguir la guía.

| Archivo | Función |
|---|---|
| `index_rutas.html` | Página inicial. |
| `acerca.html` | Información del curso. |
| `servicios.html` | Página de servicios. |
| `contacto.html` | Formulario con nombre, correo y mensaje. |
| `styles.css` | Hoja original de Soporte Web, idéntica en las partes A y B. |
| `package.json` | Permite iniciar cada parte con `npm start`. |
| `server_rutas.js` | Servidor HTTP, rutas y acceso a SQLite. |
| `contactos.db` | Base de datos creada al ejecutar el servidor. |

La tabla ya utilizada es `contactos(id, nombre, correo, mensaje)`. La consulta selecciona **id, nombre, correo y mensaje desde la parte A**, como muestra la diapositiva 16. En clase, la tabla de la parte B presenta solamente **id, nombre y correo**. La tarea añade la columna visible **mensaje** y el total de contactos; el SELECT ya está completo.

## 3. Cómo utilizar el paquete

| Carpeta | Qué contiene |
|---|---|
| `01_Parte_A_Crear_API` | Proyecto completo al terminar la demostración A. |
| `02_Parte_B_Consumir_API` | Proyecto completo al terminar las dos demostraciones. |

**Cada carpeta es una versión independiente. Ejecuta un solo servidor a la vez.** Los archivos SQLite no están incluidos: se crean al iniciar cada versión, y las carpetas no comparten automáticamente sus registros.

### Preparación antes de clase

Las dos carpetas contienen código completo y listo para ejecutar. Los bloques de esta guía explican el código que ya está incluido.

1. Extrae el ZIP en una carpeta nueva para conservar cualquier base de datos de tus ensayos anteriores.
2. Abre `01_Parte_A_Crear_API` en VS Code y abre su terminal.
3. Comprueba `node --version`. El entorno del curso es Node.js 24.11.0. No se necesita `npm install`.
4. Ejecuta `npm start`, que inicia `node server_rutas.js`.
5. Abre `http://localhost:3000/contacto` y registra los contactos ficticios de la tabla siguiente.
6. Consulta `http://localhost:3000/api/contactos` para demostrar la parte A.
7. Detén Node con `Ctrl + C` antes de cambiar de parte.
8. Si quieres conservar los mismos registros, copia `contactos.db` de A a B antes de iniciar B. Si B ya contiene información que necesitas conservar, ensaya en una copia aparte y evita sustituir esa base.
9. Abre `02_Parte_B_Consumir_API` en VS Code. En su terminal ejecuta `npm start`.
10. Abre `http://localhost:3000/contactos` y presiona **Consultar contactos**.

| Nombre | Correo | Mensaje |
|---|---|---|
| Ana | ana@example.com | Quiero información del curso. |
| Beatriz | beatriz@example.com | Tengo una consulta sobre el laboratorio. |

Los identificadores pueden ser distintos de 1 y 2 si ya había registros. Cada carpeta crea su propia base cuando se inicia por primera vez; no comparten los registros automáticamente.

**Para explicar los cambios en clase:** muestra el SELECT y la ruta de la API en la parte A; después abre la parte B y muestra la ruta `/contactos` y el JavaScript de `contactos.html`. Las partes ya están implementadas. Si quieres escribir los bloques durante la clase, utiliza una copia de tu Laboratorio 05 como punto de partida y conserva estas versiones terminadas como referencia.

## 4. Parte A · Crear la API: el servidor entrega los contactos en JSON

### Objetivo y apertura — 3 minutos

Abre `/contacto` y recuerda que el formulario guarda información. Plantea:

> Ya sabemos guardar contactos. Ahora necesitamos que el servidor entregue esos datos para que otro programa pueda utilizarlos. Vamos a ofrecer una operación de consulta mediante una API web.

El navegador será el cliente inicial. Solicitará `/api/contactos` y mostrará el contenido recibido. Todavía no habrá una tabla HTML.

### Paso A1. Preparar el SELECT — 5 minutos

En `server_rutas.js`, localiza este bloque después de `insertarContacto` y **antes de** `const server = http.createServer(...)`:

```javascript
const consultarContactos = db.prepare(`
    SELECT id, nombre, correo, mensaje
    FROM contactos
    ORDER BY id`);

```

| Instrucción | Explicación para clase |
|---|---|
| `SELECT id, nombre, correo, mensaje` | Selecciona las columnas que se entregarán al cliente. |
| `FROM contactos` | Indica la tabla que se consulta. |
| `ORDER BY id` | Ordena los registros por identificador ascendente. |
| `db.prepare(...)` | Prepara la sentencia SQL para ejecutarla cuando llegue una petición. |

Aclara que preparar la sentencia todavía no envía datos al navegador. La consulta se ejecutará con `.all()` al recibir el GET.

### Paso A2. Incorporar la ruta de la API — 8 minutos

Dentro de `http.createServer`, localiza la ruta `/api/contactos`, que aparece **antes de `POST /contacto`** y del 404 final. Este es el bloque de la parte A:

```javascript
    // PARTE A: operación de consulta mostrada en la diapositiva 17.
    else if (req.method === 'GET' && req.url === '/api/contactos') {
        try {
            const contactos = consultarContactos.all();
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            return res.end(JSON.stringify(contactos));
        } catch (error) {
            console.error('Error al consultar:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'No fue posible consultar los contactos'
            }));
        }
    }

```

La ruta debe quedar antes del `else` final que responde 404. Las diapositivas presentan cada ruta con `if`; al integrarlas en la cadena de condiciones del servidor anterior utilizamos `else if`. No agregues un segundo `http.createServer` ni un segundo `server.listen`.

Explica primero el recorrido exitoso y después el `catch`, que devuelve 500 si falla la consulta.

| Elemento | Qué significa |
|---|---|
| `GET /api/contactos` | Operación de consulta que ofrece el servidor. |
| `consultarContactos.all()` | Ejecuta el SELECT y devuelve todas sus filas como un arreglo de objetos JavaScript. |
| `200` | La consulta fue atendida correctamente. |
| `Content-Type: application/json` | El cuerpo de la respuesta se entrega en JSON. |
| `JSON.stringify(contactos)` | Convierte el arreglo JavaScript en texto JSON. |
| `res.end(...)` | Envía el cuerpo y termina la respuesta. |
| `500` | La consulta falló en el servidor; la respuesta contiene un objeto JSON de error. |

El prefijo `/api` es una convención del proyecto. El programador implementa la operación mediante código; escribir ese prefijo no crea una API automáticamente.

### Paso A3. Ejecutar y observar — 6 minutos

1. Guarda `server_rutas.js`.
2. Inicia el servidor desde la carpeta del proyecto:

```bash
node server_rutas.js
```

3. Abre `http://localhost:3000/api/contactos` en el navegador.
4. Con los dos registros de ejemplo, verás datos equivalentes a estos:

```json
[
  {"id": 1, "nombre": "Ana", "correo": "ana@example.com", "mensaje": "Quiero información del curso."},
  {"id": 2, "nombre": "Beatriz", "correo": "beatriz@example.com", "mensaje": "Tengo una consulta sobre el laboratorio."}
]
```

La presentación visual puede cambiar según el navegador. El servidor envía el JSON sin formato adicional; los datos y su estructura son los que importan.

5. Abre las herramientas de desarrollo con F12, selecciona **Red / Network** y recarga esta dirección. Selecciona la petición `contactos`.
6. Muestra el método GET, el estado 200, el encabezado de respuesta `Content-Type` y la pestaña **Respuesta / Response**.
7. Si no hay registros, la respuesta correcta es `[]`: una lista vacía también es una consulta exitosa, con estado 200.

### Cierre A — 3 minutos

Pregunta: «¿Por qué no aparece una tabla como en una página web?» Respuesta esperada: «Porque esta operación entrega datos JSON; todavía no hemos programado cómo mostrarlos».

Pregunta: «¿El GET agrega un contacto?» Respuesta esperada: «No. Consulta los registros existentes».

Frase de cierre: **El servidor consultó SQLite y entregó una representación de los contactos en JSON.**

## 5. Parte B · Consumir la API: una página consume la API y muestra una tabla

### Objetivo y apertura — 2 minutos

> La API ya entrega los contactos. Ahora una página va a pedir esos datos y utilizarlos para construir una tabla. El JavaScript del navegador será el cliente de esa operación.

### Paso B1. Entregar la página de consulta — 3 minutos

Detén el servidor de A antes de iniciar B. En el `server_rutas.js` de la parte B, localiza este bloque, que entrega la nueva página y conserva la API de A:

```javascript
    // PARTE B: ruta de la página mostrada en la diapositiva 18.
    else if (req.method === 'GET' &&
        req.url === '/contactos') {
      const html = fs.readFileSync(
          'contactos.html');
      res.writeHead(200, { 'Content-Type':
          'text/html; charset=UTF-8' });
      return res.end(html);
    }

```

Escribe la distinción en clase:

| Dirección | Respuesta | Propósito |
|---|---|---|
| `/contacto` | HTML con formulario | Registrar un contacto. |
| `/contactos` | HTML con botón y tabla | Presentar la pantalla de consulta. |
| `/api/contactos` | JSON | Entregar los datos solicitados por el cliente. |

### Paso B2. Crear `contactos.html` — 10 minutos

Abre `contactos.html`, ubicado junto a `server_rutas.js` en la parte B. El HTML utiliza la estructura visual de Soporte Web. Centra la explicación de la API en el contenido de `<script>`. Este es el archivo completo:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soporte Web | Consultar contactos</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header>
    <a class="marca" href="/">Soporte Web</a>
    <nav aria-label="Navegación principal">
      <a href="/">Inicio</a>
      <a href="/acerca">Acerca de</a>
      <a href="/servicios">Servicios</a>
      <a href="/contacto">Contacto</a>
      <a href="/contactos">Consultar contactos</a>
    </nav>
  </header>
  <main>
    <section class="encabezado-pagina">
      <p class="etiqueta">Consulta</p>
      <h1>Contactos registrados</h1>
      <p>Consulta los contactos guardados o registra uno nuevo.</p>
      <div class="acciones">
        <button id="btnConsultar" type="button">Consultar contactos</button>
        <a class="boton secundario" href="/contacto">Registrar contacto</a>
      </div>
    </section>
    <section class="panel">
      <h2>Lista de contactos</h2>
      <p id="estado" role="status" aria-live="polite"></p>
      <div role="region" aria-label="Tabla de contactos" tabindex="0" style="overflow-x: auto;">
        <table id="tablaContactos" aria-label="Contactos almacenados">
          <thead>
            <tr><th scope="col">ID</th><th scope="col">Nombre</th><th scope="col">Correo</th></tr>
          </thead>
          <tbody id="cuerpoTabla"></tbody>
        </table>
      </div>
    </section>
  </main>
  <footer>Ingeniería Web · Demostración académica</footer>
    <script>
        const boton = document.getElementById('btnConsultar');
        const estado = document.getElementById('estado');
        const cuerpoTabla = document.getElementById('cuerpoTabla');

        async function cargarContactos() {
            estado.textContent = 'Consultando...';
            cuerpoTabla.replaceChildren();
            try {
                const respuesta = await fetch('/api/contactos');
                if (!respuesta.ok) {
                    throw new Error(`Estado HTTP ${respuesta.status}`);
                }
                const contactos = await respuesta.json();
                mostrarContactos(contactos);
            } catch (error) {
                console.error(error);
                estado.textContent = 'No fue posible consultar los contactos.';
            }
        }
        boton.addEventListener('click', cargarContactos);

        function mostrarContactos(contactos) {
            if (contactos.length === 0) {
                estado.textContent = 'No hay contactos registrados.';
                return;
            }
            for (const contacto of contactos) {
                const fila = document.createElement('tr');
                agregarCelda(fila, contacto.id);
                agregarCelda(fila, contacto.nombre);
                agregarCelda(fila, contacto.correo);
                cuerpoTabla.appendChild(fila);
            }
            estado.textContent = '';
        }

        function agregarCelda(fila, valor) {
            const celda = document.createElement('td');
            celda.textContent = valor;
            fila.appendChild(celda);
        }
    </script>
</body>
</html>
```

El script se coloca al final de `<body>` para que los elementos que busca ya existan cuando se ejecute.

### Qué explicar del JavaScript

| Instrucción | Explicación |
|---|---|
| `getElementById(...)` | Obtiene un elemento de la página para poder usarlo. |
| `addEventListener('click', ...)` | Indica qué hacer al presionar el botón. |
| `async` | Permite utilizar `await` dentro de esta función. |
| `await fetch('/api/contactos')` | Hace una petición GET a esa ruta del mismo servidor y espera la respuesta. |
| `respuesta.ok` | Es verdadero cuando el estado HTTP está entre 200 y 299. |
| `await respuesta.json()` | Lee el cuerpo JSON y lo convierte en datos JavaScript. |
| `contactos.length === 0` | Detecta una consulta correcta sin registros. |
| `for (const contacto of contactos)` | Recorre uno por uno los contactos recibidos. |
| `createElement(...)` | Crea la fila y sus celdas. |
| `textContent` | Coloca los datos como texto dentro de cada celda. |
| `appendChild` | Añade las celdas a la fila y la fila a la tabla. |
| `replaceChildren()` | Retira las filas de la consulta anterior. |
| `cargarContactos()` | Solicita la respuesta y la interpreta, como en la diapositiva 19. |
| `mostrarContactos(contactos)` | Recorre la lista recibida y prepara las filas, como en la diapositiva 20. |
| `agregarCelda(fila, valor)` | Crea una celda y coloca el valor con `textContent`, como en la diapositiva 20. |

Presenta este recorrido por separado: **el servidor usa `JSON.stringify`; el navegador usa `respuesta.json()`**. La primera operación serializa datos; la segunda interpreta el JSON recibido. El nombre y la estructura de las propiedades deben coincidir: si el servidor entrega `nombre`, el cliente accede a `contacto.nombre`.

`await` pausa la continuación de esa función hasta obtener el resultado; el navegador puede seguir atendiendo la interfaz.

### Paso B3. Reconocer los estilos y el acceso — 3 minutos

La hoja `styles.css` ya está incluida y es la misma del proyecto `demo-oohdm`. No necesitas añadir reglas a esa hoja para ejecutar el laboratorio.

| Clase o elemento | Uso en la nueva página |
|---|---|
| `marca` | Nombre Soporte Web en verde. |
| `encabezado-pagina` | Etiqueta, título e introducción. |
| `acciones` | Botón de consulta y enlace para registrar. |
| `panel` | Contenedor oscuro de la tabla. |
| `boton secundario` | Enlace con borde verde para registrar un contacto. |
| `table`, `th`, `td` | Tabla con encabezados verdes y separadores. |

La navegación de la parte B ya incluye el enlace a `/contactos`. Las confirmaciones y errores del formulario también utilizan una función `plantilla()` con la misma estructura de Soporte Web. Esta función organiza el HTML; la API continúa entregando JSON.

La respuesta de `/api/contactos` se ve como datos JSON en el navegador. La hoja CSS se aplica a las páginas HTML, incluida `/contactos`.

### Paso B4. Ejecutar y explicar la comunicación — 5 minutos

1. Guarda los cambios e inicia nuevamente `node server_rutas.js`.
2. Abre **`http://localhost:3000/contactos`**. No abras el HTML con doble clic ni con Live Server: esta demostración utiliza el servidor Node del puerto 3000.
3. Antes de presionar el botón, señala que la página ya cargó, pero todavía no consultó los contactos.
4. Abre F12 → Red / Network; selecciona el filtro Fetch/XHR si está disponible.
5. Presiona **Consultar contactos**.
6. Muestra que aparece una petición `GET /api/contactos`, seguida de las filas de la tabla. La página no navega a otra dirección.
7. En otra pestaña abre `/contacto` y registra un tercer contacto ficticio.
8. Regresa a `/contactos` y vuelve a presionar el botón. El nuevo contacto debe aparecer y los anteriores no deben duplicarse.

### Cierre B — 2 minutos

Pregunta: «¿La página consulta directamente el archivo SQLite?» Respuesta esperada: «No. Pide datos al servidor mediante la API. El servidor ejecuta la consulta».

Pregunta: «¿Quién construye la tabla?» Respuesta esperada: «El JavaScript que se ejecuta en el navegador».

## 6. Comprobaciones de cierre — 10 minutos

Realiza las tres primeras con el grupo. Las demás sirven como ensayo del docente o para resolver dudas.

| Comprobación | Acción | Resultado esperado |
|---|---|---|
| API disponible | Abrir `/api/contactos`. | 200 y una lista JSON. |
| Consulta desde la página | Presionar el botón de `/contactos`. | Una fila por contacto. |
| Actualización y repetición | Registrar un contacto nuevo y consultar dos veces. | Aparece el registro nuevo; no hay filas duplicadas. |
| Lista vacía | Iniciar una copia del proyecto que todavía no tenga base ni registros. | API: `[]`; página: «No hay contactos registrados». |
| Servidor detenido | Mantener `/contactos` abierta, detener Node y presionar el botón. | Mensaje de error. Reiniciar Node y consultar nuevamente para continuar. |
| Campos obligatorios | Enviar al servidor un formulario con algún campo vacío. | 400 y no se inserta el registro. |
| Persistencia | Reiniciar el servidor en la misma carpeta y consultar. | Los contactos siguen guardados. |

Para mostrar la lista vacía, usa una copia temporal sin base de datos; no elimines los registros de tu proyecto para hacer esta comprobación. Siempre detén el servidor anterior antes de iniciar otra copia en el puerto 3000.

## 7. Qué relación tiene este laboratorio con API, HTTP, JSON y REST

| Concepto | Dónde se observa |
|---|---|
| API web | La operación `GET /api/contactos` que el servidor pone a disposición del cliente. |
| Cliente | El navegador; en la segunda demostración, su JavaScript usa `fetch`. |
| Servidor | El programa Node.js que atiende las peticiones. |
| HTTP | Petición GET, direcciones, encabezados y códigos de estado. |
| JSON | Formato del cuerpo de la respuesta de consulta. |
| SQLite / SQL | Almacenamiento y consulta que realiza el servidor. |
| Recurso | La colección de contactos, identificada por `/api/contactos`. |
| REST | Se introduce el diseño basado en recursos, el uso de GET para consultar y una petición que identifica por sí misma lo solicitado. |

Esta es una introducción práctica a una API de consulta con ideas de REST. Una ruta que devuelve JSON no demuestra por sí sola todas las restricciones del estilo REST. La persistencia en SQLite es compatible con la idea de peticiones sin estado de sesión: guardar contactos no equivale a depender de una conversación anterior para interpretar un GET.

La pantalla y el servidor son componentes del mismo proyecto. La API ofrece una interfaz para que un cliente acceda a los datos; ese cliente podría ser otra aplicación. Aquí los dos componentes permiten mostrar la comunicación con el proyecto que ya conocemos.

El formulario anterior envía `application/x-www-form-urlencoded` y recibe una confirmación HTML. La nueva consulta devuelve JSON. No estamos cambiando el formulario para que envíe JSON.

| Tema de la presentación | Papel en esta sesión |
|---|---|
| XML y JSON | Comparar formatos; se programa con JSON en las demostraciones. |
| YAML | Reconocer su uso habitual en configuración y documentos como OpenAPI; no es necesario para ejecutar este proyecto. |
| OpenAPI | Describir operaciones y formatos de una API HTTP. No se añade una herramienta de documentación en estos 50 minutos. |
| SOAP y WSDL | Panorama del intercambio de mensajes SOAP y de la descripción de servicios. Se reservan los detalles prácticos para otra sesión. |
| GraphQL | Panorama de consultas y selección de campos; no se implementa un servidor GraphQL en este laboratorio. |

## 8. Tarea para los estudiantes — explicación de 5 minutos

**Nombre:** Ampliación del Laboratorio 06: mensajes y total de contactos.

Partiendo de la versión terminada de la parte B, realizar exactamente la ampliación de la diapositiva 23:

1. Agregar a la tabla una columna que muestre el mensaje de cada contacto.
2. Mostrar el número total de contactos consultados.
3. Registrar dos contactos ficticios y comprobar que aparecen en la tabla.
4. Explicar quién actúa como cliente, quién como servidor y qué función cumple JSON.

**Punto de partida:** la respuesta de `GET /api/contactos` ya incluye `mensaje`. La ampliación consiste en presentarlo en la tabla. No se pide añadirlo al SELECT.

**Entregables:** código actualizado (`server_rutas.js` y `contactos.html`), una captura de la tabla con la columna mensaje y el total, y una explicación breve del punto 4. La fecha y la forma de entrega se informan por los canales del curso.

**Criterios de revisión:** mensajes visibles, total correcto, registros ficticios presentes y explicación del recorrido. No se asigna un porcentaje nuevo en este material.

## 9. Problemas frecuentes y solución

| Síntoma | Causa probable | Qué revisar |
|---|---|---|
| `EADDRINUSE` | Otro servidor utiliza el puerto 3000. | Detenerlo con `Ctrl + C` antes de iniciar esta versión. |
| `ENOENT` al abrir una página | La terminal está en otra carpeta o falta un archivo. | Ejecutar `node server_rutas.js` dentro de la carpeta del proyecto y verificar los nombres. |
| `/api/contactos` responde 404 | Se ejecuta una versión anterior, no se reinició Node o la ruta quedó después del 404. | Guardar, revisar la ubicación del bloque y reiniciar. |
| `/contactos` responde 404 | Todavía se ejecuta la demostración A o falta la ruta de la página. | Incorporar el paso B1 y reiniciar. |
| JSON vacío aunque había contactos | Se abrió otra copia de `contactos.db` al cambiar de carpeta. | Revisar la carpeta de ejecución y la base utilizada. |
| La tabla no muestra filas | No hay registros o falló la consulta. | Revisar el mensaje de estado, Red / Network y la terminal. |
| Error al interpretar JSON | La dirección respondió HTML, por ejemplo una página de error. | Verificar la ruta `/api/contactos`, el estado y la respuesta recibida. |
| `require is not defined` | Se incorporó el código a un proyecto configurado como módulos ES. | Ejecutar la carpeta independiente entregada, que utiliza CommonJS. |
| No se reconoce `node:sqlite` | La versión instalada no corresponde al entorno previsto. | Comprobar `node --version`; utilizar Node.js 24 del curso. |
| Aviso experimental de SQLite | Algunas versiones de Node muestran este aviso. | Distinguir el aviso de un error: si aparece la dirección del servidor y responde, se puede continuar. |

El proyecto mantiene la estructura sencilla del laboratorio original. Está preparado para demostración local con datos ficticios. No incorpora autenticación ni autorización para publicar contactos reales.

## 10. Referencias técnicas

- [Node.js 24.11.0: SQLite, DatabaseSync y StatementSync](https://nodejs.org/download/release/v24.11.0/docs/api/sqlite.html).
- [MDN: Uso de Fetch](https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch).

Los archivos `server_rutas.js` de cada versión contienen el código completo; los bloques de esta guía muestran dónde se incorpora cada cambio.


## Verificación de esta versión con los estilos de clase

Se superaron 15 comprobaciones con Node.js v24.19.0 y Chromium 153.0.8010.0. Se verificó que el CSS de cada parte coincide byte por byte con la hoja original del proyecto `demo-oohdm`. Se revisaron visualmente el formulario, la confirmación y la tabla, así como su presentación en una pantalla móvil.

También se comprobaron el envío del formulario desde el navegador, el JSON de cuatro campos, la tabla de tres columnas, las consultas sucesivas, los mensajes de error, las listas vacías y la persistencia tras reiniciar. Las pruebas utilizaron copias temporales y contactos ficticios. El entorno del curso utiliza Node.js 24.11.0; la ejecución de estas pruebas se realizó con la versión 24 indicada arriba.
