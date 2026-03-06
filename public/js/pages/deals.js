// public/js/pages/deals.js - Deals Page (Kanban Board)

import API from '../api.js';
import { renderNavbar, attachNavbarEvents } from '../components/navbar.js';
import { showDealModal, showConfirmModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

let deals = [];
let clients = [];

const STAGES = [
    { id: 'lead', name: 'Lead', color: '#3b82f6' },
    { id: 'contacted', name: 'Contacted', color: '#eab308' },
    { id: 'proposal', name: 'Proposal', color: '#f97316' },
    { id: 'won', name: 'Won', color: '#22c55e' },
    { id: 'lost', name: 'Lost', color: '#ef4444' }
];

export async function renderDealsPage() {
    return `
        <div class="app-layout">
            ${renderNavbar()}
            <main class="main-content">
                <div class="content-header">
                    <h2 class="text-xl font-semibold text-slate-800">Deals</h2>
                    <button class="btn btn-primary" id="add-deal-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Deal
                    </button>
                </div>
                <div class="content-body">
                    <div class="kanban-board" id="kanban-board">
                        ${STAGES.map(stage => `
                            <div class="kanban-column" data-stage="${stage.id}">
                                <div class="kanban-column-header ${stage.id}" style="border-color: ${stage.color}">
                                    <span class="kanban-column-title">
                                        <span class="w-3 h-3 rounded-full" style="background-color: ${stage.color}"></span>
                                        ${stage.name}
                                    </span>
                                    <span class="kanban-column-count" data-count="${stage.id}">0</span>
                                </div>
                                <div class="kanban-cards" data-stage="${stage.id}">
                                    <!-- Deals will be rendered here -->
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </main>
        </div>
    `;
}

export async function initDealsPage() {
    attachNavbarEvents();
    
    // Load data
    await loadData();
    
    // Attach event listeners
    document.getElementById('add-deal-btn').addEventListener('click', () => {
        showDealModal(null, clients, handleSaveDeal);
    });
    
    // Setup drag and drop
    setupDragAndDrop();
}

async function loadData() {
    try {
        const [dealsResult, clientsResult] = await Promise.all([
            API.deals.getAll(),
            API.clients.getAll()
        ]);
        
        deals = dealsResult.data.deals;
        clients = clientsResult.data.clients;
        
        renderKanban();
    } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load deals');
    }
}

function renderKanban() {
    // Clear all columns
    document.querySelectorAll('.kanban-cards').forEach(col => {
        col.innerHTML = '';
    });
    
    // Reset counts
    document.querySelectorAll('[data-count]').forEach(el => {
       el.textContent = '0';
    });
    
    // Group deals by stage
    const dealsByStage = {};
    STAGES.forEach(stage => {
        dealsByStage[stage.id] = [];
    });
    
    deals.forEach(deal => {
        if (dealsByStage[deal.stage]) {
            dealsByStage[deal.stage].push(deal);
        }
    });
    
    // Render deals in each column
    STAGES.forEach(stage => {
        const column = document.querySelector(`.kanban-cards[data-stage="${stage.id}"]`);
        const countEl = document.querySelector(`[data-count="${stage.id}"]`);
        
        countEl.textContent = dealsByStage[stage.id].length;
        
        if (dealsByStage[stage.id].length === 0) {
            column.innerHTML = `
                <div class="empty-state py-8">
                    <p class="text-sm text-slate-400">No deals</p>
                </div>
            `;
        } else {
            column.innerHTML = dealsByStage[stage.id].map(deal => renderDealCard(deal)).join('');
        }
    });
    
    // Attach card event listeners
    attachCardListeners();
}

function renderDealCard(deal) {
    const isWon = deal.stage === 'won';
    const isLost = deal.stage === 'lost';
    
    return `
        <div class="kanban-card" draggable="true" data-id="${deal.id}" data-stage="${deal.stage}">
            <div class="kanban-card-title">${escapeHtml(deal.title)}</div>
            <div class="kanban-card-client">${escapeHtml(deal.client_name || 'No client')}</div>
            <div class="flex justify-between items-center">
                <span class="kanban-card-value ${isLost ? 'lost' : ''}">
                    ${formatCurrency(deal.value)}
                </span>
                <div class="flex gap-1">
                    <button class="btn btn-icon btn-sm edit-deal-btn" data-id="${deal.id}" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button class="btn btn-icon btn-sm btn-danger delete-deal-btn" data-id="${deal.id}" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function attachCardListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-deal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const deal = deals.find(d => d.id == btn.dataset.id);
            showDealModal(deal, clients, handleSaveDeal);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-deal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const deal = deals.find(d => d.id == btn.dataset.id);
            showConfirmModal(
                `Are you sure you want to delete "${deal.title}"?`,
                () => handleDeleteDeal(deal.id)
            );
        });
    });
}

function setupDragAndDrop() {
    const board = document.getElementById('kanban-board');
    
    let draggedCard = null;
    
    board.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            draggedCard = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        }
    });
    
    board.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('kanban-card')) {
            e.target.classList.remove('dragging');
            draggedCard = null;
        }
    });
    
    board.addEventListener('dragover', (e) => {
        e.preventDefault();
        const card = e.target.closest('.kanban-card');
        const column = e.target.closest('.kanban-cards');
        
        if (column) {
            e.dataTransfer.dropEffect = 'move';
        }
    });
    
    board.addEventListener('drop', async (e) => {
        e.preventDefault();
        
        const column = e.target.closest('.kanban-cards');
        
        if (draggedCard && column) {
            const dealId = draggedCard.dataset.id;
            const newStage = column.dataset.stage;
            const oldStage = draggedCard.dataset.stage;
            
            if (newStage !== oldStage) {
                // Update deal stage
                try {
                    await API.deals.updateStage(dealId, newStage);
                    
                    // Update local data
                    const deal = deals.find(d => d.id == dealId);
                    if (deal) {
                        deal.stage = newStage;
                    }
                    
                    // Re-render kanban
                    renderKanban();
                    toast.success('Deal stage updated');
                } catch (error) {
                    console.error('Failed to update stage:', error);
                    toast.error('Failed to update deal stage');
                }
            }
        }
    });
}

async function handleSaveDeal(data, id = null) {
    try {
        if (id) {
            await API.deals.update(id, data);
            toast.success('Deal updated successfully');
        } else {
            await API.deals.create(data);
            toast.success('Deal created successfully');
        }
        await loadData();
    } catch (error) {
        console.error('Failed to save deal:', error);
        toast.error(error.message || 'Failed to save deal');
    }
}

async function handleDeleteDeal(id) {
    try {
        await API.deals.delete(id);
        toast.success('Deal deleted successfully');
        await loadData();
    } catch (error) {
        console.error('Failed to delete deal:', error);
        toast.error(error.message || 'Failed to delete deal');
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export default { renderDealsPage, initDealsPage };
