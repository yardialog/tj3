#!/bin/bash

# Скрипт для проверки API вакансий

echo "=== Проверка API ==="
echo ""

# 1. Проверка статистики админа
echo "1. Статистика (/api/admin/stats):"
curl -s http://localhost:3000/api/admin/stats | head -c 500
echo ""
echo ""

# 2. Вакансии на модерации
echo "2. Вакансии на модерации (/api/admin/vacancies):"
curl -s http://localhost:3000/api/admin/vacancies | head -c 500
echo ""
echo ""

# 3. Работодатели на проверке
echo "3. Работодатели на проверке (/api/admin/employers):"
curl -s http://localhost:3000/api/admin/employers | head -c 500
echo ""
echo ""

echo "=== Для полной проверки авторизуйтесь в браузере ==="
