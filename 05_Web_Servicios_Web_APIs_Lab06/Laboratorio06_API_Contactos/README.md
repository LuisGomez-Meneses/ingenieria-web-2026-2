# Laboratorio 06 · API de contactos con los estilos de Soporte Web

Esta versión sigue las partes A y B de la presentación y utiliza la hoja CSS original de `demo-oohdm`, sin modificar. Se conservaron el fondo azul oscuro, los paneles, la tipografía, los botones verdes y la navegación.

## Por dónde empezar

| Carpeta | Qué demuestra |
|---|---|
| **01_Parte_A_Crear_API** | Consulta SQLite y entrega id, nombre, correo y mensaje en JSON. |
| **02_Parte_B_Consumir_API** | Incluye A y añade la página con botón, fetch y tabla de id, nombre y correo. |

**Empieza por A y después ejecuta B. Solo debe estar activo un servidor a la vez.** Las carpetas ya contienen el código terminado.

## Parte A

1. Abre `01_Parte_A_Crear_API` en VS Code.
2. Abre su terminal y ejecuta:

```bash
npm start
```

3. Registra dos contactos ficticios en <http://localhost:3000/contacto>.
4. Abre <http://localhost:3000/api/contactos>. Debes recibir JSON con los cuatro campos.

## Parte B

1. Detén el servidor de A con `Ctrl + C`.
2. Para conservar los mismos registros, copia `contactos.db` de A a B antes de iniciar B. Si B ya tiene registros que necesitas conservar, utiliza una copia aparte y evita sustituir su base.
3. Abre `02_Parte_B_Consumir_API` en VS Code y ejecuta `npm start` en su terminal.
4. Abre <http://localhost:3000/contactos> y pulsa **Consultar contactos**.

También puedes iniciar cada parte con `node server_rutas.js`. Utiliza Node.js 24 del curso. No necesitas `npm install`.

## Material docente

Consulta [GUIA_DOCENTE_LAB06.md](GUIA_DOCENTE_LAB06.md): incluye la relación con las diapositivas, instrucciones, código del cliente, explicaciones, pruebas y tarea.

La tarea de la diapositiva 23 añade la columna visible **mensaje** y el total de contactos. El mensaje ya está incluido en el JSON desde la parte A.

## Estilos y datos

- `styles.css` coincide con `public/styles.css` del proyecto Soporte Web proporcionado por el docente.
- Las páginas y los mensajes de confirmación utilizan su estructura y sus clases.
- Se mantiene `server_rutas.js` para coincidir con la presentación; `npm start` ejecuta ese archivo.
- El laboratorio continúa utilizando `contactos.db`. La base `soporte.db` pertenece al ejemplo de clientes y solicitudes de OOHDM.
- No se incluyen bases con datos personales ni contactos precargados. SQLite crea la base al iniciar cada parte.

Luis Miguel Gómez Meneses · Ingeniería Web · Universidad Cooperativa de Colombia.
