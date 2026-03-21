import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import permissionsAPI from '../api/permissions';

const PermissionsContext = createContext(null);

// Comprehensive default permissions matrix — kept in sync with backend DEFAULT_PERMISSIONS
const defaultPermissions = {
    admin: {
        dashboard: ['read'],
        employees: ['create', 'read', 'update', 'delete'],
        users: ['create', 'read', 'update', 'delete'],
        inquiries: ['create', 'read', 'update', 'delete'],
        leads: ['create', 'read', 'update', 'delete'],
        communications: ['create', 'read', 'update', 'delete'],
        automation: ['create', 'read', 'update', 'delete'],
        // Commerce
        products: ['create', 'read', 'update', 'delete'],
        orders: ['create', 'read', 'update', 'delete'],
        inventory: ['create', 'read', 'update', 'delete'],
        returns: ['create', 'read', 'update', 'delete'],
        shipping: ['create', 'read', 'update', 'delete'],
        vendors: ['create', 'read', 'update', 'delete'],
        coupons: ['create', 'read', 'update', 'delete'],
        reviews: ['create', 'read', 'update', 'delete'],
        // Real Estate
        properties: ['create', 'read', 'update', 'delete'],
        listings: ['create', 'read', 'update', 'delete'],
        viewings: ['create', 'read', 'update', 'delete'],
        // Healthcare
        patients: ['create', 'read', 'update', 'delete'],
        appointments: ['create', 'read', 'update', 'delete'],
        prescriptions: ['create', 'read', 'update', 'delete'],
        // Hospitality
        rooms: ['create', 'read', 'update', 'delete'],
        reservations: ['create', 'read', 'update', 'delete'],
        guests: ['create', 'read', 'update', 'delete'],
        housekeeping: ['create', 'read', 'update', 'delete'],
        // Travel
        tours: ['create', 'read', 'update', 'delete'],
        tour_bookings: ['create', 'read', 'update', 'delete'],
        destinations: ['create', 'read', 'update', 'delete'],
        // Fitness
        gym_members: ['create', 'read', 'update', 'delete'],
        gym_classes: ['create', 'read', 'update', 'delete'],
        memberships: ['create', 'read', 'update', 'delete'],
        // Legal
        legal_cases: ['create', 'read', 'update', 'delete'],
        legal_clients: ['create', 'read', 'update', 'delete'],
        case_documents: ['create', 'read', 'update', 'delete'],
        billing: ['create', 'read', 'update', 'delete'],
        // Manufacturing
        production: ['create', 'read', 'update', 'delete'],
        work_orders: ['create', 'read', 'update', 'delete'],
        suppliers: ['create', 'read', 'update', 'delete'],
        material_movements: ['create', 'read', 'update', 'delete'],
        // Logistics
        shipments: ['create', 'read', 'update', 'delete'],
        vehicles: ['create', 'read', 'update', 'delete'],
        tracking: ['create', 'read', 'update', 'delete'],
        // Restaurant
        menu: ['create', 'read', 'update', 'delete'],
        tables: ['create', 'read', 'update', 'delete'],
        kitchen: ['create', 'read', 'update', 'delete'],
        // Education
        courses: ['create', 'read', 'update', 'delete'],
        students: ['create', 'read', 'update', 'delete'],
        enrollments: ['create', 'read', 'update', 'delete'],
        // Services / Salon
        services: ['create', 'read', 'update', 'delete'],
        clients: ['create', 'read', 'update', 'delete'],
        documents: ['create', 'read', 'update', 'delete'],
        bookings: ['create', 'read', 'update', 'delete'],
        invoices: ['create', 'read', 'update', 'delete'],
    },
    manager: {
        dashboard: ['read'],
        employees: ['read', 'update'],
        users: [],
        inquiries: ['create', 'read', 'update'],
        leads: ['create', 'read', 'update'],
        communications: ['create', 'read', 'update'],
        automation: ['read'],
        products: ['create', 'read', 'update'],
        orders: ['create', 'read', 'update'],
        inventory: ['read', 'update'],
        patients: ['create', 'read', 'update'],
        appointments: ['create', 'read', 'update'],
        rooms: ['create', 'read', 'update'],
        reservations: ['create', 'read', 'update'],
        guests: ['create', 'read', 'update'],
        housekeeping: ['create', 'read', 'update'],
        tours: ['create', 'read', 'update'],
        tour_bookings: ['create', 'read', 'update'],
        destinations: ['create', 'read', 'update'],
        gym_members: ['create', 'read', 'update'],
        gym_classes: ['create', 'read', 'update'],
        legal_cases: ['create', 'read', 'update'],
        legal_clients: ['create', 'read', 'update'],
        billing: ['read', 'update'],
        shipments: ['create', 'read', 'update'],
        menu: ['create', 'read', 'update'],
        courses: ['create', 'read', 'update'],
        students: ['create', 'read', 'update'],
        clients: ['create', 'read', 'update'],
        services: ['create', 'read', 'update'],
        bookings: ['create', 'read', 'update'],
    },
    sales_operator: {
        dashboard: ['read'],
        employees: [],
        users: [],
        inquiries: ['read', 'update'],
        leads: ['create', 'read', 'update'],
        communications: ['read'],
        orders: ['read', 'update'],
        reservations: ['read', 'update'],
        guests: ['read'],
        rooms: ['read'],
        tours: ['read'],
        tour_bookings: ['read', 'update'],
        appointments: ['read', 'update'],
        bookings: ['read', 'update'],
        shipments: ['read'],
    },
    user: {
        dashboard: ['read'],
        employees: [],
        users: [],
        inquiries: ['read'],
        leads: ['read'],
        communications: [],
    },
};

