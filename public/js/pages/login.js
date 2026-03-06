// public/js/pages/login.js - Login Page

import API from '../api.js';
import router from '../router.js';
import { toast } from '../components/toast.js';

export async function renderLoginPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1 class="auth-title">Welcome Back</h1>
                    <p class="auth-subtitle">Sign in to your Mini CRM account</p>
                </div>
                <form id="login-form">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" 
                               placeholder="demo@minicrm.com" value="demo@minicrm.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" name="password" 
                               placeholder="demo1234" value="demo1234" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-full" id="login-btn">
                        Sign In
                    </button>
                </form>
                <div class="auth-footer">
                    Don't have an account? <a href="/register" data-nav="register">Sign up</a>
                </div>
            </div>
        </div>
    `;
}

export async function initLoginPage() {
    const form = document.getElementById('login-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('login-btn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Signing in...';
        
        try {
            const formData = new FormData(form);
            const result = await API.auth.login(
                formData.get('email'),
                formData.get('password')
            );
            
            localStorage.setItem('user', JSON.stringify(result.data.user));
            localStorage.setItem('csrf_token', result.data.csrf_token || '');
            
            toast.success('Welcome back!');
            router.navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Login failed');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

export default { renderLoginPage, initLoginPage };
