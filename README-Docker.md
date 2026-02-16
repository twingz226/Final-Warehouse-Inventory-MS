# Docker Setup for Deka Sales Inventory

This document provides instructions for running the Deka Sales Inventory application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git for cloning the repository

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd "Deka Sales Inventory"
   ```

2. **Build and start the containers:**
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application:**
   - Open your browser and navigate to `http://localhost:8080`

## Docker Services

The setup includes two main services:

### 1. App Service (PHP-FPM)
- **Base Image:** PHP 8.2-FPM Alpine
- **Purpose:** Runs the Laravel application
- **Features:**
  - Optimized for production
  - Includes all required PHP extensions
  - Automatic application key generation
  - SQLite database setup

### 2. Nginx Service
- **Base Image:** Nginx Alpine
- **Purpose:** Web server and reverse proxy
- **Features:**
  - Handles HTTP requests on port 8080
  - Serves static assets efficiently
  - Security headers and gzip compression

## Development

### Building the Image
```bash
docker-compose build
```

### Starting Services
```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up
```

### Viewing Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs nginx
```

### Stopping Services
```bash
docker-compose down
```

### Running Artisan Commands
```bash
docker-compose exec app php artisan <command>
```

### Accessing the Container
```bash
docker-compose exec app sh
```

## Environment Configuration

The Docker setup uses SQLite as the default database. The environment is configured for production with:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `DB_CONNECTION=sqlite`

To modify these settings, edit the `docker-compose.yml` file or create a `.env` file in the project root.

## Volumes

The following directories are mounted as volumes to persist data:
- `./storage` - Laravel storage files
- `./bootstrap/cache` - Laravel cache files
- `./database` - Database files (SQLite)

## Troubleshooting

### Permission Issues
If you encounter permission issues with storage directories:
```bash
docker-compose exec app chown -R www-data:www-data /var/www/html/storage
docker-compose exec app chmod -R 755 /var/www/html/storage
```

### Database Issues
If the SQLite database is not created:
```bash
docker-compose exec app touch /var/www/html/database/database.sqlite
docker-compose exec app chown www-data:www-data /var/www/html/database/database.sqlite
```

### Clearing Caches
```bash
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear
```

## Production Considerations

For production deployment:
1. Set proper environment variables in `.env`
2. Configure SSL/TLS certificates
3. Set up proper backup strategies
4. Monitor container health and logs
5. Consider using Docker secrets for sensitive data

## Customization

### Adding PHP Extensions
To add additional PHP extensions, modify the Dockerfile:
```dockerfile
RUN docker-php-ext-install <extension-name>
```

### Modifying Nginx Configuration
Edit `docker/nginx/default.conf` to customize Nginx settings.

### Changing Database
To use MySQL or PostgreSQL instead of SQLite:
1. Add database service to `docker-compose.yml`
2. Update environment variables
3. Modify `.env` file accordingly
