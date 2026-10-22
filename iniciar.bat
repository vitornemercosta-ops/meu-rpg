@echo off
echo Iniciando BACK-END...
start cmd /k "cd backend && python app.py"
timeout /t 3 /nobreak >nul

echo Iniciando FRONT-END...
start cmd /k "cd frontend && python -m http.server 5500"
timeout /t 2 /nobreak >nul

echo Abrindo navegador...
start http://127.0.0.1:5500