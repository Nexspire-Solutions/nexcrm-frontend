import apiClient from './axios';

export const authAPI = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },
};

export const clientsAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/clients', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/clients/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/clients', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/clients/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/clients/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get('/clients/stats');
        return response.data;
    },
};

export const projectsAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/projects', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/projects/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/projects', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/projects/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/projects/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get('/projects/stats');
        return response.data;
    },
};

// Helper to transform lead data from camelCase to snake_case for backend
const transformLeadData = (data) => {
    const keyMap = {
        contactName: 'contact_name',
        leadSource: 'lead_source',
        estimatedValue: 'estimated_value',
        assignedTo: 'assigned_to'
    };

    const transformed = {};
    Object.keys(data).forEach(key => {
        const newKey = keyMap[key] || key;
        transformed[newKey] = data[key];
    });
    return transformed;
};

// Helper to transform lead data from snake_case (API) to camelCase (frontend)
const transformLeadFromAPI = (lead) => {
    if (!lead) return lead;
    return {
        ...lead,
        contactName: lead.contact_name,
        leadSource: lead.lead_source,
        estimatedValue: lead.estimated_value,
        assignedTo: lead.assigned_to,
        customerId: lead.customer_id,
        createdAt: lead.created_at,
        updatedAt: lead.updated_at,
        assignedFirstName: lead.assigned_first_name,
        assignedLastName: lead.assigned_last_name
    };
};

export const leadsAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/leads', { params });
        // Transform leads array from snake_case to camelCase
        const leads = (response.data.leads || []).map(transformLeadFromAPI);
        return { ...response.data, leads };
    },

    getById: async (id) => {
        const response = await apiClient.get(`/leads/${id}`);
        // Transform single lead from snake_case to camelCase
        const lead = transformLeadFromAPI(response.data.lead || response.data);
        return { ...response.data, lead };
    },

    create: async (data) => {
        const response = await apiClient.post('/leads', transformLeadData(data));
        return response.data;
    },

    bulkCreate: async (leads) => {
        const response = await apiClient.post('/leads/bulk-create', { leads: leads.map(transformLeadData) });
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/leads/${id}`, transformLeadData(data));
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/leads/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get('/leads/stats');
        return response.data;
    },

    assign: async (id, assignedTo) => {
        const response = await apiClient.patch(`/leads/${id}/assign`, { assignedTo });
        return response.data;
    },

    getAssignableUsers: async () => {
        const response = await apiClient.get('/leads/assignable-users');
        return response.data;
    },

    convertToClient: async (id) => {
        const response = await apiClient.post(`/leads/${id}/convert-to-client`);
        return response.data;
    },
};

// Users API
export const usersAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/users', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/users', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    },

    resetPassword: async (id) => {
        const response = await apiClient.post(`/users/${id}/reset-password`);
        return response.data;
    },
};

export const inquiriesAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/inquiries', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/inquiries/${id}`);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await apiClient.patch(`/inquiries/${id}/status`, { status });
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/inquiries/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get('/inquiries/stats');
        return response.data;
    },

    convertToLead: async (id, data = {}) => {
        const response = await apiClient.post(`/inquiries/${id}/convert-to-lead`, data);
        return response.data;
    },
};

export const templatesAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/email-templates', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/email-templates/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/email-templates', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/email-templates/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/email-templates/${id}`);
        return response.data;
    },

    preview: async (id, sampleData = {}) => {
        const response = await apiClient.post(`/email-templates/${id}/preview`, sampleData);
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get('/email-templates/stats');
        return response.data;
    },

    getVariables: async () => {
        const response = await apiClient.get('/email-templates/variables/list');
        return response.data;
    },

    addVariable: async (data) => {
        const response = await apiClient.post('/email-templates/variables', data);
        return response.data;
    },

    deleteVariable: async (id) => {
        const response = await apiClient.delete(`/email-templates/variables/${id}`);
        return response.data;
    }
};

// Activities API - for tracking notes, calls, status changes etc.
export const activitiesAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/activities', { params });
        return response.data;
    },

    getByEntity: async (entityType, entityId) => {
        const response = await apiClient.get(`/activities/${entityType}/${entityId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/activities', data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/activities/${id}`);
        return response.data;
    },
};

// Dashboard API - for admin dashboard stats
export const dashboardAPI = {
    getStats: async () => {
        const response = await apiClient.get('/dashboard/stats');
        return response.data;
    },

    getRecentActivity: async () => {
        const response = await apiClient.get('/dashboard/recent');
        return response.data;
    },

    getCRMStats: async () => {
        const response = await apiClient.get('/dashboard/crm-stats');
        return response.data;
    },

    getEcommerceStats: async () => {
        const response = await apiClient.get('/dashboard/ecommerce-stats');
        return response.data;
    },

    getIndustryStats: async (industry) => {
        const response = await apiClient.get(`/dashboard/${industry}-stats`);
        return response.data;
    }
};

