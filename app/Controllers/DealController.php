<?php
// app/Controllers/DealController.php

require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../Models/DealModel.php';
require_once __DIR__ . '/../Models/ClientModel.php';

class DealController extends Controller {
    private $dealModel;
    private $clientModel;

    public function __construct() {
        $this->dealModel = new DealModel();
        $this->clientModel = new ClientModel();
    }

    public function index() {
        $userId = $this->requireAuth();

        $deals = $this->dealModel->findByUserId($userId);
        $this->success(['deals' => $deals]);
    }

    public function show($id) {
        $userId = $this->requireAuth();

        $deal = $this->dealModel->findByIdAndUserId($id, $userId);
        if (!$deal) {
            $this->error('Deal not found', 404);
        }

        $this->success(['deal' => $deal]);
    }

    public function store() {
        $userId = $this->requireAuth();
        $data = $this->getInput();

        if (!isset($data['title']) || empty(trim($data['title']))) {
            $this->error('Deal title is required');
        }

        if (!isset($data['client_id'])) {
            $this->error('Client is required');
        }

        // Verify client belongs to user
        $client = $this->clientModel->findByIdAndUserId($data['client_id'], $userId);
        if (!$client) {
            $this->error('Client not found', 404);
        }

        $allowedStages = ['lead', 'contacted', 'proposal', 'won', 'lost'];
        if (isset($data['stage']) && !in_array($data['stage'], $allowedStages)) {
            $this->error('Invalid stage');
        }

        try {
            $dealId = $this->dealModel->create($userId, $data);
            $deal = $this->dealModel->findByIdAndUserId($dealId, $userId);
            $this->success(['deal' => $deal], 'Deal created successfully');
        } catch (Exception $e) {
            $this->error('Failed to create deal');
        }
    }

    public function update($id) {
        $userId = $this->requireAuth();
        $data = $this->getInput();

        $deal = $this->dealModel->findByIdAndUserId($id, $userId);
        if (!$deal) {
            $this->error('Deal not found', 404);
        }

        if (!isset($data['title']) || empty(trim($data['title']))) {
            $this->error('Deal title is required');
        }

        if (!isset($data['client_id'])) {
            $this->error('Client is required');
        }

        // Verify client belongs to user
        $client = $this->clientModel->findByIdAndUserId($data['client_id'], $userId);
        if (!$client) {
            $this->error('Client not found', 404);
        }

        $allowedStages = ['lead', 'contacted', 'proposal', 'won', 'lost'];
        if (isset($data['stage']) && !in_array($data['stage'], $allowedStages)) {
            $this->error('Invalid stage');
        }

        try {
            $this->dealModel->update($id, $userId, $data);
            $deal = $this->dealModel->findByIdAndUserId($id, $userId);
            $this->success(['deal' => $deal], 'Deal updated successfully');
        } catch (Exception $e) {
            $this->error('Failed to update deal');
        }
    }

    public function updateStage($id) {
        $userId = $this->requireAuth();
        $data = $this->getInput();

        $deal = $this->dealModel->findByIdAndUserId($id, $userId);
        if (!$deal) {
            $this->error('Deal not found', 404);
        }

        if (!isset($data['stage'])) {
            $this->error('Stage is required');
        }

        $allowedStages = ['lead', 'contacted', 'proposal', 'won', 'lost'];
        if (!in_array($data['stage'], $allowedStages)) {
            $this->error('Invalid stage');
        }

        try {
            $this->dealModel->updateStage($id, $userId, $data['stage']);
            $deal = $this->dealModel->findByIdAndUserId($id, $userId);
            $this->success(['deal' => $deal], 'Deal stage updated successfully');
        } catch (Exception $e) {
            $this->error('Failed to update deal stage');
        }
    }

    public function destroy($id) {
        $userId = $this->requireAuth();

        $deal = $this->dealModel->findByIdAndUserId($id, $userId);
        if (!$deal) {
            $this->error('Deal not found', 404);
        }

        try {
            $this->dealModel->delete($id, $userId);
            $this->success([], 'Deal deleted successfully');
        } catch (Exception $e) {
            $this->error('Failed to delete deal');
        }
    }
}
