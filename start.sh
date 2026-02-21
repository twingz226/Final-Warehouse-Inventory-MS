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
# Run migrations and seeds with --force for production
echo "Running migrations and seeders..."
php artisan migrate --force --seed
# -------------------------------

# Start Nginx in foreground
echo "Starting Nginx..."
nginx -g "daemon off;"