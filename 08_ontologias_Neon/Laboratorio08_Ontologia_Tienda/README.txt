LABORATORIO 08 · PRIMERA ONTOLOGÍA DE UNA TIENDA WEB
Ingeniería Web · UCC · Luis Miguel Gómez Meneses
Demostración docente y actividad breve · 30 minutos

PROPÓSITO
Leer, ampliar y justificar una ontología pequeña. Se trabaja el significado del dominio después de MVC/capas. No se modifica el servidor anterior ni su base SQLite.

ABRIR
1. Abra GUIA_LAB08.html en su navegador.
2. Abra modelo_base.svg para consultar el esquema.
3. Edite una copia de modelo_base.drawio con diagrams.net u otro editor compatible.
4. Lea y edite ontologia_base.ttl con un editor de texto.
No se necesita servidor, npm install, Python ni GPU. El visor HTML y SVG funcionan localmente. El archivo .drawio requiere un editor compatible para modificarlo; puede usarse su versión instalada. Si no dispone del editor, dibuje el mismo modelo en la herramienta que utilice y conserve el archivo editable.

PREGUNTAS DE COMPETENCIA
PC1 ¿Qué productos incluye pedido001?
PC2 ¿Quién realiza pedido001?
PC3 ¿Qué individuos pueden clasificarse como Producto considerando sus subclases?

SECUENCIA
0–3 min: leer propósito y preguntas.
3–13 min: distinguir clases, individuos, subclases, propiedades de objeto y propiedades de datos. Localizar cada elemento en el Turtle.
13–23 min: añadir Mochila como subclase de Producto y mochila001 como individuo. Precio 80000 COP, nombre Mochila escolar. Relacionar pedido001 con mochila001. Actualizar diagrama y Turtle.
23–30 min: responder PC1–PC3, comprobar coherencia y justificar una inferencia.

LÍMITES DEL EJEMPLO
La relación incluyeProducto simplifica la tienda: no representa cantidad ni precio histórico de cada línea. En el seguimiento deberá utilizarse DetallePedido cuando esos datos formen parte de los requisitos.
El JSON o el diagrama no son equivalentes por sí solos a un razonador. Este paquete contiene un modelo formal en Turtle; las inferencias se justifican manualmente. No ejecuta razonamiento OWL.
Dominio y rango no son validaciones de formulario. No todas las clases son disjuntas.
La fecha es ficticia y solo sirve como ejemplo.

ENTREGA DE LA ACTIVIDAD
Una copia del diagrama, Turtle ampliado y PLANTILLA_RESPUESTAS.txt completada. Esta actividad guiada no tiene una nota adicional; prepara el seguimiento del 10%.

La carpeta solucion_docente contiene la respuesta. Reserve su revisión para el cierre.
Fuentes: Noy y McGuinness, Ontology Development 101; W3C OWL 2 Primer; W3C Turtle.
https://protege.stanford.edu/publications/ontology_development/ontology101.pdf
https://www.w3.org/TR/owl2-primer/
https://www.w3.org/TR/turtle/
