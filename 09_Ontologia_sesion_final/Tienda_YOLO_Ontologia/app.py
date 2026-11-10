"""Tienda académica local: Flask + SQLite + YOLO ONNX + RDF/SPARQL."""
from pathlib import Path
from datetime import datetime, timezone
from io import BytesIO
import json
import math
import os
import sqlite3
import uuid
from flask import Flask, jsonify, request, send_from_directory, Response
from PIL import Image, ImageOps, UnidentifiedImageError
from rdflib import RDF, Literal, XSD
from detector import Detector
from semantics import Ontology, EX

ROOT = Path(__file__).resolve().parent
SEED = [
    ('botella01','Botella reutilizable','Botella',18000,20,'bottle','Para llevar agua al campus'),
    ('taza01','Taza de cerámica','Taza',22000,20,'cup','Una pausa para el café'),
    ('libro01','Libro de apuntes y lectura','Libro',35000,12,'book','Referencia didáctica del catálogo'),
    ('tijera01','Tijera de oficina','Tijera',9000,15,'scissors','Para tus trabajos de papelería'),
    ('banano01','Banano por unidad','Banano',1500,30,'banana','Fruta para una pausa'),
    ('manzana01','Manzana por unidad','Manzana',2500,30,'apple','Fruta para una pausa'),
]
SAMPLES = [
    {'id':'cafe','name':'Cafetería','file':'cafe.jpg','hint':'Prueba principal: taza y otras detecciones.'},
    {'id':'escritorio','name':'Escritorio','file':'escritorio.jpg','hint':'Prueba principal: botella y objetos fuera del catálogo.'},
    {'id':'sin_catalogo','name':'Sin coincidencias de catálogo','file':'sin_catalogo.jpg','hint':'Hay objetos detectados, pero no referencias sugeridas a 0,25.'},
]

