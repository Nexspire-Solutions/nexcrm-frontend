import { createContext, useContext, useCallback, useState } from 'react';

/**
 * Dashboard Refresh Context
 * 
 * Provides a simple event system for triggering dashboard refreshes
 * when data is added/updated/deleted anywhere in the app.
 * 
 * Usage:
 * 1. Wrap app with DashboardRefreshProvider
 * 2. Call triggerRefresh() after any data mutation
 * 3. Dashboard listens to refreshKey to re-fetch data
 */

const DashboardRefreshContext = createContext(null);

export function DashboardRefreshProvider({ children }) {
    // refreshKey changes whenever triggerRefresh is called
    const [refreshKey, setRefreshKey] = useState(0);

    // Track what type of data was updated (for debugging/selective refresh)
    const [lastRefreshType, setLastRefreshType] = useState(null);

    /**
     * Call this after any data mutation to trigger dashboard refresh
     * @param {string} type - Optional type identifier (e.g., 'leads', 'orders', 'properties')
     */
    const triggerRefresh = useCallback((type = 'general') => {
        console.log(`[DashboardRefresh] Triggered by: ${type}`);
        setLastRefreshType(type);
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <DashboardRefreshContext.Provider value={{
            refreshKey,
            triggerRefresh,
            lastRefreshType
        }}>
            {children}
        </DashboardRefreshContext.Provider>
    );
}

/**
 * Hook to access dashboard refresh functionality
 * 
 * @returns {{ refreshKey: number, triggerRefresh: (type?: string) => void, lastRefreshType: string }}
 */
export function useDashboardRefresh() {
    const context = useContext(DashboardRefreshContext);
    if (!context) {
        // Return a no-op if used outside provider (graceful fallback)
        return {
            refreshKey: 0,
            triggerRefresh: () => console.warn('DashboardRefreshProvider not found'),
            lastRefreshType: null
        };
    }
    return context;
}

export default DashboardRefreshContext;
