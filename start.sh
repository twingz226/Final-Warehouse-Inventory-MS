#!/bin/sh

# Clean up any existing socket
rm -f /var/run/php-fpm.sock

# Ensure proper permissions for socket directory
chmod -R 777 /var/run

# Start PHP-FPM in background
php-fpm -D

# Wait a moment for PHP-FPM to start
sleep 2

# --- ADD THESE COMMANDS HERE ---
# Run migrations with --force for production
echo "Running migrations..."
php artisan migrate --force
# -------------------------------

# Start Nginx in foreground
echo "Starting Nginx..."
nginx -g "daemon off;"