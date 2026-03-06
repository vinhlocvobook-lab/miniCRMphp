<?php
// app/Models/ClientModel.php

require_once __DIR__ . '/Model.php';

class ClientModel extends Model {
    protected $table = 'clients';

    public function findByUserId($userId, $search = null) {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = ?";
        $params = [$userId];

        if ($search) {
            $sql .= " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)";
            $searchTerm = "%{$search}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY created_at DESC";
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    public function findByIdAndUserId($id, $userId) {
        $sql = "SELECT * FROM {$this->table} WHERE id = ? AND user_id = ?";
        $stmt = $this->query($sql, [$id, $userId]);
        return $stmt->fetch();
    }

    public function create($userId, $data) {
        $sql = "INSERT INTO {$this->table} 
                (user_id, name, email, phone, company, address, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $this->query($sql, [
            $userId,
            $data['name'],
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['company'] ?? null,
            $data['address'] ?? null,
            $data['notes'] ?? null
        ]);
        
        return $this->lastInsertId();
    }

    public function update($id, $userId, $data) {
        $sql = "UPDATE {$this->table} 
                SET name = ?, email = ?, phone = ?, company = ?, address = ?, notes = ?
                WHERE id = ? AND user_id = ?";
        
        $stmt = $this->query($sql, [
            $data['name'],
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['company'] ?? null,
            $data['address'] ?? null,
            $data['notes'] ?? null,
            $id,
            $userId
        ]);
        
        return true;
    }

    public function delete($id, $userId = null) {
        $sql = "DELETE FROM {$this->table} WHERE id = ? AND user_id = ?";
        $this->query($sql, [$id, $userId]);
        return true;
    }

    public function hasDeals($clientId, $userId) {
        $sql = "SELECT COUNT(*) as count FROM deals WHERE client_id = ? AND user_id = ?";
        $stmt = $this->query($sql, [$clientId, $userId]);
        return $stmt->fetch()['count'] > 0;
    }
}
