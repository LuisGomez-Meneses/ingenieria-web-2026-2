"""Instalador e iniciador local. No requiere activar entornos en PowerShell."""
from pathlib import Path
import argparse
import hashlib
import os
import platform
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import venv
import webbrowser

ROOT=Path(__file__).resolve().parent

def main():
    parser=argparse.ArgumentParser(description='Tienda YOLO para Ingeniería Web')
    parser.add_argument('--port',type=int,default=8765)
    parser.add_argument('--sin-navegador',action='store_true')
    parser.add_argument('--diagnostico',action='store_true')
    args=parser.parse_args()
    if not (3,10)<=sys.version_info[:2]<=(3,12) or platform.architecture()[0]!='64bit':
        raise RuntimeError('Usa Python 3.10, 3.11 o 3.12 de 64 bits. Se recomienda 3.12.')
    if not (ROOT/'models/yolo11n.onnx').is_file():
        raise RuntimeError('Falta models/yolo11n.onnx. Extrae TODO el archivo ZIP.')
    env=ROOT/'.venv'; python=env/('Scripts/python.exe' if os.name=='nt' else 'bin/python')
    if not python.exists():
        print('Preparando el entorno local…',flush=True)
        venv.EnvBuilder(with_pip=True).create(env)
    requirements=ROOT/'requirements.txt'
    digest=hashlib.sha256(requirements.read_bytes()).hexdigest()
    marker=env/'.dependencias_listas'
    ready=marker.exists() and marker.read_text()==digest
    if ready:
        check=subprocess.run([str(python),'-c','import flask, waitress, numpy, PIL, cv2, onnxruntime, rdflib'],capture_output=True)
        ready=check.returncode==0
    if not ready:
        print('Instalando dependencias. Esta primera ejecución necesita internet y puede tardar varios minutos.',flush=True)
        subprocess.run([str(python),'-m','pip','install','--disable-pip-version-check','-r',str(requirements)],cwd=ROOT,check=True)
        marker.write_text(digest)
    if args.diagnostico:
        print('Comprobando YOLO, ontología, pedidos y persistencia con datos temporales…',flush=True)
        return subprocess.run([str(python),'-m','unittest','discover','-s','tests','-v'],cwd=ROOT).returncode
    if not 1024<=args.port<=65535:
        raise RuntimeError('El puerto debe estar entre 1024 y 65535.')
    try:
        with socket.socket() as s:
            s.bind(('127.0.0.1',args.port))
    except OSError:
        raise RuntimeError(f'El puerto {args.port} está ocupado. Cierra la ejecución anterior o usa: python iniciar.py --port 8766')
    url=f'http://127.0.0.1:{args.port}'
    if not args.sin_navegador:
        def open_browser():
            for _ in range(40):
                try:
                    with urllib.request.urlopen(url+'/api/health',timeout=1) as r:
                        if r.status==200:
                            webbrowser.open(url);return
                except Exception:
                    time.sleep(.5)
        threading.Thread(target=open_browser,daemon=True).start()
    print('\nAbre '+url+'\nDeja esta ventana abierta. Para detener: Ctrl+C.\n',flush=True)
    return subprocess.run([str(python),str(ROOT/'app.py'),'--port',str(args.port)],cwd=ROOT).returncode

if __name__=='__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print('\nTienda detenida. Los pedidos están guardados.')
    except Exception as error:
        print('\nNo se pudo iniciar: '+str(error))
        print('Consulta LEEME_PRIMERO.html. No borres la carpeta data para corregir una instalación.')
        sys.exit(1)
