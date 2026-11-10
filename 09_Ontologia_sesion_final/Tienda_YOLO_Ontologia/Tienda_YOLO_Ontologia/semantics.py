"""La ontología gobierna los mapeos YOLO y las consultas por superclase.

Se ejecutan rutas SPARQL rdfs:subClassOf*, no un razonador OWL completo.
"""
from collections import deque
from threading import RLock
from pathlib import Path
from rdflib import Graph, Namespace, RDF, RDFS, OWL, Literal, XSD

EX = Namespace('https://example.org/tienda#')

def local(uri):
    return str(uri).rsplit('#', 1)[-1]

class Ontology:
    def __init__(self, path):
        self.path = Path(path)
        self.lock = RLock()
        self.graph = Graph().parse(self.path, format='turtle')

    def copy(self):
        with self.lock:
            graph = Graph()
            for prefix, uri in self.graph.namespaces():
                graph.bind(prefix, uri)
            for triple in self.graph:
                graph.add(triple)
            return graph

    def describe(self):
        g = self.copy()
        return {
            'classes': sorted(local(c) for c in g.subjects(RDF.type, OWL.Class)),
            'edges': sorted([{'child': local(a), 'parent': local(b)} for a,b in g.subject_objects(RDFS.subClassOf)], key=lambda e:e['child']),
            'mappings': sorted([{'label':str(v), 'class':local(c)} for c,v in g.subject_objects(EX.etiquetaYOLO)], key=lambda e:e['class']),
            'properties': sorted([{'name':local(p), 'kind':kind, 'domain':local(g.value(p,RDFS.domain)), 'range':local(g.value(p,RDFS.range))} for typ,kind in [(OWL.ObjectProperty,'objeto'),(OWL.DatatypeProperty,'dato')] for p in g.subjects(RDF.type,typ)], key=lambda x:(x['kind'],x['name'])),
            'taza_link': (EX.Taza, RDFS.subClassOf, EX.Recipiente) in g
        }

    def classes_for_label(self, label):
        return sorted(local(c) for c in self.copy().subjects(EX.etiquetaYOLO, Literal(label)))

    def set_taza_link(self, enabled):
        with self.lock:
            edge = (EX.Taza, RDFS.subClassOf, EX.Recipiente)
            # Mantiene Taza bajo Producto para aislar el efecto en Recipiente.
            alternate = (EX.Taza, RDFS.subClassOf, EX.Producto)
            g = self.copy()
            g.remove(alternate if enabled else edge)
            g.add(edge if enabled else alternate)
            tmp = self.path.with_suffix('.tmp')
            g.serialize(tmp, format='turtle')
            tmp.replace(self.path)
            self.graph = g

    def path_to(self, child, parent):
        g = self.copy(); queue = deque([[child]]); seen = set()
        while queue:
            path = queue.popleft(); current = path[-1]
            if current == parent:
                return path
            if current in seen:
                continue
            seen.add(current)
            for p in sorted(g.objects(EX[current], RDFS.subClassOf),key=str):
                queue.append(path+[local(p)])
        return []

    def product_graph(self, products):
        g = self.copy()
        for p in products:
            node = EX[p['id']]
            g.add((node,RDF.type,EX[p['class_name']]))
            g.add((node,EX.nombreProducto,Literal(p['name'])))
            g.add((node,EX.precioCatalogo,Literal(p['price'],datatype=XSD.integer)))
            g.add((node,EX.existencias,Literal(p['stock'],datatype=XSD.integer)))
        return g

    def query_products(self, products, class_name, inferred=True):
        if class_name not in self.describe()['classes']:
            raise ValueError('La clase no existe en la ontología.')
        relation = f'?tipo rdfs:subClassOf* :{class_name} .' if inferred else f'FILTER (?tipo = :{class_name})'
        query = '''PREFIX : <https://example.org/tienda#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?producto ?nombre ?tipo WHERE {
  ?producto rdf:type ?tipo ; :nombreProducto ?nombre .
  '''+relation+'''
} ORDER BY ?nombre'''
        # class_name se valida contra las clases del grafo antes de interpolar.
        graph = self.product_graph(products)
        ids = {local(row.producto) for row in graph.query(query)}
        matches = [dict(p, path=self.path_to(p['class_name'],class_name)) for p in products if p['id'] in ids]
        return {'class':class_name,'inferred':inferred,'products':matches,'sparql':query}
