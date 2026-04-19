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

# Permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Railway PORT
ENV PORT=8000
EXPOSE 8000

# Script startup: Mapping variabel Railway ke Laravel secara otomatis
CMD sh -c "export DB_HOST=${MYSQLHOST:-$DB_HOST} && \
    export DB_PORT=${MYSQLPORT:-$DB_PORT} && \
    export DB_DATABASE=${MYSQLDATABASE:-$DB_DATABASE} && \
    export DB_USERNAME=${MYSQLUSER:-$DB_USERNAME} && \
    export DB_PASSWORD=${MYSQLPASSWORD:-$DB_PASSWORD} && \
    php artisan config:clear && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=$PORT"
