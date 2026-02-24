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
putenv('APP_STORAGE=/tmp/storage');

// Ensure log driver uses stdout/stderr on Vercel
// putenv('LOG_CHANNEL=stderr');

// Force debug mode to see the actual error on Vercel
putenv('APP_DEBUG=true');
putenv('APP_ENV=local');
$_ENV['APP_DEBUG'] = 'true';
$_SERVER['APP_DEBUG'] = 'true';

try {
    require __DIR__ . '/../public/index.php';
} catch (\Throwable $e) {
    // If it crashes before Laravel's Kernel can catch it, we dump it here
    echo "<h1>Debug Full Boot Error</h1>";
    echo "<pre>";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
    
    $files = scandir(__DIR__ . '/../bootstrap/cache');
    echo "\nBoostrap Cache Files:\n";
    print_r($files);
    
    echo "\nException Trace:\n" . $e->getTraceAsString();
    echo "</pre>";
    exit;
}
