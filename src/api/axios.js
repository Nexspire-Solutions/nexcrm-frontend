import axios from 'axios';

/**
 * NexCRM Dynamic API Client
 * 
 * Determines the API URL based on:
 * 1. URL parameter (?tenant=acme)
 * 2. localStorage (tenant)
 * 3. Subdomain detection (acme.crm.nexspiresolutions.co.in)
 */

// Get tenant from various sources
const getTenant = () => {
    // 1. Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const urlTenant = urlParams.get('tenant');
    if (urlTenant) {
        localStorage.setItem('nexcrm_tenant', urlTenant);
        return urlTenant;
    }

    // 2. Check localStorage
    const storedTenant = localStorage.getItem('nexcrm_tenant');
    if (storedTenant) {
        return storedTenant;
    }

    // 3. Extract from subdomain
    // Pattern: tenant-crm.nexspiresolutions.co.in -> extract "tenant"
    const hostname = window.location.hostname;

    // Match pattern: xxx-crm.nexspiresolutions.co.in
    const dashCrmMatch = hostname.match(/^([a-z0-9-]+)-crm\.nexspiresolutions\.co\.in$/);
    if (dashCrmMatch) {
        const tenant = dashCrmMatch[1];
        localStorage.setItem('nexcrm_tenant', tenant);
        return tenant;
    }

    // Legacy pattern: tenant.crm.nexspiresolutions.co.in
    if (hostname.includes('.crm.nexspiresolutions.co.in') || hostname.includes('.nexcrm.')) {
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'crm' && subdomain !== 'app' && subdomain !== 'www') {
            localStorage.setItem('nexcrm_tenant', subdomain);
            return subdomain;
        }
    }

    return null;
};

// Build API URL based on tenant or custom domain
const getApiUrl = () => {
    const tenant = getTenant();
    const hostname = window.location.hostname;

    // Development mode
    if (import.meta.env.DEV) {
        if (import.meta.env.VITE_API_URL) {
            return import.meta.env.VITE_API_URL;
        }
        return 'http://localhost:3001/api';
    }

    // Check for custom API URL (set via meta tag or localStorage)
    // This is used when accessing CRM via custom domain like crm.userbrand.com
    const customApiMeta = document.querySelector('meta[name="nexcrm-api-url"]');
    if (customApiMeta) {
        return customApiMeta.getAttribute('content');
    }
    const customApiUrl = localStorage.getItem('nexcrm_custom_api_url');
    if (customApiUrl) {
        return customApiUrl;
    }

    // If on a known NexSpire subdomain, use standard pattern
    if (hostname.endsWith('nexspiresolutions.co.in') && tenant) {
        return `https://${tenant}-crm-api.nexspiresolutions.co.in/api`;
    }

    // Custom domain fallback: assume API is at api.{same root domain}
    // e.g., crm.userbrand.com -> api.userbrand.com
    if (!hostname.endsWith('nexspiresolutions.co.in')) {
        // Extract root domain (e.g., "yourbrand.com" from "crm.yourbrand.com")
        const parts = hostname.split('.');
        if (parts.length >= 2) {
            const rootDomain = parts.slice(-2).join('.');
            return `https://api.${rootDomain}/api`;
        }
    }

    // Final fallback
    return import.meta.env.VITE_API_URL || '/api';
};

const apiClient = axios.create({
    baseURL: getApiUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Don't redirect on 401 for auth endpoints (login, etc.)
        // These should fail gracefully and let the UI handle the error
        const isAuthEndpoint = error.config?.url?.includes('/auth/');

        if (error.response?.status === 401 && !isAuthEndpoint) {
            // Token expired or invalid - but NOT for auth endpoints
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login, keeping tenant context
            const tenant = localStorage.getItem('nexcrm_tenant');
            const loginUrl = tenant ? `/login?tenant=${tenant}` : '/login';
            window.location.href = loginUrl;
        }
        return Promise.reject(error);
    }
);

// Export tenant utility functions
export const tenantUtils = {
    getTenant,
    getApiUrl,
    // Get base URL for media/images (without /api suffix)
    getMediaBaseUrl: () => {
        const apiUrl = getApiUrl();
        return apiUrl.replace(/\/api\/?$/, '');
    },
    setTenant: (tenant) => {
        localStorage.setItem('nexcrm_tenant', tenant);
    },
    clearTenant: () => {
        localStorage.removeItem('nexcrm_tenant');
    }
};

export default apiClient;