// Document Templates API
export const documentTemplatesAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/document-templates', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/document-templates/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/document-templates', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/document-templates/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/document-templates/${id}`);
        return response.data;
    },

    preview: async (id, variables) => {
        const response = await apiClient.post(`/document-templates/${id}/preview`, { variables });
        return response.data;
    },

    send: async (templateId, to, subject, variables) => {
        const response = await apiClient.post('/document-templates/send', { templateId, to, subject, variables });
        return response.data;
    },
};

// Email Templates API
export const emailTemplatesAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/email-templates', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/email-templates/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/email-templates', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/email-templates/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/email-templates/${id}`);
        return response.data;
    },

    preview: async (id, data) => {
        const response = await apiClient.post(`/email-templates/${id}/preview`, data);
        return response.data;
    },

    send: async (data) => {
        const response = await apiClient.post('/email-templates/send', data);
        return response.data;
    },
};

// Campaigns API - for email marketing campaigns
export const campaignsAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/campaigns', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/campaigns/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/campaigns', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/campaigns/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/campaigns/${id}`);
        return response.data;
    },

    send: async (id) => {
        const response = await apiClient.post(`/campaigns/${id}/send`);
        return response.data;
    },

    getAnalytics: async (id) => {
        const response = await apiClient.get(`/campaigns/${id}/analytics`);
        return response.data;
    },
};

// Chatbot API - for chatbot responses and settings
export const chatbotAPI = {
    getResponses: async () => {
        const response = await apiClient.get('/chatbot/responses');
        return response.data;
    },

    createResponse: async (data) => {
        const response = await apiClient.post('/chatbot/responses', data);
        return response.data;
    },

    updateResponse: async (id, data) => {
        const response = await apiClient.put(`/chatbot/responses/${id}`, data);
        return response.data;
    },

    deleteResponse: async (id) => {
        const response = await apiClient.delete(`/chatbot/responses/${id}`);
        return response.data;
    },

    getSettings: async () => {
        const response = await apiClient.get('/chatbot/settings');
        return response.data;
    },

    updateSettings: async (data) => {
        const response = await apiClient.put('/chatbot/settings', data);
        return response.data;
    },
};

// SMTP API - for tenant email configuration
export const smtpAPI = {
    getAll: async () => {
        const response = await apiClient.get('/smtp');
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/smtp', data);
        return response.data;
    },

    test: async (data) => {
        const response = await apiClient.post('/smtp/test', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/smtp/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/smtp/${id}`);
        return response.data;
    },

    getStatus: async () => {
        const response = await apiClient.get('/smtp/status');
        return response.data;
    }
};

// Workflow Automation API
export const workflowAPI = {
    getAll: async () => {
        const response = await apiClient.get('/workflows');
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/workflows/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/workflows', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/workflows/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/workflows/${id}`);
        return response.data;
    },

    toggle: async (id) => {
        const response = await apiClient.post(`/workflows/${id}/toggle`);
        return response.data;
    },

    run: async (id, testData) => {
        const response = await apiClient.post(`/workflows/${id}/run`, { testData });
        return response.data;
    },

    getExecutions: async (id, limit = 50) => {
        const response = await apiClient.get(`/workflows/${id}/executions?limit=${limit}`);
        return response.data;
    },

    getExecutionDetails: async (executionId) => {
        const response = await apiClient.get(`/workflows/executions/${executionId}`);
        return response.data;
    },

    getNodeTypes: async () => {
        const response = await apiClient.get('/workflows/meta/nodes');
        return response.data;
    },

    // Nice-to-have features
    duplicate: async (id) => {
        const response = await apiClient.post(`/workflows/${id}/duplicate`);
        return response.data;
    },

    export: async (id) => {
        const response = await apiClient.get(`/workflows/${id}/export`);
        return response.data;
    },

    import: async (workflowData, rename) => {
        const response = await apiClient.post('/workflows/import', { workflow: workflowData, rename });
        return response.data;
    },

    generateWebhook: async (id) => {
        const response = await apiClient.post(`/workflows/${id}/generate-webhook`);
        return response.data;
    },

    getAllExecutions: async (limit = 100, status) => {
        const params = new URLSearchParams({ limit });
        if (status) params.append('status', status);
        const response = await apiClient.get(`/workflows/history/all?${params}`);
        return response.data;
    },

    getTemplates: async () => {
        const response = await apiClient.get('/workflows/meta/templates');
        return response.data;
    },
};

// Push Notifications API - for managing mobile push notifications
export const notificationsAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/notifications', { params });
        return response.data;
    },

    send: async (data) => {
        const response = await apiClient.post('/notifications/send', data);
        return response.data;
    },

    getSettings: async () => {
        const response = await apiClient.get('/notifications/settings');
        return response.data;
    },

    updateSettings: async (data) => {
        const response = await apiClient.put('/notifications/settings', data);
        return response.data;
    },

    getDevices: async () => {
        const response = await apiClient.get('/notifications/devices');
        return response.data;
    },

    trackClick: async (id) => {
        const response = await apiClient.post(`/notifications/${id}/click`);
        return response.data;
    },
};

// Orders API - for managing orders
export const ordersAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/orders', { params });
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get('/orders/stats');
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/orders', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`/orders/${id}`, data);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await apiClient.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/orders/${id}`);
        return response.data;
    }
};

// Returns API - for managing product returns
export const returnsAPI = {
    getAll: async (params = {}) => {
        const response = await apiClient.get('/returns', { params });
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get('/returns/stats');
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`/returns/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await apiClient.post('/returns', data);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await apiClient.patch(`/returns/${id}/status`, { status });
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/returns/${id}`);
        return response.data;
    }
};
