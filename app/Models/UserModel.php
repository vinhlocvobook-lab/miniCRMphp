<?php
// app/Models/UserModel.php

require_once __DIR__ . '/Model.php';

class UserModel extends Model {
    protected $table = 'users';

    public function findByEmail($email) {
        $sql = "SELECT * FROM {$this->table} WHERE email = ?";
        $stmt = $this->query($sql, [$email]);
        return $stmt->fetch();
    }

    public function create($email, $password, $name) {
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $sql = "INSERT INTO {$this->table} (email, password, name) VALUES (?, ?, ?)";
        $this->query($sql, [$email, $hashedPassword, $name]);
        return $this->lastInsertId();
    }

    public function verifyPassword($email, $password) {
        $user = $this->findByEmail($email);
        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        return false;
    }

    public function getStats($userId) {
        // Total clients
        $sql = "SELECT COUNT(*) as total FROM clients WHERE user_id = ?";
        $stmt = $this->query($sql, [$userId]);
        $clientsCount = $stmt->fetch()['total'];

        // Total deals
        $sql = "SELECT COUNT(*) as total FROM deals WHERE user_id = ?";
        $stmt = $this->query($sql, [$userId]);
        $dealsCount = $stmt->fetch()['total'];

        // Total pipeline value
        $sql = "SELECT SUM(value) as total FROM deals WHERE user_id = ? AND stage != 'lost'";
        $stmt = $this->query($sql, [$userId]);
        $pipelineValue = $stmt->fetch()['total'] ?? 0;

        // Won deals value
        $sql = "SELECT SUM(value) as total FROM deals WHERE user_id = ? AND stage = 'won'";
        $stmt = $this->query($sql, [$userId]);
        $wonValue = $stmt->fetch()['total'] ?? 0;

        return [
            'total_clients' => $clientsCount,
            'total_deals' => $dealsCount,
            'pipeline_value' => $pipelineValue,
            'won_value' => $wonValue
        ];
    }

    public function getDealsByStage($userId) {
        $sql = "SELECT stage, COUNT(*) as count, SUM(value) as value FROM deals WHERE user_id = ? GROUP BY stage";
        $stmt = $this->query($sql, [$userId]);
        return $stmt->fetchAll();
    }

    public function getMonthlyDeals($userId, $months = 6) {
        $sql = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as count,
                    SUM(value) as value
                FROM deals 
                WHERE user_id = ? 
                AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month ASC";
        $stmt = $this->query($sql, [$userId, $months]);
        return $stmt->fetchAll();
    }
}
