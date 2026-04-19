FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip git curl libzip-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Buat file database jika pakai SQLite dan pastikan folder storage lengkap
RUN mkdir -p database storage/framework/sessions storage/framework/views storage/framework/cache \
    && touch database/database.sqlite \
    && chown -R www-data:www-data /app \
    && chmod -R 775 /app/storage /app/bootstrap/cache /app/database

# Railway PORT & Overwrite log ke stderr agar kelihatan di dashboard
ENV PORT=8080
ENV LOG_CHANNEL=stderr 
EXPOSE 8080

# Script startup dengan logging
CMD echo "--- STEP 1: Clear Cache ---" && php artisan config:clear && \
    echo "--- STEP 2: Jalankan Migrasi ---" && \
    php artisan migrate --force && \
    echo "--- STEP 3: Start Server on Port $PORT ---" && \
    php artisan serve --host=0.0.0.0 --port=$PORT
