# Demostración de OOHDM con Node.js y SQLite

Aplicación didáctica de soporte técnico basada en el ejemplo de la presentación **Metodologías de desarrollo web**. El recorrido implementa las cuatro actividades de OOHDM y utiliza únicamente módulos incorporados de Node.js.

## Requisitos

- Node.js 22.5 o posterior. Se recomienda la versión 24 utilizada en clase.
- Navegador web.

No es necesario ejecutar `npm install` porque el proyecto no usa paquetes externos.

## Ejecución

1. Descomprima el proyecto.
2. Abra una terminal dentro de la carpeta `demo-oohdm`.
3. Ejecute:

```bash
npm start
```

4. Abra <http://localhost:3000>.

La aplicación crea automáticamente `datos/soporte.db`, las tablas y sus relaciones.

## Recorrido para la demostración

1. Abra **Clientes**.
2. Seleccione **Registrar cliente** y complete nombre y correo.
3. Observe el detalle del cliente y su identificador.
4. Seleccione **Nueva solicitud**.
5. Compruebe que el formulario muestra el cliente, pero no solicita nuevamente su nombre o correo.
6. Escriba la descripción y registre la solicitud.
7. Revise la confirmación y regrese al detalle del cliente.

## Rutas

| Método | Ruta | Función |
|---|---|---|
| GET | `/` | Página principal |
| GET | `/acerca` | Propósito y reglas del dominio |
| GET | `/clientes` | Índice de clientes |
| GET | `/clientes/nuevo` | Formulario de cliente |
| POST | `/clientes` | Valida e inserta un cliente |
| GET | `/clientes/:id` | Detalle y solicitudes del cliente |
| GET | `/clientes/:id/solicitudes/nueva` | Formulario asociado al cliente |
| POST | `/solicitudes` | Valida e inserta la solicitud |
| GET | `/styles.css` | Hoja de estilos externa |

## Estructura

```text
demo-oohdm/
├── datos/
├── docs/
│   └── OOHDM.md
├── public/
│   ├── acerca.html
│   ├── index.html
│   └── styles.css
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Alcance didáctico

La aplicación no incluye autenticación, edición, eliminación ni administración de estados. Su propósito consiste en demostrar la correspondencia entre los modelos de OOHDM y una implementación sencilla.