export const PermissionsProvider = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState(defaultPermissions);

    // Initial fetch from DB — runs whenever user logs in/out
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setLoading(true);
                const response = await permissionsAPI.getPermissions();
                if (response.data && Object.keys(response.data).length > 0) {
                    // Merge fetched permissions with defaults so new modules always have a fallback
                    const merged = { ...defaultPermissions };
                    Object.keys(response.data).forEach(role => {
                        merged[role] = { ...defaultPermissions[role], ...response.data[role] };
                    });
                    setPermissions(merged);
                    localStorage.setItem('role_permissions', JSON.stringify(merged));
                } else {
                    const saved = localStorage.getItem('role_permissions');
                    if (saved) {
                        try { setPermissions(JSON.parse(saved)); } catch (_) { /* ignore */ }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch permissions:', err);
                // Fall back to localStorage, then hardcoded defaults
                const saved = localStorage.getItem('role_permissions');
                if (saved) {
                    try { setPermissions(JSON.parse(saved)); } catch (_) { /* ignore */ }
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPermissions();
        } else {
            setLoading(false);
        }
    }, [user]);

    // Save to DB and localStorage
    const updatePermissions = async (newPermissions) => {
        try {
            // Optimistic update
            setPermissions(newPermissions);
            localStorage.setItem('role_permissions', JSON.stringify(newPermissions));

            // Persist each role to backend
            const promises = Object.keys(newPermissions).map(role =>
                permissionsAPI.updateRolePermissions(role, newPermissions[role])
            );
            await Promise.all(promises);
            return true;
        } catch (err) {
            console.error('Failed to update permissions in DB:', err);
            throw err;
        }
    };

    /**
     * Check if the current user has a specific permission on a module.
     * @param {string} module - Module key e.g. 'leads'
     * @param {string} action - Action e.g. 'read', 'create', 'update', 'delete'
     */
    const hasPermission = (module, action = 'read') => {
        if (!user) return false;

        const userRole = user.role || 'user';
        const rolePermissions = permissions[userRole];

        if (!rolePermissions) return false;

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
