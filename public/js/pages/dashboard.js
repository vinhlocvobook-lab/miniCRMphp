// public/js/pages/dashboard.js - Dashboard Page

import API from '../api.js';
import { renderNavbar, attachNavbarEvents } from '../components/navbar.js';
import { toast } from '../components/toast.js';

let barChart = null;
let lineChart = null;

export async function renderDashboardPage() {
    return `
        <div class="app-layout">
            ${renderNavbar()}
            <main class="main-content">
                <div class="content-header">
                    <h2 class="text-xl font-semibold text-slate-800">Dashboard</h2>
                </div>
                <div class="content-body">
                    <!-- Stats Cards -->
                    <div class="stats-grid" id="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon clients">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div class="stat-label">Total Clients</div>
                            <div class="stat-value" id="stat-clients">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon deals">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div class="stat-label">Total Deals</div>
                            <div class="stat-value" id="stat-deals">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon pipeline">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="stat-label">Pipeline Value</div>
                            <div class="stat-value" id="stat-pipeline">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon won">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="stat-label">Won Value</div>
                            <div class="stat-value" id="stat-won">-</div>
                        </div>
                    </div>

                    <!-- Charts -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="card">
                            <div class="card-header">Deals by Stage</div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="dealsByStageChart"></canvas>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">Monthly Deals</div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="monthlyDealsChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export async function initDashboardPage() {
    attachNavbarEvents();
    
    try {
        const result = await API.dashboard.get();
        const data = result.data;
        
        // Update stats
        document.getElementById('stat-clients').textContent = data.stats.total_clients;
        document.getElementById('stat-deals').textContent = data.stats.total_deals;
        document.getElementById('stat-pipeline').textContent = formatCurrency(data.stats.pipeline_value);
        document.getElementById('stat-won').textContent = formatCurrency(data.stats.won_value);
        
        // Render charts
        renderDealsByStageChart(data.deals_by_stage);
        renderMonthlyDealsChart(data.monthly_deals);
        
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        toast.error('Failed to load dashboard data');
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function renderDealsByStageChart(stageData) {
    const ctx = document.getElementById('dealsByStageChart').getContext('2d');
    
    if (barChart) {
        barChart.destroy();
    }
    
    const labels = ['Lead', 'Contacted', 'Proposal', 'Won', 'Lost'];
    const values = [
        stageData.lead.count,
        stageData.contacted.count,
        stageData.proposal.count,
        stageData.won.count,
        stageData.lost.count
    ];
    const colors = [
        '#3b82f6', // Lead - blue
        '#eab308', // Contacted - yellow
        '#f97316', // Proposal - orange
        '#22c55e', // Won - green
        '#ef4444'  // Lost - red
    ];
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Deals',
                data: values,
                backgroundColor: colors,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderMonthlyDealsChart(monthlyData) {
    const ctx = document.getElementById('monthlyDealsChart').getContext('2d');
    
    if (lineChart) {
        lineChart.destroy();
    }
    
    // Ensure we have data for the last 6 months
    const labels = [];
    const counts = [];
    const values = [];
    
    // Create last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toISOString().slice(0, 7);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        
        const monthData = monthlyData.find(m => m.month === monthKey);
        counts.push(monthData ? parseInt(monthData.count) : 0);
        values.push(monthData ? parseFloat(monthData.value) : 0);
    }
    
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Deal Count',
                    data: counts,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Value ($)',
                    data: values,
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Count'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Value ($)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

export default { renderDashboardPage, initDashboardPage };
