# Script de inicialização para desenvolvimento local (Windows PowerShell)

Write-Host "=== CRM Juridico - Setup ===" -ForegroundColor Cyan

# Backend
Write-Host "`n[1/4] Instalando dependencias do backend..." -ForegroundColor Yellow
Set-Location backend
Copy-Item env.example .env -ErrorAction SilentlyContinue
npm install

Write-Host "`n[2/4] Gerando cliente Prisma..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`n[3/4] Instalando dependencias do frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm install

Set-Location ..

Write-Host "`nSetup concluido!" -ForegroundColor Green
Write-Host "`nProximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure o banco PostgreSQL e ajuste o .env em backend/"
Write-Host "2. Execute: cd backend && npx prisma migrate dev"
Write-Host "3. Execute: cd backend && npx ts-node prisma/seed.ts"
Write-Host "4. Em terminais separados:"
Write-Host "   - Backend: cd backend && npm run start:dev"
Write-Host "   - Frontend: cd frontend && npm run dev"
Write-Host "`nOU use Docker: docker-compose up -d"
Write-Host "`nAcesse: http://localhost:5173"
Write-Host "Swagger: http://localhost:3000/api/docs"
