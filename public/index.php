<?php
// public/index.php - Front Controller

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// API routes go to index.php
if (strpos($uri, '/api/') === 0 || $uri === '/api') {
    $_SERVER['SCRIPT_NAME'] = '/index.php';
    require __DIR__ . '/../index.php';
    return;
}

// Serve static files (css, js, images)
$ext = pathinfo($uri, PATHINFO_EXTENSION);
$staticExtensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf'];

if (in_array($ext, $staticExtensions)) {
    $file = __DIR__ . $uri;
    if (is_file($file)) {
        return false; // Let PHP built-in server serve static files
    }
}

// All other routes serve the SPA shell
require __DIR__ . '/../views/shell.php';
