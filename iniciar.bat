@echo off
title ARKNET - Servidor de Desenvolvimento
echo ======================================================
echo    ARKNET - SISTEMA DE GESTAO E PORTAL DO CLIENTE
echo ======================================================
echo.

set "PATH=C:\Users\Estagiarios\AppData\Local\Programs\nodejs;%PATH%"

echo A verificar Node.js e npm...
node -v
npm -v
echo.
echo A iniciar o servidor Next.js em http://localhost:3000 ...
echo Pressione CTRL+C para parar o servidor.
echo.

npm run dev
