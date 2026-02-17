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

# --- CONFIGURE UNIX SOCKET AND RUN DIRECTORIES ---
# 1. Alpine Nginx requires /run/nginx to store its PID and temp files
# 2. /var/run is where the PHP socket will live
RUN mkdir -p /run/nginx /var/run && \
    chown -R www-data:www-data /run/nginx /var/run && \
    chmod -R 777 /var/run

# 3. Force PHP-FPM to use the Unix socket with open permissions
RUN sed -i 's/listen = 9000/listen = \/var\/run\/php-fpm.sock/g' /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo "listen.owner = www-data" >> /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo "listen.group = www-data" >> /usr/local/etc/php-fpm.d/zz-docker.conf && \
    echo "listen.mode = 0666" >> /usr/local/etc/php-fpm.d/zz-docker.conf
# -----------------------------------------------

# Copy startup script
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expose port 80 (Standard for Nginx)
EXPOSE 80

# Use the startup script
CMD ["/usr/local/bin/start.sh"]