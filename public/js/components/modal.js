// public/js/components/modal.js - Modal Component

let activeModal = null;

export function showModal(options) {
    const {
        title = '',
        content = '',
        footer = '',
        onClose = () => {},
        size = 'md' // sm, md, lg
    } = options;

    const sizeClasses = {
        sm: 'max-width: 400px',
        md: 'max-width: 500px',
        lg: 'max-width: 700px'
    };

    const modalHtml = `
        <div class="modal-overlay active" id="modal-overlay">
            <div class="modal" style="${sizeClasses[size]}">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" id="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        </div>
    `;

    const container = document.getElementById('modal-container');
    container.innerHTML = modalHtml;

    activeModal = { onClose };

    // Close handlers
    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            hideModal();
        }
    });

    // Escape key
    document.addEventListener('keydown', handleEscape);

    return {
        hide: hideModal
    };
}

function handleEscape(e) {
    if (e.key === 'Escape' && activeModal) {
        hideModal();
    }
}

export function hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            document.getElementById('modal-container').innerHTML = '';
            activeModal = null;
        }, 200);
    }
    document.removeEventListener('keydown', handleEscape);
    
    if (activeModal && activeModal.onClose) {
        activeModal.onClose();
    }
}

// Client Modal
export function showClientModal(client = null, onSave = () => {}) {
    const isEdit = client !== null;
    const title = isEdit ? 'Edit Client' : 'Add Client';
    
    const content = `
        <form id="client-form">
            <div class="form-group">
                <label class="form-label">Name *</label>
                <input type="text" class="form-input" name="name" value="${client?.name || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" name="email" value="${client?.email || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="text" class="form-input" name="phone" value="${client?.phone || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" class="form-input" name="company" value="${client?.company || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Address</label>
                <textarea class="form-textarea" name="address">${client?.address || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea class="form-textarea" name="notes">${client?.notes || ''}</textarea>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-save">${isEdit ? 'Update' : 'Create'}</button>
    `;

    showModal({ title, content, footer, size: 'lg' });

    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-save').addEventListener('click', () => {
        const form = document.getElementById('client-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        onSave(data, client?.id);
    });
}

// Deal Modal
export function showDealModal(deal = null, clients = [], onSave = () => {}) {
    const isEdit = deal !== null;
    const title = isEdit ? 'Edit Deal' : 'Add Deal';

    const clientOptions = clients.map(c => 
        `<option value="${c.id}" ${deal?.client_id == c.id ? 'selected' : ''}>${c.name}${c.company ? ` (${c.company})` : ''}</option>`
    ).join('');

    const stageOptions = ['lead', 'contacted', 'proposal', 'won', 'lost'].map(stage => 
        `<option value="${stage}" ${deal?.stage === stage ? 'selected' : ''}>${stage.charAt(0).toUpperCase() + stage.slice(1)}</option>`
    ).join('');

    const content = `
        <form id="deal-form">
            <div class="form-group">
                <label class="form-label">Title *</label>
                <input type="text" class="form-input" name="title" value="${deal?.title || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Client *</label>
                <select class="form-select" name="client_id" required>
                    <option value="">Select a client</option>
                    ${clientOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Value ($)</label>
                <input type="number" class="form-input" name="value" value="${deal?.value || 0}" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label class="form-label">Stage</label>
                <select class="form-select" name="stage">
                    ${stageOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea class="form-textarea" name="notes">${deal?.notes || ''}</textarea>
            </div>
        </form>
    `;

    const footer = `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-save">${isEdit ? 'Update' : 'Create'}</button>
    `;

    showModal({ title, content, footer, size: 'lg' });

    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-save').addEventListener('click', () => {
        const form = document.getElementById('deal-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.value = parseFloat(data.value) || 0;
        data.client_id = parseInt(data.client_id);
        onSave(data, deal?.id);
    });
}

// Confirm Modal
export function showConfirmModal(message, onConfirm = () => {}) {
    const content = `<p class="text-center">${message}</p>`;
    
    const footer = `
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-danger" id="modal-confirm">Confirm</button>
    `;

    showModal({ title: 'Confirm', content, footer });

    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-confirm').addEventListener('click', () => {
        onConfirm();
        hideModal();
    });
}

export default { showModal, hideModal, showClientModal, showDealModal, showConfirmModal };
