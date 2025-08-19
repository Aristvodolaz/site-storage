@echo off
echo 🚀 Развертывание Storage Web App через PM2...

REM Остановка существующего процесса
echo ⏹️  Остановка существующего процесса...
pm2 stop storage-web-app 2>nul
pm2 delete storage-web-app 2>nul

REM Установка зависимостей
echo 📦 Установка зависимостей...
npm install

REM Сборка приложения
echo 🔨 Сборка приложения...
npm run build

REM Запуск через PM2
echo ▶️  Запуск через PM2...
pm2 start ecosystem.config.js

REM Проверка статуса
echo ✅ Проверка статуса...
timeout /t 3 /nobreak > nul
pm2 status

echo 🎉 Приложение запущено на http://localhost:3011
echo 📊 Для просмотра логов: pm2 logs storage-web-app
echo 🔄 Для перезапуска: pm2 restart storage-web-app
pause
