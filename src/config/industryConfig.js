/**
 * Industry Configuration - Frontend
 * 
 * Centralized configuration for industry-specific routes and labels.
 * Mirrors the backend INDUSTRY_ENTITY_CONFIG for consistency.
 */

export const INDUSTRY_ROUTES = {
    legal: {
        defaultDashboard: '/legal-dashboard',
        clientList: '/legal-clients',
        clientDetail: (id) => `/legal-clients/${id}`,
        convertButtonLabel: 'Convert to Legal Client',
        entityLabel: 'Legal Client'
    },
    healthcare: {
        defaultDashboard: '/patients',
        clientList: '/patients',
        clientDetail: (id) => `/patients/${id}`,
        convertButtonLabel: 'Convert to Patient',
        entityLabel: 'Patient'
    },
    realestate: {
        defaultDashboard: '/realestate-dashboard',
        clientList: '/leads/customers',
        clientDetail: (id) => `/leads/customers/${id}`,
        convertButtonLabel: 'Convert to Customer',
        entityLabel: 'Customer'
    },
    services: {
        defaultDashboard: '/booking-calendar',
        clientList: '/clients',
        clientDetail: (id) => `/clients/${id}`,
        convertButtonLabel: 'Convert to Client',
        entityLabel: 'Client'
    },
    fitness: {
        defaultDashboard: '/members',
        clientList: '/members',
        clientDetail: (id) => `/members/${id}`,
        convertButtonLabel: 'Convert to Member',
        entityLabel: 'Member'
    },
    ecommerce: {
        defaultDashboard: '/dashboard',
        clientList: '/customers',
        clientDetail: (id) => `/customers/${id}`,
        convertButtonLabel: 'Convert to Customer',
        entityLabel: 'Customer'
    },
    hospitality: {
        defaultDashboard: '/hospitality-dashboard',
        clientList: '/guests',
        clientDetail: (id) => `/guests/${id}`,
        convertButtonLabel: 'Convert to Guest',
        entityLabel: 'Guest'
    },
    travel: {
        defaultDashboard: '/hospitality-dashboard',
        clientList: '/guests',
        clientDetail: (id) => `/guests/${id}`,
        convertButtonLabel: 'Convert to Traveler',
        entityLabel: 'Traveler'
    },
    education: {
        defaultDashboard: '/students',
        clientList: '/students',
        clientDetail: (id) => `/students/${id}`,
        convertButtonLabel: 'Convert to Student',
        entityLabel: 'Student'
    },
    // Default configuration
    general: {
        defaultDashboard: '/dashboard',
        clientList: '/leads/customers',
        clientDetail: (id) => `/leads/customers/${id}`,
        convertButtonLabel: 'Convert to Customer',
        entityLabel: 'Customer'
    }
};

/**
 * Get industry-specific route configuration
 * @param {string} industry - Industry type (legal, healthcare, etc.)
 * @returns {Object} Route configuration for the industry
 */
export const getIndustryRoutes = (industry) => {
    return INDUSTRY_ROUTES[industry] || INDUSTRY_ROUTES.general;
};

/**
 * Get default dashboard path for an industry
 * @param {string} industry - Industry type
 * @returns {string} Dashboard path
 */
export const getDefaultDashboard = (industry) => {
    return getIndustryRoutes(industry).defaultDashboard;
};

/**
 * Get client detail path for an industry
 * @param {string} industry - Industry type
 * @param {number|string} clientId - Client ID
 * @returns {string} Client detail path
 */
export const getClientDetailPath = (industry, clientId) => {
    return getIndustryRoutes(industry).clientDetail(clientId);
};

export default INDUSTRY_ROUTES;
