# Script PowerShell para iniciar o servidor ARKNET
$env:Path = "C:\Users\Estagiarios\AppData\Local\Programs\nodejs;$env:Path"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   ARKNET - SISTEMA DE GESTAO & PORTAL DO CLIENTE" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Node.js:" (node -v) -ForegroundColor Green
Write-Host "npm:    " (npm -v) -ForegroundColor Green
Write-Host ""
Write-Host "A iniciar servidor Next.js..." -ForegroundColor Yellow
Write-Host "Disponivel em: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Pressione CTRL+C para encerrar." -ForegroundColor Gray
Write-Host ""

npm run dev
