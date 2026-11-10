"""Inferencia real YOLO11n ONNX en CPU. Sin PyTorch en el equipo del alumno."""
from pathlib import Path
import json
from threading import Lock
from time import perf_counter
import cv2
import numpy as np
import onnxruntime as ort

class Detector:
    def __init__(self, model_dir):
        self.folder = Path(model_dir)
        self.names = json.loads((self.folder/'classes.json').read_text(encoding='utf-8'))
        self.session = None
        self.lock = Lock()

    def _load(self):
        if self.session is None:
            options = ort.SessionOptions()
            options.intra_op_num_threads = 2
            options.inter_op_num_threads = 1
            self.session = ort.InferenceSession(str(self.folder/'yolo11n.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
        return self.session

    def detect(self, image, confidence=.25):
        # image es PIL RGB ya orientada; letterbox 640x640, como en exportación.
        width, height = image.size
        ratio = min(640/width,640/height)
        nw, nh = round(width*ratio), round(height*ratio)
        pixels = cv2.resize(np.asarray(image), (nw,nh), interpolation=cv2.INTER_LINEAR)
        left, top = round((640-nw)/2-.1), round((640-nh)/2-.1)
        canvas = np.full((640,640,3),114,dtype=np.uint8)
        canvas[top:top+nh,left:left+nw] = pixels
        tensor = np.ascontiguousarray(canvas.transpose(2,0,1)[None],dtype=np.float32)/255.0
        start = perf_counter()
        with self.lock:
            session = self._load()
            output = session.run(None,{session.get_inputs()[0].name:tensor})[0][0].T
        # YOLO11 detect sin NMS: [1,84,8400] = cx,cy,w,h + 80 scores.
        scores = output[:,4:].max(axis=1)
        rows = output[scores>=confidence]
        if len(rows)==0:
            return [], round((perf_counter()-start)*1000)
        class_ids = rows[:,4:].argmax(axis=1)
        scores = rows[:,4:].max(axis=1)
        boxes = rows[:,:4].copy()
        boxes[:,:2] -= boxes[:,2:]/2 # xywh para NMSBoxes
        keep = []
        # NMS por clase: objetos de distintas categorías no se suprimen entre sí.
        for class_id in np.unique(class_ids):
            indices = np.flatnonzero(class_ids==class_id)
            chosen = cv2.dnn.NMSBoxes(boxes[indices].tolist(),scores[indices].tolist(),confidence,.45)
            keep.extend(indices[np.asarray(chosen).reshape(-1)].tolist())
        result=[]
        for i in sorted(keep,key=lambda j:float(scores[j]),reverse=True)[:100]:
            x,y,w,h=boxes[i]
            coords=[(x-left)/ratio,(y-top)/ratio,(x+w-left)/ratio,(y+h-top)/ratio]
            coords=[round(float(np.clip(v,0,limit)),1) for v,limit in zip(coords,[width,height,width,height])]
            result.append({'label':self.names[str(int(class_ids[i]))], 'class_id':int(class_ids[i]), 'confidence':round(float(scores[i]),4), 'box':coords})
        return result, round((perf_counter()-start)*1000)
