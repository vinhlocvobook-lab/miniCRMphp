<?php
// app/Controllers/DashboardController.php

require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../Models/UserModel.php';

class DashboardController extends Controller {
    private $userModel;

    public function __construct() {
        $this->userModel = new UserModel();
    }

    public function index() {
        $userId = $this->requireAuth();

        $stats = $this->userModel->getStats($userId);
        $dealsByStage = $this->userModel->getDealsByStage($userId);
        $monthlyDeals = $this->userModel->getMonthlyDeals($userId, 6);

        // Format deals by stage for chart
        $stageData = [
            'lead' => ['count' => 0, 'value' => 0],
            'contacted' => ['count' => 0, 'value' => 0],
            'proposal' => ['count' => 0, 'value' => 0],
            'won' => ['count' => 0, 'value' => 0],
            'lost' => ['count' => 0, 'value' => 0]
        ];

        foreach ($dealsByStage as $stage) {
            if (isset($stageData[$stage['stage']])) {
                $stageData[$stage['stage']] = [
                    'count' => (int)$stage['count'],
                    'value' => (float)$stage['value']
                ];
            }
        }

        $this->success([
            'stats' => $stats,
            'deals_by_stage' => $stageData,
            'monthly_deals' => $monthlyDeals
        ]);
    }
}
