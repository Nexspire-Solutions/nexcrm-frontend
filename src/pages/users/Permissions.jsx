import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import { usePermissions } from '../../contexts/PermissionsContext';

const roles = [
    { id: 'admin', name: 'Admin', description: 'Full system access' },
    { id: 'manager', name: 'Manager', description: 'Team and project management' },
    { id: 'sales_operator', name: 'Sales Operator', description: 'Sales and lead management' },
    { id: 'user', name: 'User', description: 'Basic read access' }
];

/**
 * All modules with their associated industries.
 * 'all' = core module available to every tenant.
 * Other strings must match the industry keys returned by getIndustry().
 * Kept in sync with featureConfig.js INDUSTRY_MODULES.
 */
const allModules = [
    // ─── Core (all tenants) ───────────────────────────────────────────────
    { id: 'dashboard',      name: 'Dashboard',          industries: ['all'] },
    { id: 'employees',      name: 'Employees',          industries: ['all'] },
    { id: 'users',          name: 'Roles & Permissions',industries: ['all'] },
    { id: 'leads',          name: 'Leads',              industries: ['all'] },
    { id: 'inquiries',      name: 'Inquiries',          industries: ['all'] },
    { id: 'communications', name: 'Communications',     industries: ['all'] },
    { id: 'automation',     name: 'Automation',         industries: ['all'] },
    { id: 'documents',      name: 'Documents',          industries: ['all', 'legal', 'services'] },
    { id: 'clients',        name: 'Clients',            industries: ['all', 'services', 'consulting', 'legal'] },
    { id: 'invoices',       name: 'Invoices',           industries: ['manufacturing', 'logistics', 'ecommerce', 'legal', 'services'] },

    // ─── E-Commerce / Retail ─────────────────────────────────────────────
    { id: 'products',       name: 'Products',           industries: ['ecommerce', 'retail'] },
    { id: 'orders',         name: 'Orders',             industries: ['ecommerce', 'retail', 'manufacturing', 'restaurant'] },
    { id: 'inventory',      name: 'Inventory',          industries: ['ecommerce', 'retail', 'manufacturing', 'logistics'] },
    { id: 'returns',        name: 'Returns',            industries: ['ecommerce', 'retail'] },
    { id: 'shipping',       name: 'Shipping',           industries: ['ecommerce', 'logistics'] },
    { id: 'vendors',        name: 'Vendors',            industries: ['ecommerce', 'retail', 'manufacturing'] },
    { id: 'coupons',        name: 'Coupons',            industries: ['ecommerce'] },
    { id: 'reviews',        name: 'Reviews',            industries: ['ecommerce'] },
    { id: 'cms',            name: 'CMS / Storefront',   industries: ['ecommerce'] },

    // ─── Real Estate ─────────────────────────────────────────────────────
    { id: 'properties',     name: 'Properties',         industries: ['realestate'] },
    { id: 'listings',       name: 'Listings',           industries: ['realestate'] },
    { id: 'viewings',       name: 'Viewings',           industries: ['realestate'] },

    // ─── Services / Consulting / Salon ───────────────────────────────────
    { id: 'appointments',   name: 'Appointments',       industries: ['healthcare', 'salon', 'services', 'consulting', 'fitness'] },
    { id: 'services',       name: 'Services',           industries: ['salon', 'services', 'consulting'] },
    { id: 'bookings',       name: 'Bookings',           industries: ['salon', 'services', 'fitness', 'travel', 'hospitality'] },
    { id: 'billing',        name: 'Billing',            industries: ['legal', 'services', 'healthcare'] },

    // ─── Healthcare ──────────────────────────────────────────────────────
    { id: 'patients',       name: 'Patients',           industries: ['healthcare'] },
    { id: 'prescriptions',  name: 'Prescriptions',      industries: ['healthcare'] },

    // ─── Education ───────────────────────────────────────────────────────
    { id: 'courses',        name: 'Courses',            industries: ['education'] },
    { id: 'students',       name: 'Students',           industries: ['education'] },
    { id: 'enrollments',    name: 'Enrollments',        industries: ['education'] },

    // ─── Hospitality (Hotels) ────────────────────────────────────────────
    { id: 'rooms',          name: 'Rooms',              industries: ['hospitality'] },
    { id: 'reservations',   name: 'Reservations',       industries: ['hospitality', 'restaurant'] },
    { id: 'guests',         name: 'Guests',             industries: ['hospitality', 'travel'] },
    { id: 'housekeeping',   name: 'Housekeeping',       industries: ['hospitality'] },

    // ─── Travel / Tours ──────────────────────────────────────────────────
    { id: 'tours',          name: 'Tours',              industries: ['travel', 'hospitality'] },
    { id: 'tour_bookings',  name: 'Tour Bookings',      industries: ['travel', 'hospitality'] },
    { id: 'destinations',   name: 'Destinations',       industries: ['travel', 'hospitality'] },

    // ─── Fitness / Gym ───────────────────────────────────────────────────
    { id: 'gym_members',    name: 'Members',            industries: ['fitness'] },
    { id: 'gym_classes',    name: 'Classes',            industries: ['fitness'] },
    { id: 'memberships',    name: 'Memberships',        industries: ['fitness'] },

    // ─── Legal / Law Firm ────────────────────────────────────────────────
    { id: 'legal_cases',    name: 'Cases',              industries: ['legal'] },
    { id: 'legal_clients',  name: 'Legal Clients',      industries: ['legal'] },
    { id: 'case_documents', name: 'Case Documents',     industries: ['legal'] },

    // ─── Manufacturing ───────────────────────────────────────────────────
    { id: 'production',              name: 'Production Orders',    industries: ['manufacturing'] },
    { id: 'manufactured_products',   name: 'Manufactured Products',industries: ['manufacturing'] },
    { id: 'work_orders',             name: 'Work Orders',          industries: ['manufacturing'] },
    { id: 'raw_materials',           name: 'Raw Materials',        industries: ['manufacturing'] },
    { id: 'suppliers',               name: 'Suppliers',            industries: ['manufacturing', 'ecommerce'] },
    { id: 'material_movements',      name: 'Material Movements',   industries: ['manufacturing'] },
    { id: 'quality_checks',          name: 'Quality Control',      industries: ['manufacturing'] },
    { id: 'manufacturing_inventory', name: 'Manufacturing Inventory', industries: ['manufacturing'] },

    // ─── Logistics / Transport ───────────────────────────────────────────
    { id: 'shipments',      name: 'Shipments',          industries: ['logistics', 'ecommerce'] },
    { id: 'vehicles',       name: 'Vehicles',           industries: ['logistics'] },
    { id: 'tracking',       name: 'Tracking',           industries: ['logistics'] },

    // ─── Restaurant / Food ───────────────────────────────────────────────
    { id: 'menu',           name: 'Menu',               industries: ['restaurant'] },
    { id: 'tables',         name: 'Tables',             industries: ['restaurant'] },
    { id: 'kitchen',        name: 'Kitchen Orders',     industries: ['restaurant'] },
];

