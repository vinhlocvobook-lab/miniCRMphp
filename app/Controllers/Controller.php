<?php
// app/Controllers/Controller.php

class Controller {
    protected function json($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    protected function success($data = [], $message = 'Success') {
        $this->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    protected function error($message = 'Error', $status = 400) {
        $this->json([
            'success' => false,
            'message' => $message
        ], $status);
    }

    protected function requireAuth() {
        if (!isset($_SESSION['user_id'])) {
            $this->error('Unauthorized', 401);
        }
        return $_SESSION['user_id'];
    }

    protected function validateCSRF($token) {
        if (!hash_equals($_SESSION['csrf_token'], $token)) {
            $this->error('Invalid CSRF token', 403);
        }
        return true;
    }

    protected function getInput() {
        $input = json_decode(file_get_contents('php://input'), true);
        return $input ?? $_POST;
    }
}
