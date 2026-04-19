FROM php:8.4-cli-alpine

# Install system dependencies & PHP extensions
RUN apk add --no-cache \
    bash git curl libpng-dev libzip-dev icu-dev oniguruma-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring bcmath gd zip intl

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Permissions (Simple & Fast)
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Port dinamis Railway
ENV PORT=8000
EXPOSE 8000

# Script startup: Migrasi dulu, baru nyalain server
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
