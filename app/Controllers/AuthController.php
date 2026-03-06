<?php
// app/Controllers/AuthController.php

require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../Models/UserModel.php';

class AuthController extends Controller {
    private $userModel;

    public function __construct() {
        $this->userModel = new UserModel();
    }

    public function login() {
        $data = $this->getInput();
        
        if (!isset($data['email']) || !isset($data['password'])) {
            $this->error('Email and password are required');
        }

        $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
        if (!$email) {
            $this->error('Invalid email format');
        }

        $user = $this->userModel->verifyPassword($email, $data['password']);
        
        if (!$user) {
            $this->error('Invalid email or password');
        }

        // Regenerate session ID for security
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];

        $this->success([
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email']
            ]
        ], 'Login successful');
    }

    public function register() {
        $data = $this->getInput();
        
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
            $this->error('Name, email and password are required');
        }

        $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
        if (!$email) {
            $this->error('Invalid email format');
        }

        if (strlen($data['password']) < 6) {
            $this->error('Password must be at least 6 characters');
        }

        // Check if email already exists
        $existingUser = $this->userModel->findByEmail($email);
        if ($existingUser) {
            $this->error('Email already registered');
        }

        try {
            $userId = $this->userModel->create($email, $data['password'], $data['name']);
            
            session_regenerate_id(true);
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $data['name'];
            $_SESSION['user_email'] = $email;

            $this->success([
                'user' => [
                    'id' => $userId,
                    'name' => $data['name'],
                    'email' => $email
                ]
            ], 'Registration successful');
        } catch (Exception $e) {
            $this->error('Registration failed. Please try again.');
        }
    }

    public function logout() {
        $_SESSION = [];
        
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        session_destroy();
        $this->success([], 'Logged out successfully');
    }

    public function check() {
        if (isset($_SESSION['user_id'])) {
            $this->success([
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'name' => $_SESSION['user_name'],
                    'email' => $_SESSION['user_email']
                ],
                'csrf_token' => $_SESSION['csrf_token']
            ]);
        } else {
            $this->error('Not authenticated', 401);
        }
    }

    public function csrfToken() {
        $this->success(['csrf_token' => $_SESSION['csrf_token']]);
    }
}
