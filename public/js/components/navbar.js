// public/js/components/navbar.js - Navigation Component

import router from '../router.js';

export function renderNavbar() {
    const isLoggedIn = localStorage.getItem('user') !== null;
    
    if (!isLoggedIn) {
        return '';
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentPath = router.getCurrentRoute() || window.location.pathname;

    return `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h1 class="text-xl font-bold">📊 Mini CRM</h1>
            </div>
            <nav class="sidebar-nav">
                <a href="/dashboard" class="nav-item ${currentPath === '/dashboard' ? 'active' : ''}" data-nav="dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </a>
                <a href="/clients" class="nav-item ${currentPath === '/clients' ? 'active' : ''}" data-nav="clients">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Clients
                </a>
                <a href="/deals" class="nav-item ${currentPath === '/deals' ? 'active' : ''}" data-nav="deals">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Deals
                </a>
                <div class="mt-auto" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div class="px-4 py-2 text-sm text-white/70">
                        ${user.name || user.email}
                    </div>
                    <button id="logout-btn" class="nav-item w-full text-left text-red-400 hover:text-red-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </nav>
        </aside>
    `;
}

export function attachNavbarEvents() {
    // Navigation links
    document.querySelectorAll('.nav-item[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = link.getAttribute('href');
            router.navigate(path);
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await API.auth.logout();
                localStorage.removeItem('user');
                localStorage.removeItem('csrf_token');
                router.navigate('/login');
            } catch (error) {
                console.error('Logout failed:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('csrf_token');
                router.navigate('/login');
            }
        });
    }
}

export default { renderNavbar, attachNavbarEvents };
