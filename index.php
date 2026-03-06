<?php
// index.php - Front Controller

// Load configuration
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Load Router
require_once __DIR__ . '/app/Router.php';

// Initialize Router
$router = new Router('/api');

// Auth routes
$router->post('/auth/login', 'AuthController@login');
$router->post('/auth/register', 'AuthController@register');
$router->post('/auth/logout', 'AuthController@logout');
$router->get('/auth/check', 'AuthController@check');
$router->get('/auth/csrf-token', 'AuthController@csrfToken');

// Dashboard routes
$router->get('/dashboard', 'DashboardController@index');

// Client routes
$router->get('/clients', 'ClientController@index');
$router->get('/clients/{id}', 'ClientController@show');
$router->post('/clients', 'ClientController@store');
$router->put('/clients/{id}', 'ClientController@update');
$router->delete('/clients/{id}', 'ClientController@destroy');

// Deal routes
$router->get('/deals', 'DealController@index');
$router->get('/deals/{id}', 'DealController@show');
$router->post('/deals', 'DealController@store');
$router->put('/deals/{id}', 'DealController@update');
$router->patch('/deals/{id}/stage', 'DealController@updateStage');
$router->delete('/deals/{id}', 'DealController@destroy');

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Dispatch the request
try {
    $router->dispatch($method, $uri);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
    error_log("Router error: " . $e->getMessage());
}
