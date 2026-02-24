<?php

// Create temporary directories for caching on Vercel's read-only filesystem
$tmpDirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/bootstrap/cache',
    '/tmp/storage/logs',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/framework/testing',
];

foreach ($tmpDirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Override Laravel caching paths to use /tmp
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
putenv('APP_SERVICES_CACHE=/tmp/storage/bootstrap/cache/services.php');
putenv('APP_PACKAGES_CACHE=/tmp/storage/bootstrap/cache/packages.php');
putenv('APP_CONFIG_CACHE=/tmp/storage/bootstrap/cache/config.php');
putenv('APP_ROUTES_CACHE=/tmp/storage/bootstrap/cache/routes-v7.php');
putenv('APP_EVENTS_CACHE=/tmp/storage/bootstrap/cache/events.php');
putenv('APP_STORAGE=/tmp/storage');

// Ensure log driver uses stdout/stderr on Vercel
// putenv('LOG_CHANNEL=stderr');

// Forward Vercel requests to normal Laravel public/index.php
require __DIR__ . '/../public/index.php';
