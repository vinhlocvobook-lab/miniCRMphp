<?php
// app/Models/Model.php

abstract class Model {
    protected $db;
    protected $table;
    protected $primaryKey = 'id';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    protected function query($sql, $params = []) {
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query error: " . $e->getMessage());
            throw new Exception("Database query failed");
        }
    }

    public function findAll($orderBy = null, $orderDir = 'ASC') {
        $sql = "SELECT * FROM {$this->table}";
        if ($orderBy) {
            $sql .= " ORDER BY {$orderBy} {$orderDir}";
        }
        $stmt = $this->query($sql);
        return $stmt->fetchAll();
    }

    public function findById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?";
        $stmt = $this->query($sql, [$id]);
        return $stmt->fetch();
    }

    public function delete($id, $userId = null) {
        if ($userId !== null && isset($this->table) && in_array($this->table, ['clients', 'deals'])) {
            $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ? AND user_id = ?";
            $this->query($sql, [$id, $userId]);
        } else {
            $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
            $this->query($sql, [$id]);
        }
        return true;
    }

    public function lastInsertId() {
        return $this->db->lastInsertId();
    }
}
