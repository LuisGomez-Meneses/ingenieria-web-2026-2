"""Pruebas funcionales con SQLite temporal y el modelo ONNX incluido."""
import io
import json
from pathlib import Path
import shutil
import sqlite3
import tempfile
import unittest
from PIL import Image
from rdflib import Graph, RDF
from app import create_app, ROOT
from semantics import EX

class StoreTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.folder=Path(self.tmp.name)
        shutil.copy2(ROOT/'ontology/tienda.ttl',self.folder/'tienda.ttl')
        self.app=create_app(self.folder,self.folder/'tienda.ttl')
        self.app.testing=True
        self.client=self.app.test_client()
        self.ontology=self.app.extensions['ontology']
        self.ontology.set_taza_link(True)

    def tearDown(self):
        self.tmp.cleanup()

    def purchase(self,**overrides):
        payload={'customer':'Ana','items':[{'id':'taza01','quantity':2},{'id':'botella01','quantity':1}]}
        payload.update(overrides)
        return self.client.post('/api/orders',json=payload)

    def test_01_catalog_and_actual_model(self):
        self.assertTrue(self.client.get('/api/health').json['model_present'])
        self.assertEqual(len(self.client.get('/api/products').json['products']),6)
        with self.client.get('/') as response: self.assertEqual(response.status_code,200)

    def test_02_checkout_total_stock_persistence(self):
        response=self.purchase();self.assertEqual(response.status_code,201)
        self.assertEqual(response.json['order']['total'],62000)
        stock={p['id']:p['stock'] for p in self.client.get('/api/products').json['products']}
        self.assertEqual(stock['taza01'],18);self.assertEqual(stock['botella01'],19)
        app2=create_app(self.folder,self.folder/'tienda.ttl')
        self.assertEqual(len(app2.test_client().get('/api/orders').json['orders']),1)

    def test_03_server_ignores_forged_price(self):
        r=self.purchase(items=[{'id':'taza01','quantity':1,'unit_price':1}],total=1)
        self.assertEqual(r.json['order']['total'],22000)

    def test_04_invalid_and_duplicate_quantities(self):
        for qty in [0,-1,1.5,True,'2',100]:
            self.assertEqual(self.purchase(items=[{'id':'taza01','quantity':qty}]).status_code,400)
        r=self.purchase(items=[{'id':'taza01','quantity':12},{'id':'taza01','quantity':12}])
        self.assertEqual(r.status_code,400)
        self.assertEqual(self.client.get('/api/orders').json['orders'],[])

    def test_05_failed_purchase_rolls_back(self):
        r=self.purchase(items=[{'id':'taza01','quantity':1},{'id':'libro01','quantity':99}])
        self.assertEqual(r.status_code,400)
        p=self.client.get('/api/products').json['products']
        self.assertEqual(next(x for x in p if x['id']=='taza01')['stock'],20)

    def test_06_historical_prices(self):
        self.purchase()
        with sqlite3.connect(self.folder/'tienda.sqlite3') as c:
            c.execute("UPDATE products SET price=30000 WHERE id='taza01'")
        self.assertEqual(self.client.get('/api/orders').json['orders'][0]['total'],62000)
        self.assertEqual(self.purchase(items=[{'id':'taza01','quantity':1}]).json['order']['total'],30000)

    def test_07_hierarchy_changes_real_query(self):
        result=self.client.get('/api/query?class=Recipiente').json
        self.assertEqual({p['id'] for p in result['products']},{'taza01','botella01'})
        self.assertEqual(len(self.client.get('/api/query?class=Recipiente&inferred=0').json['products']),0)
        self.assertEqual(self.client.post('/api/ontology/taza',json={'enabled':False}).status_code,200)
        self.assertEqual([p['id'] for p in self.client.get('/api/query?class=Recipiente').json['products']],['botella01'])
        self.assertEqual(len(self.client.get('/api/query?class=Producto').json['products']),6)
        self.client.post('/api/ontology/taza',json={'enabled':True})
        self.assertEqual(len(self.client.get('/api/query?class=Recipiente').json['products']),2)

    def test_08_mapping_from_ontology(self):
        self.assertEqual(self.ontology.classes_for_label('cup'),['Taza'])
        self.assertEqual(self.ontology.classes_for_label('person'),[])
        self.assertEqual(self.ontology.path_to('Taza','Producto'),['Taza','Recipiente','Producto'])

    def test_09_real_yolo_cup_and_bottle(self):
        for sample,label,pid in [('cafe','cup','taza01'),('escritorio','bottle','botella01')]:
            r=self.client.post('/api/detect',json={'sample':sample,'confidence':.25})
            self.assertEqual(r.status_code,200,r.json)
            detected=next(d for d in r.json['detections'] if d['label']==label)
            self.assertGreater(detected['confidence'],.65)
            self.assertEqual(detected['products'][0]['id'],pid)
            x,y,x2,y2=detected['box'];self.assertLess(x,x2);self.assertLess(y,y2)
            with self.client.get(r.json['image_url']) as response: self.assertEqual(response.status_code,200)

    def test_10_detected_but_not_in_catalog(self):
        r=self.client.post('/api/detect',json={'sample':'sin_catalogo','confidence':.25})
        self.assertEqual(r.status_code,200)
        self.assertGreater(len(r.json['detections']),0)
        self.assertTrue(all(not d['products'] for d in r.json['detections']))

    def test_11_upload_blank_and_invalid_image(self):
        output=io.BytesIO();Image.new('RGB',(640,480),'white').save(output,format='PNG');output.seek(0)
        r=self.client.post('/api/detect',data={'image':(output,'blanco.png'),'confidence':'.25'})
        self.assertEqual(r.status_code,200);self.assertEqual(r.json['detections'],[])
        bad=self.client.post('/api/detect',data={'image':(io.BytesIO(b'not an image'),'bad.jpg')})
        self.assertEqual(bad.status_code,400)

    def test_12_export_owl_has_real_individuals(self):
        self.purchase();self.client.post('/api/detect',json={'sample':'cafe'})
        for fmt,path in [('turtle','tienda.ttl'),('xml','tienda.owl')]:
            r=self.client.get('/api/export/'+path);self.assertEqual(r.status_code,200)
            g=Graph().parse(data=r.data,format=fmt)
            self.assertIn((EX.taza01,RDF.type,EX.Taza),g)
            self.assertIn((EX.cliente1,EX.realizaPedido,EX.pedido1),g)
            self.assertIn((EX.deteccion1,EX.sugiereProducto,EX.taza01),g)
            self.assertIn((EX.pedido1,EX.tieneDetalle,EX.detalle1),g)

    def test_13_bad_requests(self):
        self.assertEqual(self.client.get('/api/query?class=NoExiste').status_code,400)
        self.assertEqual(self.client.post('/api/ontology/taza',json={'enabled':'false'}).status_code,400)
        self.assertEqual(self.client.post('/api/detect',json={'sample':'cafe','confidence':'NaN'}).status_code,400)
        self.assertEqual(self.client.post('/api/detect',json={'sample':'../../x'}).status_code,400)
        self.assertEqual(self.purchase(customer='').status_code,400)
        self.assertEqual(self.purchase(items=[]).status_code,400)

if __name__=='__main__':
    unittest.main(verbosity=2)
