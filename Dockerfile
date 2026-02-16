# Stage 1: Build stage with all dependencies
FROM node:20-alpine AS node-build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source files and build assets
COPY . .
RUN npm run build

# Stage 2: PHP application stage
FROM php:8.2-fpm-alpine AS app

# Install system dependencies
RUN apk add --no-cache \
    libzip-dev \
    zip \
    unzip \
    curl \
    sqlite \
    git \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_sqlite \
    pdo_mysql \
    mbstring \
    xml \
    bcmath \
    curl \
    zip \
    opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files and install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy application code
COPY . .

# Copy built assets from node-build stage
COPY --from=node-build /app/public/build public/build
COPY --from=node-build /app/public/hot public/hot

# Create .env file if it doesn't exist
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Generate application key
RUN php artisan key:generate

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Create SQLite database if needed
RUN touch database/database.sqlite && chown www-data:www-data database/database.sqlite

# Copy PHP configuration
RUN echo "memory_limit=256M" > /usr/local/etc/php/conf.d/memory-limit.ini \
    && echo "upload_max_filesize=64M" > /usr/local/etc/php/conf.d/upload-limit.ini \
    && echo "post_max_size=64M" >> /usr/local/etc/php/conf.d/upload-limit.ini

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD php artisan config:cache && php artisan route:cache && curl -f http://localhost:9000 || exit 1

# Start PHP-FPM
CMD ["php-fpm"]
