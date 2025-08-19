#!/bin/bash

echo "🚀 Развертывание Storage Web App через PM2..."

# Остановка существующего процесса
echo "⏹️  Остановка существующего процесса..."
pm2 stop storage-web-app 2>/dev/null || true
pm2 delete storage-web-app 2>/dev/null || true

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

# Сборка приложения
echo "🔨 Сборка приложения..."
npm run build

# Запуск через PM2
echo "▶️  Запуск через PM2..."
pm2 start ecosystem.config.js

# Проверка статуса
echo "✅ Проверка статуса..."
sleep 3
pm2 status

echo "🎉 Приложение запущено на http://localhost:3011"
echo "📊 Для просмотра логов: pm2 logs storage-web-app"
echo "🔄 Для перезапуска: pm2 restart storage-web-app"
