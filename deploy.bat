@echo off
echo 🚀 Развертывание Storage Web App...

REM Остановка существующих контейнеров
echo ⏹️  Остановка существующих контейнеров...
docker-compose down

REM Сборка и запуск
echo 🔨 Сборка и запуск приложения...
docker-compose up -d --build

REM Проверка статуса
echo ✅ Проверка статуса...
timeout /t 5 /nobreak > nul
docker ps | findstr storage-web

echo 🎉 Приложение запущено на http://localhost:3011
echo 📊 Для просмотра логов: docker logs -f storage-web-app
pause
