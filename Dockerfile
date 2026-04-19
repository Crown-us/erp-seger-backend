FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    libzip-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Clear config
RUN php artisan config:clear

# Permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Railway PORT
ENV PORT=8000
EXPOSE 8000

# Gunakan ; agar server tetap naik meskipun migrasi ada kendala (untuk debug)
CMD php artisan migrate --force ; php artisan serve --host=0.0.0.0 --port=$PORT
