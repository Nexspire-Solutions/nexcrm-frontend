import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import permissionsAPI from '../api/permissions';

const PermissionsContext = createContext(null);

// Default permissions matrix
const defaultPermissions = {
    admin: {
        dashboard: ['read'], employees: ['create', 'read', 'update', 'delete'], users: ['create', 'read', 'update', 'delete'],
        inquiries: ['create', 'read', 'update', 'delete'], leads: ['create', 'read', 'update', 'delete'], communications: ['create', 'read', 'update', 'delete'],
        automation: ['create', 'read', 'update', 'delete'],
        // Commerce
        products: ['create', 'read', 'update', 'delete'], orders: ['create', 'read', 'update', 'delete'],
        // Add defaults for all typical admin access
        properties: ['create', 'read', 'update', 'delete'], viewings: ['create', 'read', 'update', 'delete'],
        patients: ['create', 'read', 'update', 'delete'], appointments: ['create', 'read', 'update', 'delete']
    },
    manager: {
        dashboard: ['read'], employees: ['read', 'update'], users: [],
        inquiries: ['create', 'read', 'update'], leads: ['create', 'read', 'update'], communications: ['create', 'read', 'update'],
        automation: ['read'],
        products: ['create', 'read', 'update'], orders: ['create', 'read', 'update']
    },
    sales_operator: {
        dashboard: ['read'], employees: [], users: [],
        inquiries: ['read', 'update'], leads: ['create', 'read', 'update'], communications: ['read'],
        orders: ['read', 'update']
    },
    user: {
        dashboard: ['read'], employees: [], users: [],
        inquiries: ['read'], leads: ['read'], communications: []
    }
};



export const PermissionsProvider = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState(defaultPermissions);

    // Initial fetch from DB
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setLoading(true);
                const response = await permissionsAPI.getPermissions();
                if (response.data && Object.keys(response.data).length > 0) {
                    setPermissions(response.data);
                    localStorage.setItem('role_permissions', JSON.stringify(response.data));
                } else {
                    // If DB is empty, maybe should seed it? For now use defaults/local
                    const saved = localStorage.getItem('role_permissions');
                    if (saved) setPermissions(JSON.parse(saved));
                }
            } catch (err) {
                console.error('Failed to fetch permissions:', err);
                const saved = localStorage.getItem('role_permissions');
                if (saved) setPermissions(JSON.parse(saved));
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPermissions();
        } else {
            // If no user, maybe still fetch or just wait? 
            // Ideally we need permissions even before login? No, permissions are role based.
            // But the context is used inside AuthProvider, so user might be null initially.
            setLoading(false);
        }
    }, [user]);

    // Save to DB and local storage
    const updatePermissions = async (newPermissions) => {
        try {
            // Update local state first for optimistic UI
            setPermissions(newPermissions);
            localStorage.setItem('role_permissions', JSON.stringify(newPermissions));

            // Update backend for each role
            const promises = Object.keys(newPermissions).map(role =>
                permissionsAPI.updateRolePermissions(role, newPermissions[role])
            );
            await Promise.all(promises);
            return true;
        } catch (err) {
            console.error('Failed to update permissions in DB:', err);
            // Revert? Or just warn.
            throw err;
        }
    };

    /**
     * Check if the current user has a specific permission
     * ...
     */
    const hasPermission = (module, action = 'read') => {
        // ... (keep existing logic)
        if (!user) return false;

        const userRole = user.role || 'user';
        const rolePermissions = permissions[userRole]; // Usage permissions from state

        if (!rolePermissions) return false;

        // Use default if DB didn't return anything for this user's role yet (edge case)
        // But we initialized permissions with defaultPermissions so it should be fine.

        const modulePermissions = rolePermissions[module];
        if (!modulePermissions) return false;

        return modulePermissions.includes(action);
    };

    return (
        <PermissionsContext.Provider value={{ permissions, updatePermissions, hasPermission, defaultPermissions, loading }}>
            {children}
        </PermissionsContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissions must be used within PermissionsProvider');
    }
    return context;
};
