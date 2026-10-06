# Laboratorio 07: organización de la aplicación de contactos con capas y MVC

**Tiempo de práctica: 20 minutos, después de 25 minutos de explicación.**  
Modalidad: demostración guiada y una modificación corta por estudiante o pareja.

## Objetivo y resultado

Reconocer las responsabilidades del proyecto existente, seguir una solicitud de extremo a extremo y ubicar una regla de validación en el modelo. Al terminar, el mismo formulario y la misma API funcionarán con código organizado, y el servidor rechazará mensajes de menos de 10 caracteres.

El punto de partida es el Laboratorio 06, parte B. El código entregado ya realiza la separación para que el tiempo de clase se dedique a comprenderla. `00_Base_Lab06` permite comparar con la versión anterior.

## Paso 1. Ejecutar y comparar — 4 minutos

Abre una terminal en esta carpeta, con el servidor anterior detenido:

```powershell
npm run ejemplos
npm start
```

Entra en `/contactos` y pulsa **Consultar contactos**. Debes ver Ana y Beatriz si usas una base nueva. En una base propia, el total dependerá de tus registros.

**Pregunta 1:** ¿cambió lo que ve el usuario? ¿Qué cambió internamente?

## Paso 2. Identificar responsabilidades — 4 minutos

| Archivo | Responsabilidad | Relación con los conceptos |
|---|---|---|
| `server_rutas.js` | Crear el servidor HTTP, registrar solicitudes y delegar. | Arranque de la aplicación. |
| `routes/rutas.js` | Elegir una acción según método y ruta; entregar archivos estáticos. | Entrada y enrutamiento. |
| `controllers/contactoController.js` | Leer HTTP, llamar al modelo, elegir estado y formato de respuesta. | Controlador, en el límite de presentación/HTTP. |
| `models/contactoModel.js` | Aplicar reglas del contacto y coordinar operaciones. | Modelo, lógica del dominio. |
| `data/contactoRepository.js` | Abrir SQLite y ejecutar `SELECT` e `INSERT`. | Acceso a datos/persistencia. |
| `views/*.html` y `views/respuestas.js` | Presentar la interfaz, confirmaciones y errores. | Vista/presentación. |
| `public/styles.css` | Mantener el aspecto de Soporte Web. | Presentación. |
| `data/contactos.db` | Almacenar registros. | Almacén de datos, separado del código que accede a él. |

**Capas y MVC se complementan.** No son tres bloques equivalentes uno a uno. El modelo abarca reglas y datos y utiliza el repositorio; el controlador coordina HTTP; la vista muestra información. Las carpetas ayudan, pero la separación depende de lo que hace y de lo que importa cada archivo. Todo puede ejecutarse en el mismo equipo.

**Pregunta 2:** si cambiara la base de datos, ¿qué archivo concentraría el cambio? ¿Tendrías que reescribir el formulario?

## Paso 3. Seguir GET y POST — 4 minutos

**Consulta:** el botón de `views/contactos.html` ejecuta `fetch('/api/contactos')`. El enrutador llama al controlador. Este pide los contactos al modelo, que utiliza el repositorio y su `SELECT`. El controlador serializa el resultado como JSON. La página interpreta la respuesta y crea las filas con `textContent`.

**Registro:** `views/contacto.html` envía `POST /contacto`. El controlador lee el formulario y llama a `crearContacto`. El modelo limpia espacios y comprueba los campos. El repositorio ejecuta el `INSERT`. El controlador devuelve HTML de confirmación con estado 201.

**Pregunta 3:** ¿por qué el repositorio no debería llamar a `res.writeHead()`? ¿Dónde está `JSON.stringify()` y por qué?

## Paso 4. Agregar una regla — 5 minutos

Abre `models/contactoModel.js`. Después de comprobar los campos obligatorios y antes de `repositorio.insertar(contacto)`, agrega:

```javascript
if (contacto.mensaje.length < 10) {
    throw new ErrorValidacion('El mensaje debe tener al menos 10 caracteres.');
}
```

Guarda. Detén el servidor con `Ctrl + C` y ejecútalo otra vez. Este ejemplo no tiene recarga automática.

Prueba el formulario con un nombre, un correo ficticio y el mensaje `Hola`: debe responder 400 con la explicación y no crear el contacto. Prueba después `Necesito información`: debe responder 201 y aparecer en la consulta.

La nueva regla se evalúa después de quitar espacios exteriores. El navegador sigue comprobando el correo mediante `type="email"`; el modelo de esta práctica conserva la comprobación de campos obligatorios y agrega la longitud del mensaje. No presentamos esa comprobación del navegador como validación completa en el servidor.

**Pregunta 4:** ¿por qué ubicamos esta regla en el modelo? ¿Qué ocurriría si solo estuviera en HTML?

## Paso 5. Evidencias y reflexión — 3 minutos

Conserva una captura del mensaje rechazado y otra de la tabla después de registrar el mensaje válido. En la pestaña Red, comprueba `POST /contacto` con estados 400/201 y `GET /api/contactos` con 200.

**Pregunta 5:** explica el recorrido de una solicitud con los nombres reales de cuatro archivos. Identifica en tu respuesta una vista, un controlador, el modelo y el repositorio.

**Resultado esperado:** la interfaz, las rutas públicas y el esquema SQL siguen siendo los del Lab06. La organización interna y la regla de longitud constituyen el trabajo de esta práctica.
