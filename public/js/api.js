// public/js/api.js - API Client

const API = {
    baseUrl: '/api',

    async request(method, endpoint, data = null, headers = {}) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        // Add CSRF token to requests
        const csrfToken = localStorage.getItem('csrf_token');
        if (csrfToken) {
            options.headers['X-CSRF-Token'] = csrfToken;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Request failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request('GET', endpoint);
    },

    post(endpoint, data) {
        return this.request('POST', endpoint, data);
    },

    put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    },

    patch(endpoint, data) {
        return this.request('PATCH', endpoint, data);
    },

    delete(endpoint) {
        return this.request('DELETE', endpoint);
    },

    // Auth endpoints
    auth: {
        login(email, password) {
            return API.post('/auth/login', { email, password });
        },
        register(name, email, password) {
            return API.post('/auth/register', { name, email, password });
        },
        logout() {
            return API.post('/auth/logout');
        },
        check() {
            return API.get('/auth/check');
        },
        csrfToken() {
            return API.get('/auth/csrf-token');
        }
    },

    // Dashboard endpoints
    dashboard: {
        get() {
            return API.get('/dashboard');
        }
    },

    // Client endpoints
    clients: {
        getAll(search = null) {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            return API.get(`/clients${query}`);
        },
        get(id) {
            return API.get(`/clients/${id}`);
        },
        create(data) {
            return API.post('/clients', data);
        },
        update(id, data) {
            return API.put(`/clients/${id}`, data);
        },
        delete(id) {
            return API.delete(`/clients/${id}`);
        }
    },

    // Deal endpoints
    deals: {
        getAll() {
            return API.get('/deals');
        },
        get(id) {
            return API.get(`/deals/${id}`);
        },
        create(data) {
            return API.post('/deals', data);
        },
        update(id, data) {
            return API.put(`/deals/${id}`, data);
        },
        updateStage(id, stage) {
            return API.patch(`/deals/${id}/stage`, { stage });
        },
        delete(id) {
            return API.delete(`/deals/${id}`);
        }
    }
};

export default API;
