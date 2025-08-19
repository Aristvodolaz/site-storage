# 🚀 PM2 развертывание Storage Web App

## 📋 Требования

- Node.js 18+ 
- PM2 (установить: `npm install -g pm2`)

## ⚡ Быстрый запуск

### Вариант 1: Автоматический скрипт
```bash
# Linux/Mac
chmod +x deploy-pm2.sh
./deploy-pm2.sh

# Windows
deploy-pm2.bat
```

### Вариант 2: Ручные команды
```bash
# 1. Установка зависимостей
npm install

# 2. Сборка приложения
npm run build

# 3. Запуск через PM2
pm2 start ecosystem.config.js
```

## 📋 Основные команды PM2

### Управление приложением
```bash
# Запуск
pm2 start ecosystem.config.js

# Остановка
pm2 stop storage-web-app

# Перезапуск
pm2 restart storage-web-app

# Удаление
pm2 delete storage-web-app

# Статус
pm2 status

# Логи
pm2 logs storage-web-app

# Мониторинг в реальном времени
pm2 monit
```

### NPM скрипты
```bash
# Запуск
npm run pm2:start

# Остановка
npm run pm2:stop

# Перезапуск
npm run pm2:restart

# Удаление
npm run pm2:delete

# Просмотр логов
npm run pm2:logs

# Статус
npm run pm2:status

# Полное развертывание
npm run deploy
```

## 🔧 Конфигурация

### Файлы
- `ecosystem.config.js` - Конфигурация PM2
- `deploy-pm2.sh` - Скрипт развертывания (Linux/Mac)
- `deploy-pm2.bat` - Скрипт развертывания (Windows)

### Настройки
- **Порт**: 3011
- **Хост**: 0.0.0.0 (доступ извне)
- **Автоперезапуск**: включен
- **Логи**: `./logs/`
- **Память**: максимум 1GB

## 📊 Мониторинг

### Просмотр логов
```bash
# Все логи
pm2 logs storage-web-app

# Только ошибки
pm2 logs storage-web-app --err

# Только вывод
pm2 logs storage-web-app --out

# Следить за логами
pm2 logs storage-web-app -f
```

### Статистика
```bash
# Статус процессов
pm2 status

# Мониторинг в реальном времени
pm2 monit

# Информация о процессе
pm2 show storage-web-app
```

## 🔄 Обновление приложения

### Автоматическое обновление
```bash
npm run deploy
```

### Ручное обновление
```bash
# 1. Остановка
pm2 stop storage-web-app

# 2. Обновление кода
git pull

# 3. Установка зависимостей
npm install

# 4. Сборка
npm run build

# 5. Запуск
pm2 start ecosystem.config.js
```

## 🛠️ Troubleshooting

### Проверка порта
```bash
# Проверка занятости порта
netstat -tulpn | grep 3011

# Или
lsof -i :3011
```

### Перезапуск PM2
```bash
# Перезапуск всех процессов
pm2 restart all

# Перезапуск PM2 демона
pm2 kill
pm2 start ecosystem.config.js
```

### Очистка логов
```bash
# Очистка всех логов
pm2 flush

# Очистка логов конкретного приложения
pm2 flush storage-web-app
```

## 🌐 Доступ к приложению

После запуска приложение будет доступно по адресу:
**http://localhost:3011**

## ✅ Готово!

Ваше приложение запущено через PM2 и готово к использованию! 🎉

### Проверка работы
```bash
curl http://localhost:3011
```
