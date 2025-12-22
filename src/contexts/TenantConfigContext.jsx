/**
 * Tenant Config Context
 * 
 * Provides tenant configuration including enabled modules, features, and limits.
 * Used for dynamic navigation and feature gating in the frontend.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';

const TenantConfigContext = createContext(null);

// Default config for development
const DEFAULT_CONFIG = {
    industry: 'general',
    plan: 'starter',
    modules: [
        'dashboard',
        'leads',
        'clients',
        'inquiries',
        'users',
        'documents',
        'communications',
        'activities'
    ],
    features: ['basic_reports', 'email_templates', 'in_app_notifications'],
    limits: {
        users: { limit: 3, used: 0, remaining: 3 },
        leads: { limit: 500, used: 0, remaining: 500 },
        clients: { limit: 100, used: 0, remaining: 100 }
    },
    communication: {
        emails_per_month: 500,
        bulk_mail_limit: 0,
        team_chat: false
    }
};

export const TenantConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await apiClient.get('/config');
            if (response.data?.success && response.data?.config) {
                setConfig(response.data.config);
            }
        } catch (err) {
            console.warn('[TenantConfig] Failed to load config, using defaults:', err.message);
            // Keep using default config if API fails
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshConfig = () => {
        setLoading(true);
        loadConfig();
    };

    /**
     * Check if a module is enabled
     */
    const hasModule = (moduleName) => {
        return config.modules?.includes(moduleName) || false;
    };

    /**
     * Check if a feature is enabled
     */
    const hasFeature = (featureName) => {
        const features = config.features || [];
        return features.includes('*') || features.includes(featureName);
    };

    /**
     * Get limit for a resource
     */
    const getLimit = (resource) => {
        return config.limits?.[resource] || { limit: 0, used: 0, remaining: 0 };
    };

    /**
     * Check if user can create more of a resource
     */
    const canCreate = (resource) => {
        const limit = getLimit(resource);
        return limit.limit === -1 || limit.remaining > 0;
    };

    /**
     * Get industry type
     */
    const getIndustry = () => config.industry || 'general';

    /**
     * Get plan type
     */
    const getPlan = () => config.plan || 'starter';

    const value = {
        config,
        loading,
        error,
        refreshConfig,
        hasModule,
        hasFeature,
        getLimit,
        canCreate,
        getIndustry,
        getPlan
    };

    return (
        <TenantConfigContext.Provider value={value}>
            {children}
        </TenantConfigContext.Provider>
    );
};

export const useTenantConfig = () => {
    const context = useContext(TenantConfigContext);
    if (!context) {
        throw new Error('useTenantConfig must be used within TenantConfigProvider');
    }
    return context;
};

/**
 * Higher-order component for feature gating
 */
export const withFeature = (Component, requiredFeature) => {
    return function FeatureGatedComponent(props) {
        const { hasFeature, loading } = useTenantConfig();

        if (loading) {
            return <div>Loading...</div>;
        }

        if (!hasFeature(requiredFeature)) {
            return (
                <div className="feature-locked">
                    <h3>Feature Not Available</h3>
                    <p>This feature is not available on your current plan.</p>
                    <button onClick={() => window.location.href = '/settings/plans'}>
                        Upgrade Plan
                    </button>
                </div>
            );
        }

        return <Component {...props} />;
    };
};

/**
 * Hook for checking module access
 */
export const useModuleAccess = (moduleName) => {
    const { hasModule, loading } = useTenantConfig();
    return {
        hasAccess: hasModule(moduleName),
        loading
    };
};

export default TenantConfigContext;
