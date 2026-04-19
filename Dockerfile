FROM dunglas/frankenphp:1.3-php8.4-alpine

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
    intl \
    opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN composer install --optimize-autoloader --no-dev --ignore-platform-reqs

# Beri permission ke folder Laravel
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Set Environment Variables default
ENV PORT=8000
ENV APP_ENV=production
ENV APP_DEBUG=false

# Expose port (Railway akan override ini lewat $PORT)
EXPOSE 8000

# Script startup untuk handle migrasi dan server
CMD php artisan migrate --force && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    frankenphp php-server --listen :$PORT
