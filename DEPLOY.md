# Инструкция по установке TeenJob на Ubuntu Server

## Требования к серверу
- Ubuntu 20.04 / 22.04 / 24.04
- Минимум 1 GB RAM
- 10 GB свободного места

---

## 1. Подготовка сервера

### Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### Установка базовых пакетов
```bash
sudo apt install -y curl wget git build-essential
```

---

## 2. Установка Node.js (для совместимости)

```bash
# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка
node --version
npm --version
```

---

## 3. Установка Bun.js (основной runtime)

```bash
# Установка Bun
curl -fsSL https://bun.sh/install | bash

# Применить изменения в текущей сессии
source ~/.bashrc

# Проверка
bun --version
```

---

## 4. Установка SQLite

```bash
sudo apt install -y sqlite3

# Проверка
sqlite3 --version
```

---

## 5. Клонирование проекта

```bash
# Создать директорию для проектов
mkdir -p /var/www
cd /var/www

# Клонировать репозиторий
git clone https://github.com/yardialog/tj3.git teenjob
cd teenjob
```

---

## 6. Установка зависимостей

```bash
# Установка основных зависимостей
bun install

# Установка зависимостей чат-сервиса
cd mini-services/chat-service
bun install
cd ../../
```

---

## 7. Настройка базы данных

```bash
# Создать файл окружения
cat > .env << 'EOF'
DATABASE_URL="file:./db/teenjob.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_APP_URL="http://your-domain.com"
EOF

# Применить схему базы данных
bun run db:push

# Заполнить тестовыми данными
bun run db:seed
```

---

## 8. Сборка проекта (опционально, для продакшена)

```bash
bun run build
```

---

## 9. Установка PM2 (менеджер процессов)

```bash
# Установка PM2 глобально
sudo npm install -g pm2

# Создать конфигурацию PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'teenjob-web',
      script: 'bun',
      args: 'run dev',
      cwd: '/var/www/teenjob',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'teenjob-chat',
      script: 'index.ts',
      cwd: '/var/www/teenjob/mini-services/chat-service',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      }
    }
  ]
};
EOF

# Запуск через PM2
pm2 start ecosystem.config.js

# Сохранить конфигурацию PM2
pm2 save

# Настроить автозапуск
pm2 startup
# Выполнить команду, которую выведет pm2 startup
```

---

## 10. Настройка Nginx (обратный прокси)

### Установка Nginx
```bash
sudo apt install -y nginx
```

### Конфигурация сайта
```bash
sudo nano /etc/nginx/sites-available/teenjob
```

Вставить:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Основной сайт
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket для чата
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Статические файлы
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60d;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
```

### Активация сайта
```bash
# Активировать конфигурацию
sudo ln -s /etc/nginx/sites-available/teenjob /etc/nginx/sites-enabled/

# Удалить default (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверить конфигурацию
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx
```

---

## 11. Настройка SSL (HTTPS) через Let's Encrypt

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление уже настроено, проверка:
sudo certbot renew --dry-run
```

---

## 12. Настройка фаервола (UFW)

```bash
# Разрешить SSH
sudo ufw allow ssh

# Разрешить HTTP и HTTPS
sudo ufw allow 'Nginx Full'

# Включить фаервол
sudo ufw enable

# Проверить статус
sudo ufw status
```

---

## 13. Полезные команды

### Управление PM2
```bash
pm2 status              # Статус всех процессов
pm2 logs                # Логи всех процессов
pm2 logs teenjob-web    # Логи сайта
pm2 logs teenjob-chat   # Логи чата
pm2 restart all         # Перезапуск всех
pm2 restart teenjob-web # Перезапуск сайта
pm2 stop all            # Остановить все
pm2 monit               # Мониторинг ресурсов
```

### Управление Nginx
```bash
sudo systemctl status nginx   # Статус
sudo systemctl restart nginx  # Перезапуск
sudo systemctl reload nginx   # Перезагрузка конфига
sudo nginx -t                 # Проверка конфигурации
```

### Обновление проекта
```bash
cd /var/www/teenjob
git pull
bun install
bun run db:push
pm2 restart all
```

---

## 14. Проверка работоспособности

```bash
# Проверить, что процессы запущены
pm2 status

# Проверить порты
sudo netstat -tlnp | grep -E "3000|3003|80|443"

# Проверить логи на ошибки
pm2 logs --lines 50
```

---

## Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Админ | admin@teenjob.ru | Admin123 |
| Подросток | ivan@example.com | Teen1234 |
| Работодатель | hr@techstart.ru | Employer123 |

---

## Структура портов

| Сервис | Порт | Описание |
|--------|------|----------|
| Next.js | 3000 | Основной сайт |
| Chat Service | 3003 | WebSocket чат |
| Nginx | 80, 443 | Обратный прокси |

---

## Минимальные системные требования

| Параметр | Значение |
|----------|----------|
| RAM | 1 GB (рекомендуется 2 GB) |
| CPU | 1 ядро |
| Диск | 10 GB |
| ОС | Ubuntu 20.04+ |

---

## Возможные проблемы

### 1. Ошибка "Cannot find module"
```bash
bun install
```

### 2. Ошибка базы данных
```bash
bun run db:push
```

### 3. Порт занят
```bash
# Найти процесс на порту
sudo lsof -i :3000
# Убить процесс
sudo kill -9 <PID>
```

### 4. PM2 не запускается
```bash
pm2 delete all
pm2 start ecosystem.config.js
```
