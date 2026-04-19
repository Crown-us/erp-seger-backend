FROM php:8.4-cli-alpine

# Install system dependencies & PHP extensions
RUN apk add --no-cache \
    bash \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    bcmath \
    gd \
    zip \
    intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN composer install --optimize-autoloader --no-dev --ignore-platform-reqs

# Bersihkan config cache saat build
RUN php artisan config:clear

# Beri permission ke folder Laravel
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Pastikan PORT terbaca
ENV PORT=8000
EXPOSE 8000

# Jalankan migrasi dan server (menggunakan shell form agar variabel $PORT terbaca)
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
