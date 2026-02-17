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

# --- UPDATED: CONFIGURE UNIX SOCKET FOR OPTION B ---
# 1. Create directory and ensure both services can access the socket
RUN mkdir -p /var/run && \
    chown -R www-data:www-data /var/run && \
    chmod -R 775 /var/run

# 2. Update PHP-FPM pool config to use the socket instead of Port 9000
# We use 'zz-docker.conf' to override default image settings
RUN sed -i 's/listen = 9000/listen = \/var\/run\/php-fpm.sock/g' /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo "listen.owner = www-data" >> /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo "listen.group = www-data" >> /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo "listen.mode = 0666" >> /usr/local/etc/php-fpm.d/zz-docker.conf
# -----------------------------------------------

# Expose port 80 (Standard for Nginx)
EXPOSE 80

# Start PHP-FPM in the background (-D) and Nginx in the foreground
CMD php-fpm -D && nginx -g "daemon off;"