# Laboratorio 06 · Parte B

Esta carpeta contiene la parte B terminada. La parte B incluye todo el trabajo de la parte A.

Abre una terminal dentro de esta carpeta y ejecuta:

```bash
npm start
```

También puedes ejecutar `node server_rutas.js`. Se utiliza Node.js 24, como en clase. No hay dependencias para instalar.

Registra contactos ficticios en <http://localhost:3000/contacto> y consulta el JSON en <http://localhost:3000/api/contactos>.

Después abre <http://localhost:3000/contactos> y pulsa **Consultar contactos**.

Al iniciar, se crea `contactos.db` en esta carpeta. Para pasar los mismos registros de A a B, detén Node con `Ctrl + C` y copia esa base a la carpeta B antes de iniciarla. Si la carpeta B ya tiene registros que necesitas conservar, usa una copia aparte para ensayar y evita sustituir su base.

La hoja `styles.css` es la original de `demo-oohdm`, sin modificar. Las páginas usan las clases `marca`, `hero`, `panel`, `encabezado-pagina`, `etiqueta`, `acciones`, `boton` y `secundario` del proyecto de clase.

El esquema de datos sigue siendo `contactos(id, nombre, correo, mensaje)`, como en la presentación del Laboratorio 06. El JSON contiene los cuatro campos; la tabla de la parte B muestra tres. La tarea añade la columna visible mensaje y el total.