const defaultPermissions = {
    admin: {},
    manager: {},
    sales_operator: {},
    user: {}
};

export default function Permissions() {
    const { getIndustry } = useTenantConfig();
    const { permissions, updatePermissions } = usePermissions();
    const currentIndustry = getIndustry();

    const [localPermissions, setLocalPermissions] = useState(permissions);
    const [selectedRole, setSelectedRole] = useState('admin');
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state whenever permissions change externally (e.g. page reload)
    useEffect(() => {
        setLocalPermissions(permissions);
    }, [permissions]);

    // Filter modules to only show those relevant to this tenant's industry
    const modules = allModules.filter(m =>
        m.industries.includes('all') ||
        m.industries.includes(currentIndustry) ||
        currentIndustry === 'all' ||
        (currentIndustry === 'general' && m.industries.includes('services'))
    );

    const actions = ['create', 'read', 'update', 'delete'];

    const togglePermission = (module, action) => {
        setLocalPermissions(prev => {
            const rolePerms = prev[selectedRole] || {};
            const modulePerms = rolePerms[module] || [];

            const newModulePerms = modulePerms.includes(action)
                ? modulePerms.filter(a => a !== action)
                : [...modulePerms, action];

            return {
                ...prev,
                [selectedRole]: {
                    ...rolePerms,
                    [module]: newModulePerms
                }
            };
        });
    };

    // Toggle all actions for a module at once
    const toggleAllForModule = (module) => {
        setLocalPermissions(prev => {
            const rolePerms = prev[selectedRole] || {};
            const modulePerms = rolePerms[module] || [];
            const allGranted = actions.every(a => modulePerms.includes(a));
            return {
                ...prev,
                [selectedRole]: {
                    ...rolePerms,
                    [module]: allGranted ? [] : [...actions]
                }
            };
        });
    };

    const hasPermission = (module, action) => {
        return localPermissions[selectedRole]?.[module]?.includes(action) || false;
    };

    const hasAllPermissions = (module) => {
        return actions.every(a => hasPermission(module, a));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePermissions(localPermissions);
            toast.success('Permissions saved successfully');
        } catch (err) {
            toast.error('Failed to save permissions. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetToDefault = () => {
        // Re-fetch from context defaults
        setLocalPermissions(permissions);
        toast.success('Reset to current saved permissions');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="page-title">Role Permissions</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Configure access permissions for each role
                            {currentIndustry && currentIndustry !== 'all' && (
                                <span className="ml-2 badge-primary capitalize">{currentIndustry}</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleResetToDefault} className="btn-secondary" disabled={isSaving}>
                        Reset
                    </button>
                    <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Role Selector */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-2">
                    {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedRole === role.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {role.name}
                        </button>
                    ))}
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    {roles.find(r => r.id === selectedRole)?.description}
                </p>
            </div>

            {/* Permissions Matrix */}
            <div className="card overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Module</th>
                            {actions.map(action => (
                                <th key={action} className="text-center capitalize">{action}</th>
                            ))}
                            <th className="text-center">All</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map(module => (
                            <tr key={module.id}>
                                <td className="font-medium">{module.name}</td>
                                {actions.map(action => (
                                    <td key={action} className="text-center">
                                        <button
                                            onClick={() => togglePermission(module.id, action)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${hasPermission(module.id, action)
                                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                                }`}
                                        >
                                            {hasPermission(module.id, action) ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                        </button>
                                    </td>
                                ))}
                                <td className="text-center">
                                    <button
                                        onClick={() => toggleAllForModule(module.id)}
                                        title={hasAllPermissions(module.id) ? 'Revoke all' : 'Grant all'}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${hasAllPermissions(module.id)
                                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d={hasAllPermissions(module.id)
                                                    ? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                                                    : 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                                                }
                                            />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="card p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Permission Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="badge-primary">Create</span>
                        <span className="text-slate-500 dark:text-slate-400">Add new records</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="badge-success">Read</span>
                        <span className="text-slate-500 dark:text-slate-400">View records</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="badge-warning">Update</span>
                        <span className="text-slate-500 dark:text-slate-400">Modify records</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="badge-danger">Delete</span>
                        <span className="text-slate-500 dark:text-slate-400">Remove records</span>
                    </div>
                </div>
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                    Only modules enabled for your industry ({currentIndustry}) are shown. Permissions are enforced in both frontend navigation and backend API.
                </p>
            </div>
        </div>
    );
}
