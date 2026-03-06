// public/js/app.js - Main Application Entry Point

import router from './router.js';
import API from './api.js';
import { renderLoginPage, initLoginPage } from './pages/login.js';
import { renderRegisterPage, initRegisterPage } from './pages/register.js';
import { renderDashboardPage, initDashboardPage } from './pages/dashboard.js';
import { renderClientsPage, initClientsPage } from './pages/clients.js';
import { renderDealsPage, initDealsPage } from './pages/deals.js';

// App initialization
async function initApp() {
    const app = document.getElementById('app');
    
    // Setup routes
    router
        .add('/login', async () => {
            app.innerHTML = await renderLoginPage();
            await initLoginPage();
        })
        .add('/register', async () => {
            app.innerHTML = await renderRegisterPage();
            await initRegisterPage();
        })
        .add('/dashboard', async () => {
            // Check auth first
            if (!await checkAuth()) return;
            app.innerHTML = await renderDashboardPage();
            await initDashboardPage();
        })
        .add('/clients', async () => {
            if (!await checkAuth()) return;
            app.innerHTML = await renderClientsPage();
            await initClientsPage();
        })
        .add('/deals', async () => {
            if (!await checkAuth()) return;
            app.innerHTML = await renderDealsPage();
            await initDealsPage();
        })
        .add('/', async () => {
            if (!await checkAuth()) return;
            router.navigate('/dashboard');
        })
        .add('/logout', async () => {
            try {
                await API.auth.logout();
            } catch (e) {}
            localStorage.removeItem('user');
            localStorage.removeItem('csrf_token');
            router.navigate('/login');
        });

    // Handle initial route
    const path = window.location.pathname;
    
    // Check if user is logged in
    const user = localStorage.getItem('user');
    
    if (!user && path !== '/login' && path !== '/register') {
        router.navigate('/login');
    } else if (user && (path === '/login' || path === '/register')) {
        router.navigate('/dashboard');
    } else {
        router.navigate(path);
    }
}

// Check authentication
async function checkAuth() {
    const user = localStorage.getItem('user');
    
    if (!user) {
        router.navigate('/login');
        return false;
    }
    
    try {
        // Verify session with server
        const result = await API.auth.check();
        
        // Update CSRF token if provided
        if (result.data.csrf_token) {
            localStorage.setItem('csrf_token', result.data.csrf_token);
        }
        
        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('csrf_token');
        router.navigate('/login');
        return false;
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Start the app
document.addEventListener('DOMContentLoaded', initApp);
