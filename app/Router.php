<?php
// app/Router.php

class Router {
    private $routes = [];
    private $prefix = '';

    public function __construct($prefix = '') {
        $this->prefix = $prefix;
    }

    public function get($path, $handler) {
        $this->routes['GET'][$path] = $handler;
    }

    public function post($path, $handler) {
        $this->routes['POST'][$path] = $handler;
    }

    public function put($path, $handler) {
        $this->routes['PUT'][$path] = $handler;
    }

    public function delete($path, $handler) {
        $this->routes['DELETE'][$path] = $handler;
    }

    public function patch($path, $handler) {
        $this->routes['PATCH'][$path] = $handler;
    }

    public function dispatch($method, $uri) {
        // Remove prefix from URI
        if ($this->prefix) {
            $uri = str_replace($this->prefix, '', $uri);
        }

        // Remove query string
        $uri = explode('?', $uri)[0];
        $uri = '/' . trim($uri, '/');

        // Check for exact match
        if (isset($this->routes[$method][$uri])) {
            $handler = $this->routes[$method][$uri];
            return $this->executeHandler($handler);
        }

        // Check for parameterized routes
        foreach ($this->routes[$method] as $route => $handler) {
            $pattern = $this->convertToRegex($route);
            if (preg_match($pattern, $uri, $matches)) {
                // Remove full match and keep only named params
                $params = array_filter($matches, fn($key) => !is_numeric($key), ARRAY_FILTER_USE_KEY);
                return $this->executeHandler($handler, array_values($params));
            }
        }

        // Route not found
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Route not found']);
        exit;
    }

    private function convertToRegex($route) {
        // Convert {param} to regex capture group
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $route);
        return '#^' . $pattern . '$#';
    }

    private function executeHandler($handler, $params = []) {
        if (is_callable($handler)) {
            return call_user_func_array($handler, $params);
        }

        if (is_string($handler) && strpos($handler, '@') !== false) {
            list($controllerName, $method) = explode('@', $handler);
            
            // Load controller files
            $controllerFile = __DIR__ . '/Controllers/' . $controllerName . '.php';
            if (!file_exists($controllerFile)) {
                throw new Exception("Controller not found: {$controllerName}");
            }
            
            require_once $controllerFile;
            
            if (!class_exists($controllerName)) {
                throw new Exception("Controller class not found: {$controllerName}");
            }
            
            $controller = new $controllerName();
            
            if (!method_exists($controller, $method)) {
                throw new Exception("Method not found: {$method}");
            }
            
            return call_user_func_array([$controller, $method], $params);
        }

        throw new Exception("Invalid handler");
    }
}
