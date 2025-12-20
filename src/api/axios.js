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

    // 3. Extract from subdomain pattern: {tenant}-crm.nexspiresolutions.co.in
    const hostname = window.location.hostname;

    // Match pattern: tenant-crm.nexspiresolutions.co.in
    const crmMatch = hostname.match(/^(.+)-crm\.nexspiresolutions\.co\.in$/);
    if (crmMatch && crmMatch[1]) {
        const tenant = crmMatch[1];
        localStorage.setItem('nexcrm_tenant', tenant);
        return tenant;
    }

    // Legacy patterns
    if (hostname.includes('.crm.nexspiresolutions.co.in') || hostname.includes('.nexcrm.')) {
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'crm' && subdomain !== 'app' && subdomain !== 'www') {
            localStorage.setItem('nexcrm_tenant', subdomain);
            return subdomain;
        }
    }

    return null;
};

// Build API URL based on tenant
const getApiUrl = () => {
    const tenant = getTenant();

    // Development mode
    if (import.meta.env.DEV) {
        // Use environment variable if set
        if (import.meta.env.VITE_API_URL) {
            return import.meta.env.VITE_API_URL;
        }
        // Default to localhost
        return 'http://localhost:3001/api';
    }

    // Production - use tenant-specific API
    if (tenant) {
        return `https://${tenant}-crm-api.nexspiresolutions.co.in/api`;
    }

    // Fallback
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
        if (error.response?.status === 401) {
            // Token expired or invalid
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
    setTenant: (tenant) => {
        localStorage.setItem('nexcrm_tenant', tenant);
    },
    clearTenant: () => {
        localStorage.removeItem('nexcrm_tenant');
    }
};

export default apiClient;