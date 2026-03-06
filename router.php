<?php
// router.php - For PHP built-in server (php -S localhost:8000 router.php)
// This mimics .htaccess behavior

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// API routes go to index.php
if (strpos($uri, '/api/') === 0 || $uri === '/api') {
    // Set the request URI for index.php to process
    $_SERVER['SCRIPT_NAME'] = '/index.php';
    require __DIR__ . '/index.php';
    return;
}

// Serve static files directly
$file = __DIR__ . $uri;
if (is_file($file)) {
    return false; // Let PHP built-in server serve static files
}

// All other routes serve the SPA shell
require __DIR__ . '/views/shell.php';
