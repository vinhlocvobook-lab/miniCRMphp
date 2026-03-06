<?php
// app/Controllers/ClientController.php

require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../Models/ClientModel.php';

class ClientController extends Controller {
    private $clientModel;

    public function __construct() {
        $this->clientModel = new ClientModel();
    }

    public function index() {
        $userId = $this->requireAuth();
        $search = $_GET['search'] ?? null;

        $clients = $this->clientModel->findByUserId($userId, $search);
        $this->success(['clients' => $clients]);
    }

    public function show($id) {
        $userId = $this->requireAuth();

        $client = $this->clientModel->findByIdAndUserId($id, $userId);
        if (!$client) {
            $this->error('Client not found', 404);
        }

        $this->success(['client' => $client]);
    }

    public function store() {
        $userId = $this->requireAuth();
        $data = $this->getInput();

        if (!isset($data['name']) || empty(trim($data['name']))) {
            $this->error('Client name is required');
        }

        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email format');
        }

        try {
            $clientId = $this->clientModel->create($userId, $data);
            $client = $this->clientModel->findByIdAndUserId($clientId, $userId);
            $this->success(['client' => $client], 'Client created successfully');
        } catch (Exception $e) {
            $this->error('Failed to create client');
        }
    }

    public function update($id) {
        $userId = $this->requireAuth();
        $data = $this->getInput();

        $client = $this->clientModel->findByIdAndUserId($id, $userId);
        if (!$client) {
            $this->error('Client not found', 404);
        }

        if (!isset($data['name']) || empty(trim($data['name']))) {
            $this->error('Client name is required');
        }

        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email format');
        }

        try {
            $this->clientModel->update($id, $userId, $data);
            $client = $this->clientModel->findByIdAndUserId($id, $userId);
            $this->success(['client' => $client], 'Client updated successfully');
        } catch (Exception $e) {
            $this->error('Failed to update client');
        }
    }

    public function destroy($id) {
        $userId = $this->requireAuth();

        $client = $this->clientModel->findByIdAndUserId($id, $userId);
        if (!$client) {
            $this->error('Client not found', 404);
        }

        // Check if client has deals
        if ($this->clientModel->hasDeals($id, $userId)) {
            $this->error('Cannot delete client with associated deals');
        }

        try {
            $this->clientModel->delete($id, $userId);
            $this->success([], 'Client deleted successfully');
        } catch (Exception $e) {
            $this->error('Failed to delete client');
        }
    }
}
