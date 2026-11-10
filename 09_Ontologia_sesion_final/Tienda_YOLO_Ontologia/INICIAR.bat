@echo off
setlocal
cd /d "%~dp0"
chcp 65001 >nul
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" iniciar.py %*
  goto fin
)
py -3.12 -c "import sys" >nul 2>nul
if not errorlevel 1 (
  py -3.12 iniciar.py %*
  goto fin
)
py -3.11 -c "import sys" >nul 2>nul
if not errorlevel 1 (
  py -3.11 iniciar.py %*
  goto fin
)
py -3.10 -c "import sys" >nul 2>nul
if not errorlevel 1 (
  py -3.10 iniciar.py %*
  goto fin
)
python -c "import sys" >nul 2>nul
if not errorlevel 1 (
  python iniciar.py %*
  goto fin
)
echo No se encontro Python. Instala Python 3.12 de 64 bits y vuelve a abrir este archivo.
echo Lee LEEME_PRIMERO.html para ver el enlace y los pasos.
:fin
pause
endlocal
