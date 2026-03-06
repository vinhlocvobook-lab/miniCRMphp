// public/js/pages/clients.js - Clients Page

import API from '../api.js';
import { renderNavbar, attachNavbarEvents } from '../components/navbar.js';
import { showClientModal, showConfirmModal } from '../components/modal.js';
import { toast } from '../components/toast.js';

let clients = [];

export async function renderClientsPage() {
    return `
        <div class="app-layout">
            ${renderNavbar()}
            <main class="main-content">
                <div class="content-header">
                    <h2 class="text-xl font-semibold text-slate-800">Clients</h2>
                    <div class="flex gap-4 items-center">
                        <div class="search-container">
                            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" class="search-input" id="search-input" placeholder="Search clients...">
                        </div>
                        <button class="btn btn-primary" id="add-client-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Client
                        </button>
                    </div>
                </div>
                <div class="content-body">
                    <div class="card">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Company</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="clients-table-body">
                                    <tr>
                                        <td colspan="5" class="text-center py-8">
                                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="empty-state" class="hidden">
                            <div class="empty-state">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <div class="empty-state-title">No clients found</div>
                                <p>Add your first client to get started</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export async function initClientsPage() {
    attachNavbarEvents();
    
    // Load clients
    await loadClients();
    
    // Attach event listeners
    document.getElementById('add-client-btn').addEventListener('click', () => {
        showClientModal(null, handleSaveClient);
    });
    
    document.getElementById('search-input').addEventListener('input', debounce(async (e) => {
        await loadClients(e.target.value);
    }, 300));
}

async function loadClients(search = null) {
    try {
        const result = await API.clients.getAll(search);
        clients = result.data.clients;
        renderClientsTable();
    } catch (error) {
        console.error('Failed to load clients:', error);
        toast.error('Failed to load clients');
    }
}

function renderClientsTable() {
    const tbody = document.getElementById('clients-table-body');
    const emptyState = document.getElementById('empty-state');
    
    if (clients.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    tbody.innerHTML = clients.map(client => `
        <tr>
            <td class="font-medium">${escapeHtml(client.name)}</td>
            <td>${escapeHtml(client.company || '-')}</td>
            <td>${escapeHtml(client.email || '-')}</td>
            <td>${escapeHtml(client.phone || '-')}</td>
            <td>
                <div class="flex gap-2">
                    <button class="btn btn-sm btn-secondary edit-client-btn" data-id="${client.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button class="btn btn-sm btn-danger delete-client-btn" data-id="${client.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Attach event listeners
    document.querySelectorAll('.edit-client-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const client = clients.find(c => c.id == btn.dataset.id);
            showClientModal(client, handleSaveClient);
        });
    });
    
    document.querySelectorAll('.delete-client-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const client = clients.find(c => c.id == btn.dataset.id);
            showConfirmModal(
                `Are you sure you want to delete "${client.name}"? This action cannot be undone.`,
                () => handleDeleteClient(client.id)
            );
        });
    });
}

async function handleSaveClient(data, id = null) {
    try {
        if (id) {
            await API.clients.update(id, data);
            toast.success('Client updated successfully');
        } else {
            await API.clients.create(data);
            toast.success('Client created successfully');
        }
        await loadClients();
    } catch (error) {
        console.error('Failed to save client:', error);
        toast.error(error.message || 'Failed to save client');
    }
}

async function handleDeleteClient(id) {
    try {
        await API.clients.delete(id);
        toast.success('Client deleted successfully');
        await loadClients();
    } catch (error) {
        console.error('Failed to delete client:', error);
        toast.error(error.message || 'Failed to delete client');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

export default { renderClientsPage, initClientsPage };
