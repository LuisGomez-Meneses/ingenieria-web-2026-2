"""Opcional, para el docente. El modelo ONNX ya está listo y no requiere ejecutar esto.
Entorno de exportación: ultralytics==8.3.221 y onnx==1.18.0, con PyTorch CPU.
La aplicación de estudiantes NO instala ni necesita Ultralytics o PyTorch.
"""
from pathlib import Path
from ultralytics import YOLO
if __name__=='__main__':
    folder=Path(__file__).resolve().parent
    model=YOLO(folder/'yolo11n.pt')
    model.export(format='onnx',imgsz=640,opset=17,simplify=False,dynamic=False,device='cpu')
