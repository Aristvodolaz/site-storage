# 🐳 Docker развертывание Storage Web App

## 🚀 Быстрый запуск

### 1. Сборка и запуск
```bash
cd storage-web
docker-compose up -d --build
```

### 2. Доступ к приложению
Откройте в браузере: **http://localhost:3011**

## 📋 Команды Docker

### Сборка образа
```bash
docker build -t storage-web-app .
```

### Запуск контейнера
```bash
docker run -d -p 3011:3011 --name storage-web storage-web-app
```

### Остановка и удаление
```bash
# Остановка
docker-compose down

# Остановка с удалением volumes
docker-compose down -v

# Удаление образа
docker rmi storage-web-app
```

### Логи контейнера
```bash
# Просмотр логов
docker logs storage-web-app

# Следить за логами в реальном времени
docker logs -f storage-web-app
```

## 🔧 Конфигурация

### Порт
- **Внешний порт**: 3011
- **Внутренний порт**: 3011
- **Nginx слушает**: 3011

### Nginx настройки
- SPA роутинг поддерживается
- Gzip сжатие включено
- Кэширование статических файлов (1 год)
- Базовые заголовки безопасности

### Размер образа
- Многоэтапная сборка для минимального размера
- Использует nginx:alpine (~50MB)
- Только production зависимости

## 📦 Структура
```
storage-web/
├── Dockerfile          # Конфигурация Docker
├── nginx.conf          # Настройки Nginx
├── docker-compose.yml  # Оркестрация
├── .dockerignore       # Исключения для Docker
└── dist/              # Собранное приложение
```

## 🛠️ Troubleshooting

### Проверка статуса
```bash
docker ps
```

### Вход в контейнер
```bash
docker exec -it storage-web-app sh
```

### Перезапуск
```bash
docker-compose restart
```

### Полная пересборка
```bash
docker-compose down
docker-compose up -d --build --force-recreate
```

## 🔒 Продакшен рекомендации

### Переменные окружения
Создайте `.env` файл:
```env
VITE_API_BASE_URL=http://your-api-server:port
```

### Обновление приложения
```bash
# 1. Остановка
docker-compose down

# 2. Обновление кода
git pull

# 3. Пересборка и запуск
docker-compose up -d --build
```

### Мониторинг
```bash
# Использование ресурсов
docker stats storage-web-app

# Проверка здоровья
curl http://localhost:3011
```

## ✅ Готово!

Ваше приложение запущено на **порту 3011** и готово к использованию! 🎉
