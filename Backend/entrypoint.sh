#!/bin/sh

echo "🔄 Ожидание базы данных..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "✅ База данных запущена."

echo "🔄 Удаление старых миграций (если есть)..."
rm -rf checker/migrations
echo "✅ Старые миграции удалены."

echo "🔄 Очистка истории миграций для приложения checker..."
python manage.py migrate --fake checker zero
echo "✅ История миграций очищена."

echo "🔄 Создание новых миграций..."
python manage.py makemigrations checker
echo "✅ Миграции созданы."

echo "🔄 Применение миграций..."
python manage.py migrate checker
echo "✅ Миграции применены."

echo "🚀 Запуск сервера..."
exec "$@"