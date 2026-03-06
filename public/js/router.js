// public/js/router.js - Client-side SPA Router

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            this.navigate(window.location.pathname, false);
        });
    }

    add(path, handler) {
        this.routes[path] = handler;
        return this;
    }

    navigate(path, pushState = true) {
        if (pushState) {
            window.history.pushState({}, '', path);
        }
        this.currentRoute = path;
        this.resolve(path);
    }

    resolve(path) {
        // Normalize path
        path = path === '/' ? '/dashboard' : path;
        
        // Find matching route
        let handler = this.routes[path];
        
        if (!handler) {
            // Try to find parameterized route
            for (const [routePath, routeHandler] of Object.entries(this.routes)) {
                const params = this.matchRoute(routePath, path);
                if (params !== null) {
                    handler = () => routeHandler(params);
                    break;
                }
            }
        }

        if (handler) {
            handler();
        } else {
            // Default to dashboard
            if (this.routes['/dashboard']) {
                this.routes['/dashboard']();
            }
        }
    }

    matchRoute(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        
        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }

        return params;
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Router instance
const router = new Router();

// Export for use
export default router;