def create_app(data_dir=None, ontology_path=None):
    app = Flask(__name__,static_folder=str(ROOT/'static'))
    app.config['MAX_CONTENT_LENGTH'] = 10*1024*1024
    data = Path(data_dir or ROOT/'data'); data.mkdir(parents=True,exist_ok=True)
    uploads = data/'uploads'; uploads.mkdir(exist_ok=True)
    dbpath = data/'tienda.sqlite3'
    ontology = Ontology(ontology_path or ROOT/'ontology/tienda.ttl')
    detector = Detector(ROOT/'models')
    app.extensions.update(ontology=ontology,detector=detector)

    def connect():
        c=sqlite3.connect(dbpath,timeout=10); c.row_factory=sqlite3.Row
        c.execute('PRAGMA foreign_keys=ON'); return c

    with connect() as c:
        c.executescript('''
        CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,name TEXT NOT NULL,class_name TEXT NOT NULL,price INTEGER NOT NULL CHECK(price>0),stock INTEGER NOT NULL CHECK(stock>=0),icon TEXT,description TEXT);
        CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY,name TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY,customer_id INTEGER NOT NULL REFERENCES customers(id),created TEXT NOT NULL,total INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS order_items(id INTEGER PRIMARY KEY,order_id INTEGER NOT NULL REFERENCES orders(id),product_id TEXT NOT NULL REFERENCES products(id),quantity INTEGER NOT NULL CHECK(quantity>0),unit_price INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS images(id TEXT PRIMARY KEY,filename TEXT NOT NULL,width INTEGER,height INTEGER,created TEXT,threshold REAL,elapsed_ms INTEGER);
        CREATE TABLE IF NOT EXISTS detections(id INTEGER PRIMARY KEY,image_id TEXT NOT NULL REFERENCES images(id),label TEXT,confidence REAL,box TEXT,model TEXT);
        CREATE TABLE IF NOT EXISTS suggestions(detection_id INTEGER REFERENCES detections(id),product_id TEXT REFERENCES products(id),PRIMARY KEY(detection_id,product_id));
        ''')
        c.executemany('INSERT OR IGNORE INTO products VALUES(?,?,?,?,?,?,?)',SEED)

    def products():
        with connect() as c:
            return [dict(r) for r in c.execute('SELECT * FROM products ORDER BY rowid')]

    def orders():
        with connect() as c:
            output=[]
            for row in c.execute('SELECT o.*,c.name customer FROM orders o JOIN customers c ON c.id=o.customer_id ORDER BY o.id DESC'):
                d=dict(row)
                d['items']=[dict(x) for x in c.execute('SELECT i.*,p.name,p.class_name FROM order_items i JOIN products p ON p.id=i.product_id WHERE order_id=?',(row['id'],))]
                output.append(d)
            return output

    @app.errorhandler(ValueError)
    def bad_input(error):
        return jsonify(error=str(error)),400

    @app.errorhandler(413)
    def too_large(error):
        return jsonify(error='La imagen debe pesar menos de 10 MB.'),413

    @app.after_request
    def headers(response):
        response.headers['X-Content-Type-Options']='nosniff'
        if request.path.startswith('/api/'):
            response.headers['Cache-Control']='no-store'
        return response

    @app.get('/')
    def home():
        return send_from_directory(ROOT/'templates','index.html')

    @app.get('/api/health')
    def health():
        return jsonify(ok=True,model='YOLO11n ONNX',device='CPU',model_present=(ROOT/'models/yolo11n.onnx').is_file())

    @app.get('/api/products')
    def get_products():
        return jsonify(products=products())

    @app.get('/api/samples')
    def get_samples():
        return jsonify(samples=SAMPLES)

    @app.get('/samples/<name>')
    def sample_image(name):
        return send_from_directory(ROOT/'samples',name)

    @app.get('/media/<name>')
    def saved_image(name):
        return send_from_directory(uploads,name)

    @app.get('/api/orders')
    def get_orders():
        return jsonify(orders=orders())

    @app.post('/api/orders')
    def purchase():
        body=request.get_json(silent=True)
        if not isinstance(body,dict): raise ValueError('Envía un pedido válido.')
        name=body.get('customer','')
        if not isinstance(name,str) or not 1<=len(name.strip())<=60:
            raise ValueError('Escribe un nombre de 1 a 60 caracteres.')
        items=body.get('items')
        if not isinstance(items,list) or not 1<=len(items)<=20:
            raise ValueError('El carrito debe contener de 1 a 20 referencias.')
        quantities={}
        for item in items:
            if not isinstance(item,dict): raise ValueError('El detalle no es válido.')
            pid,qty=item.get('id'),item.get('quantity')
            if not isinstance(pid,str) or type(qty) is not int or not 1<=qty<=99:
                raise ValueError('Cada cantidad debe ser un entero entre 1 y 99.')
            quantities[pid]=quantities.get(pid,0)+qty
        with connect() as c:
            c.execute('BEGIN IMMEDIATE') # Compra y descuento de inventario atómicos.
            chosen=[]
            for pid,qty in quantities.items():
                p=c.execute('SELECT * FROM products WHERE id=?',(pid,)).fetchone()
                if not p: raise ValueError('Una referencia ya no existe.')
                if qty>99 or qty>p['stock']: raise ValueError(f"Existencias insuficientes para {p['name']}.")
                chosen.append((p,qty))
            total=sum(p['price']*qty for p,qty in chosen)
            customer=c.execute('INSERT INTO customers(name) VALUES(?)',(name.strip(),)).lastrowid
            order=c.execute('INSERT INTO orders(customer_id,created,total) VALUES(?,?,?)',(customer,datetime.now(timezone.utc).isoformat(timespec='seconds'),total)).lastrowid
            for p,qty in chosen:
                c.execute('INSERT INTO order_items(order_id,product_id,quantity,unit_price) VALUES(?,?,?,?)',(order,p['id'],qty,p['price']))
                c.execute('UPDATE products SET stock=stock-? WHERE id=?',(qty,p['id']))
        return jsonify(order=next(x for x in orders() if x['id']==order)),201

    @app.post('/api/detect')
    def detect():
        if request.is_json:
            body=request.get_json(silent=True) or {}
            if not isinstance(body,dict): raise ValueError('Selecciona una imagen de ejemplo.')
            sample=next((s for s in SAMPLES if s['id']==body.get('sample')),None)
            if not sample: raise ValueError('La imagen de ejemplo no existe.')
            content=(ROOT/'samples'/sample['file']).read_bytes(); filename=sample['file']
            threshold=body.get('confidence',.25)
        else:
            file=request.files.get('image')
            if not file or not file.filename: raise ValueError('Selecciona una imagen JPG, PNG o WEBP.')
            content=file.read(); filename=Path(file.filename.replace('\\','/')).name[:150]
            threshold=request.form.get('confidence',.25)
        try:
            threshold=float(threshold)
            if not math.isfinite(threshold) or not .05<=threshold<=.95: raise ValueError()
        except (TypeError,ValueError):
            raise ValueError('El umbral debe estar entre 0,05 y 0,95.')
        try:
            image=Image.open(BytesIO(content))
            if image.width*image.height>20_000_000: raise ValueError('Usa una imagen de hasta 20 megapíxeles.')
            image=ImageOps.exif_transpose(image).convert('RGB')
            image.load()
        except (UnidentifiedImageError,OSError,Image.DecompressionBombError):
            raise ValueError('No se pudo leer la imagen. Usa JPG, PNG o WEBP.')
        # Escala fotos muy grandes sin deformarlas. Cajas relativas a esta imagen.
        image.thumbnail((1920,1920))
        try:
            detections,elapsed=detector.detect(image,threshold)
        except Exception:
            app.logger.exception('Falló el motor de detección')
            return jsonify(error='No se pudo ejecutar YOLO. Revisa el modelo y ejecuta DIAGNOSTICO.bat.'),503
        image_id=uuid.uuid4().hex
        image.save(uploads/f'{image_id}.jpg',quality=92)
        catalog=products()
        with connect() as c:
            c.execute('INSERT INTO images VALUES(?,?,?,?,?,?,?)',(image_id,filename,*image.size,datetime.now(timezone.utc).isoformat(),threshold,elapsed))
            for detection in detections:
                classes=ontology.classes_for_label(detection['label'])
                matches=[p for p in catalog if p['class_name'] in classes]
                detid=c.execute('INSERT INTO detections(image_id,label,confidence,box,model) VALUES(?,?,?,?,?)',(image_id,detection['label'],detection['confidence'],json.dumps(detection['box']),'YOLO11n ONNX')).lastrowid
                c.executemany('INSERT INTO suggestions VALUES(?,?)',[(detid,p['id']) for p in matches])
                detection.update(id=detid,classes=classes,products=matches)
        return jsonify(image_id=image_id,image_url=f'/media/{image_id}.jpg',width=image.width,height=image.height,detections=detections,elapsed_ms=elapsed,model='YOLO11n ONNX',confidence=threshold)

    @app.get('/api/ontology')
    def describe():
        return jsonify(ontology.describe())

    @app.get('/api/query')
    def query():
        return jsonify(ontology.query_products(products(),request.args.get('class','Recipiente'),request.args.get('inferred','1')=='1'))

    @app.post('/api/ontology/taza')
    def taza_relation():
        body=request.get_json(silent=True)
        if not isinstance(body,dict) or type(body.get('enabled')) is not bool:
            raise ValueError('Indica si la relación está activada.')
        ontology.set_taza_link(body['enabled'])
        return jsonify(ontology.describe())

    def full_graph():
        graph=ontology.product_graph(products())
        with connect() as c:
            for row in c.execute('SELECT * FROM customers'):
                node=EX[f"cliente{row['id']}"];graph.add((node,RDF.type,EX.Cliente));graph.add((node,EX.nombreCliente,Literal(row['name'])))
            for order in orders():
                node=EX[f"pedido{order['id']}"];graph.add((node,RDF.type,EX.Pedido))
                graph.add((EX[f"cliente{order['customer_id']}"],EX.realizaPedido,node))
                graph.add((node,EX.fechaPedido,Literal(order['created'],datatype=XSD.dateTime)))
                for item in order['items']:
                    detail=EX[f"detalle{item['id']}"];graph.add((detail,RDF.type,EX.DetallePedido))
                    graph.add((node,EX.tieneDetalle,detail));graph.add((detail,EX.correspondeA,EX[item['product_id']]))
                    graph.add((detail,EX.cantidad,Literal(item['quantity'],datatype=XSD.integer)))
                    graph.add((detail,EX.precioUnitarioCompra,Literal(item['unit_price'],datatype=XSD.integer)))
            for row in c.execute('SELECT * FROM images'):
                node=EX['imagen_'+row['id']];graph.add((node,RDF.type,EX.Imagen));graph.add((node,EX.nombreArchivo,Literal(row['filename'])))
            for row in c.execute('SELECT * FROM detections'):
                node=EX[f"deteccion{row['id']}"];graph.add((node,RDF.type,EX.Deteccion))
                graph.add((EX['imagen_'+row['image_id']],EX.contieneDeteccion,node))
                for key,predicate in [('label',EX.etiquetaDetectada),('box',EX.cajaXYXY),('model',EX.modelo)]: graph.add((node,predicate,Literal(row[key])))
                graph.add((node,EX.confianza,Literal(str(row['confidence']),datatype=XSD.decimal)))
            for row in c.execute('SELECT * FROM suggestions'):
                graph.add((EX[f"deteccion{row['detection_id']}"],EX.sugiereProducto,EX[row['product_id']]))
        return graph

    @app.get('/api/export/<kind>')
    def export(kind):
        if kind=='datos.json':
            body={'products':products(),'orders':orders(),'ontology':ontology.describe()}
            with connect() as c:
                for table in ['images','detections','suggestions']:
                    body[table]=[dict(r) for r in c.execute(f'SELECT * FROM {table}')]
            return Response(json.dumps(body,ensure_ascii=False,indent=2),mimetype='application/json',headers={'Content-Disposition':'attachment; filename=datos_tienda.json'})
        formats={'tienda.ttl':('turtle','text/turtle'),'tienda.owl':('xml','application/rdf+xml')}
        if kind not in formats: return jsonify(error='Formato desconocido.'),404
        fmt,mime=formats[kind]
        return Response(full_graph().serialize(format=fmt),mimetype=mime,headers={'Content-Disposition':f'attachment; filename={kind}'})

    return app

if __name__=='__main__':
    import argparse
    from waitress import serve
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8765);args=parser.parse_args()
    print(f'Tienda lista en http://127.0.0.1:{args.port} — Ctrl+C para cerrar.',flush=True)
    serve(create_app(),host='127.0.0.1',port=args.port,threads=4)
