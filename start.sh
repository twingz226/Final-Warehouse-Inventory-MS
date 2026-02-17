#!/bin/sh

# Clean up any existing socket
rm -f /var/run/php-fpm.sock

# Ensure proper permissions for socket directory
chmod -R 777 /var/run

# Start PHP-FPM in background
php-fpm -D

# Wait a moment for PHP-FPM to start
sleep 2

# Start Nginx in foreground
nginx -g "daemon off;"
