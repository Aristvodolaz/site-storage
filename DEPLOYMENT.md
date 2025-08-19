# 🚀 Руководство по развертыванию Storage Web App

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка API
Отредактируйте файл `src/services/api.ts` и укажите правильный адрес вашего API:
```typescript
const API_BASE_URL = 'http://your-api-server:port';
```

### 3. Запуск в режиме разработки
```bash
npm run dev
```
Приложение будет доступно по адресу: http://localhost:3000

## 🏭 Продакшен развертывание

### Сборка приложения
```bash
npm run build
```

Результат сборки будет в папке `dist/`

### Опции развертывания

#### 1. Статический хостинг (Netlify, Vercel, GitHub Pages)

**Netlify:**
1. Подключите ваш Git репозиторий к Netlify
2. Установите команды сборки:
   - Build command: `npm run build`
   - Publish directory: `dist`

**Vercel:**
1. Установите Vercel CLI: `npm i -g vercel`
2. Запустите: `vercel --prod`

**GitHub Pages:**
1. Установите пакет: `npm install --save-dev gh-pages`
2. Добавьте в package.json:
```json
{
  "homepage": "https://yourusername.github.io/repository-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```
3. Запустите: `npm run deploy`

#### 2. Docker развертывание

Создайте `Dockerfile`:
```dockerfile
# Многоэтапная сборка для оптимизации размера
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Продакшен образ с nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Настройка nginx для SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Создайте `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Обработка SPA роутинга
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статических ресурсов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Сжатие
    gzip on;
    gzip_vary on;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

Сборка и запуск Docker:
```bash
docker build -t storage-web-app .
docker run -p 80:80 storage-web-app
```

#### 3. Apache развертывание

Создайте файл `.htaccess` в папке `dist/`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]

# Кэширование
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## ⚙️ Конфигурация окружения

### Переменные окружения
Создайте файл `.env` для локальной разработки:
```env
VITE_API_BASE_URL=http://localhost:3006
VITE_APP_TITLE=Storage Management System
VITE_REFRESH_INTERVAL=300000
```

### Использование в коде:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.171.12.36:3006';
```

## 🔧 Оптимизация производительности

### 1. Анализ размера бандла
```bash
npm run build
npx vite-bundle-analyzer dist/assets/*.js
```

### 2. Предзагрузка критических ресурсов
В `index.html`:
```html
<link rel="preload" href="/fonts/Roboto-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

### 3. Service Worker для кэширования
Установите Vite PWA плагин:
```bash
npm install -D vite-plugin-pwa
```

## 🔒 Безопасность

### 1. Настройка CSP заголовков
Для nginx добавьте:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:; connect-src 'self' your-api-domain.com;";
```

### 2. HTTPS настройка
Всегда используйте HTTPS в продакшене. Для Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com
```

## 📊 Мониторинг

### 1. Логирование ошибок
Интеграция с Sentry:
```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
});
```

### 2. Аналитика производительности
Используйте Web Vitals:
```bash
npm install web-vitals
```

## 🚨 Проблемы и решения

### Проблема: CORS ошибки
**Решение:** Настройте CORS на бэкенде или используйте прокси в Vite:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://your-backend-server',
        changeOrigin: true,
      },
    },
  },
});
```

### Проблема: Большой размер бандла
**Решение:** Используйте динамические импорты:
```typescript
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

### Проблема: Медленная загрузка таблицы
**Решение:** Уже реализована виртуализация в DataGrid, но можно добавить дополнительную пагинацию на бэкенде.

## 📈 Масштабирование

### 1. CDN настройка
Используйте CDN для статических ресурсов:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### 2. Кэширование API
Настройте Redis или Memcached на бэкенде для кэширования частых запросов.

### 3. Load Balancing
Для высоких нагрузок используйте nginx как load balancer:
```nginx
upstream storage_app {
    server app1:80;
    server app2:80;
    server app3:80;
}

server {
    listen 80;
    location / {
        proxy_pass http://storage_app;
    }
}
```

---

**🎉 Готово! Ваше приложение готово к продакшену.**
