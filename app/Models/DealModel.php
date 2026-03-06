<?php
// app/Models/DealModel.php

require_once __DIR__ . '/Model.php';

class DealModel extends Model {
    protected $table = 'deals';

    public function findByUserId($userId) {
        $sql = "SELECT d.*, c.name as client_name, c.company as client_company 
                FROM {$this->table} d
                LEFT JOIN clients c ON d.client_id = c.id
                WHERE d.user_id = ?
                ORDER BY d.created_at DESC";
        $stmt = $this->query($sql, [$userId]);
        return $stmt->fetchAll();
    }

    public function findByIdAndUserId($id, $userId) {
        $sql = "SELECT d.*, c.name as client_name, c.company as client_company 
                FROM {$this->table} d
                LEFT JOIN clients c ON d.client_id = c.id
                WHERE d.id = ? AND d.user_id = ?";
        $stmt = $this->query($sql, [$id, $userId]);
        return $stmt->fetch();
    }

    public function findByStage($userId, $stage) {
        $sql = "SELECT d.*, c.name as client_name, c.company as client_company 
                FROM {$this->table} d
                LEFT JOIN clients c ON d.client_id = c.id
                WHERE d.user_id = ? AND d.stage = ?
                ORDER BY d.created_at DESC";
        $stmt = $this->query($sql, [$userId, $stage]);
        return $stmt->fetchAll();
    }

    public function create($userId, $data) {
        $sql = "INSERT INTO {$this->table} 
                (user_id, client_id, title, value, stage, notes) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $this->query($sql, [
            $userId,
            $data['client_id'],
            $data['title'],
            $data['value'] ?? 0,
            $data['stage'] ?? 'lead',
            $data['notes'] ?? null
        ]);
        
        return $this->lastInsertId();
    }

    public function update($id, $userId, $data) {
        $sql = "UPDATE {$this->table} 
                SET client_id = ?, title = ?, value = ?, stage = ?, notes = ?
                WHERE id = ? AND user_id = ?";
        
        $stmt = $this->query($sql, [
            $data['client_id'],
            $data['title'],
            $data['value'] ?? 0,
            $data['stage'] ?? 'lead',
            $data['notes'] ?? null,
            $id,
            $userId
        ]);
        
        return true;
    }

    public function updateStage($id, $userId, $stage) {
        $allowedStages = ['lead', 'contacted', 'proposal', 'won', 'lost'];
        if (!in_array($stage, $allowedStages)) {
            throw new Exception("Invalid stage");
        }

        $sql = "UPDATE {$this->table} SET stage = ? WHERE id = ? AND user_id = ?";
        $this->query($sql, [$stage, $id, $userId]);
        return true;
    }

    public function delete($id, $userId = null) {
        $sql = "DELETE FROM {$this->table} WHERE id = ? AND user_id = ?";
        $this->query($sql, [$id, $userId]);
        return true;
    }

    public function getClientName($clientId, $userId) {
        $sql = "SELECT name FROM {$this->table} WHERE id = ? AND user_id = ?";
        $stmt = $this->query($sql, [$clientId, $userId]);
        return $stmt->fetch();
    }
}
