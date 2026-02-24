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

try {
    require __DIR__ . '/../public/index.php';
} catch (\Exception $e) {
    if (str_contains($e->getMessage(), '[view] does not exist')) {
        echo "<h1>Debug View Binding Error</h1>";
        echo "<pre>";
        echo "APP_STORAGE: " . getenv('APP_STORAGE') . "\n";
        echo "Storage Path: " . app()->storagePath() . "\n";
        
        // Print available bindings
        echo "Total Bindings: " . count(app()->getBindings()) . "\n";
        echo "Is view bound? " . (app()->bound('view') ? 'Yes' : 'No') . "\n";
        
        // Check core service providers loaded
        $providers = app()->getLoadedProviders();
        echo "Total Providers Loaded: " . count($providers) . "\n";
        echo "Illuminate\\View\\ViewServiceProvider Loaded? " . (isset($providers['Illuminate\\View\\ViewServiceProvider']) ? 'Yes' : 'No') . "\n";
        
        $files = scandir(app()->bootstrapPath('cache'));
        echo "Boostrap Cache Files:\n";
        print_r($files);
        
        echo "\nException Trace:\n" . $e->getTraceAsString();
        echo "</pre>";
        exit;
    }
    throw $e;
}
