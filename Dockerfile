# Stage 1: Build React assets
FROM node:20-alpine AS node-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: PHP & Nginx Application stage
FROM php:8.2-fpm-alpine AS app

# Install system dependencies & Nginx
RUN apk add --no-cache \
    nginx \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    libxml2-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Install PHP extensions for MySQL and Graphics
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# Copy your new Nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev --no-interaction

# Copy built React assets from Stage 1
COPY --from=node-build /app/public/build public/build

# Set permissions for Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 80 (Standard for Nginx)
EXPOSE 80

# Start PHP-FPM in the background and Nginx in the foreground
CMD php-fpm -D && nginx -g "daemon off;"