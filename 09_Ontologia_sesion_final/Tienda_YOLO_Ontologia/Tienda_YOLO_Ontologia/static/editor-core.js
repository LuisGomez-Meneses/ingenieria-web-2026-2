(function(root){const CLASSES=["Producto", "Recipiente", "Papeleria", "Fruta", "Botella", "Taza", "Libro", "Tijera", "Banano", "Manzana", "Imagen", "Deteccion", "Cliente", "Pedido", "DetallePedido"];  function template(){return {version:1,nodes:CLASSES.map((label,i)=>({id:'n'+i,label,kind:'clase',x:60+(i%4)*285,y:80+Math.floor(i/4)*160})),edges:[]};}
  function validateDiagram(d){
    if(!d||d.version!==1||!Array.isArray(d.nodes)||!Array.isArray(d.edges)||d.nodes.length>100||d.edges.length>200)throw Error('El archivo no es un diagrama válido de esta aplicación.');
    const ids=new Set();for(const n of d.nodes){if(!n||typeof n.id!=='string'||ids.has(n.id)||typeof n.label!=='string'||n.label.length>90||!['clase','individuo','literal','tipo'].includes(n.kind)||!Number.isFinite(n.x)||!Number.isFinite(n.y)||n.x<0||n.x>1150||n.y<0||n.y>820)throw Error('Revisa los nodos del diagrama.');ids.add(n.id);}
    for(const e of d.edges)if(!e||!ids.has(e.from)||!ids.has(e.to)||typeof e.label!=='string'||e.label.length>60||!['subclase','instancia','objeto','datos'].includes(e.kind))throw Error('Revisa las conexiones del diagrama.');
    return d;
  }
function nextId(prefix,ids){let n=1;while(ids.includes(prefix+n))n++;return prefix+n;}root.WebLab={template,validateDiagram,nextId};})(window);