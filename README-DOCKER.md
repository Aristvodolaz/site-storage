# 🐳 Storage Web App - Docker развертывание

## ⚡ Быстрый запуск

### Вариант 1: Docker Compose (рекомендуется)
```bash
cd storage-web
docker-compose up -d --build
```

### Вариант 2: Скрипты
```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

### Вариант 3: NPM скрипты
```bash
npm run docker:deploy
```

## 🌐 Доступ к приложению
**http://localhost:3011**

## 📋 Основные команды

### Управление контейнером
```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Просмотр логов
docker logs -f storage-web-app

# Статус контейнера
docker ps
```

### Обновление приложения
```bash
# 1. Остановка
docker-compose down

# 2. Пересборка и запуск
docker-compose up -d --build
```

## 🔧 Конфигурация

### Файлы Docker
- `Dockerfile` - Конфигурация образа
- `nginx.conf` - Настройки Nginx (порт 3011)
- `docker-compose.yml` - Оркестрация
- `.dockerignore` - Исключения для сборки

### Особенности
- ✅ Многоэтапная сборка (минимальный размер)
- ✅ Nginx на Alpine Linux
- ✅ Порт 3011
- ✅ SPA роутинг
- ✅ Gzip сжатие
- ✅ Кэширование статики
- ✅ Базовая безопасность

## 🚀 Готово!

Ваше веб-приложение запущено в Docker на порту **3011** и готово к использованию в корпоративной сети! 🎉

### Проверка работы
```bash
curl http://localhost:3011
```
