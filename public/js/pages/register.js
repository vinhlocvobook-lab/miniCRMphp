// public/js/pages/register.js - Register Page

import API from '../api.js';
import router from '../router.js';
import { toast } from '../components/toast.js';

export async function renderRegisterPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1 class="auth-title">Create Account</h1>
                    <p class="auth-subtitle">Start managing your CRM today</p>
                </div>
                <form id="register-form">
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" name="name" placeholder="Your name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" placeholder="you@example.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" name="password" 
                               placeholder="At least 6 characters" required minlength="6">
                    </div>
                    <button type="submit" class="btn btn-primary w-full" id="register-btn">
                        Create Account
                    </button>
                </form>
                <div class="auth-footer">
                    Already have an account? <a href="/login" data-nav="login">Sign in</a>
                </div>
            </div>
        </div>
    `;
}

export async function initRegisterPage() {
    const form = document.getElementById('register-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('register-btn');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Creating account...';
        
        try {
            const formData = new FormData(form);
            const result = await API.auth.register(
                formData.get('name'),
                formData.get('email'),
                formData.get('password')
            );
            
            localStorage.setItem('user', JSON.stringify(result.data.user));
            localStorage.setItem('csrf_token', result.data.csrf_token || '');
            
            toast.success('Account created successfully!');
            router.navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Registration failed');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

export default { renderRegisterPage, initRegisterPage };
