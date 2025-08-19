#!/bin/bash

echo "🚀 Развертывание Storage Web App..."

# Остановка существующих контейнеров
echo "⏹️  Остановка существующих контейнеров..."
docker-compose down

# Сборка и запуск
echo "🔨 Сборка и запуск приложения..."
docker-compose up -d --build

# Проверка статуса
echo "✅ Проверка статуса..."
sleep 5
docker ps | grep storage-web

echo "🎉 Приложение запущено на http://localhost:3011"
echo "📊 Для просмотра логов: docker logs -f storage-web-app"
