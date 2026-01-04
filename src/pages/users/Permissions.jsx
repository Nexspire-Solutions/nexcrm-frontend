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

// Define modules with their associated industries
// 'all' means available to everyone (Core modules)
// specific strings match the industry keys
const allModules = [
    // Core Modules
    { id: 'dashboard', name: 'Dashboard', industries: ['all'] },
    { id: 'employees', name: 'Employees', industries: ['all'] },
    { id: 'users', name: 'Roles & Permissions', industries: ['all'] },
    { id: 'inquiries', name: 'Inquiries', industries: ['all'] },
    { id: 'leads', name: 'Leads', industries: ['all'] },
    { id: 'communications', name: 'Communications', industries: ['all'] },
    { id: 'automation', name: 'Automation', industries: ['all'] },

    // Commerce & Inventory
    { id: 'products', name: 'Products', industries: ['ecommerce', 'retail'] },
    { id: 'orders', name: 'Orders', industries: ['ecommerce', 'retail', 'manufacturing'] },
    { id: 'inventory', name: 'Inventory', industries: ['ecommerce', 'retail', 'manufacturing', 'logistics'] },
    { id: 'returns', name: 'Returns', industries: ['ecommerce', 'retail'] },
    { id: 'shipping', name: 'Shipping', industries: ['ecommerce', 'logistics'] },
    { id: 'vendors', name: 'Vendors', industries: ['ecommerce', 'retail', 'manufacturing'] },
    { id: 'coupons', name: 'Coupons', industries: ['ecommerce'] },
    { id: 'reviews', name: 'Reviews', industries: ['ecommerce'] },
    { id: 'cms', name: 'CMS', industries: ['ecommerce'] },

    // Real Estate
    { id: 'properties', name: 'Properties', industries: ['realestate'] },
    { id: 'viewings', name: 'Viewings', industries: ['realestate'] },
    { id: 'listings', name: 'Listings', industries: ['realestate'] },

    // Services & Booking
    { id: 'appointments', name: 'Appointments', industries: ['healthcare', 'salon', 'services', 'consulting'] },
    { id: 'services', name: 'Services', industries: ['salon', 'services', 'consulting'] },
    { id: 'patients', name: 'Patients', industries: ['healthcare'] },
    { id: 'prescriptions', name: 'Prescriptions', industries: ['healthcare'] },
    { id: 'bookings', name: 'Bookings', industries: ['salon'] },
    { id: 'clients', name: 'Clients', industries: ['services', 'consulting', 'legal'] },

    // Education
    { id: 'courses', name: 'Courses', industries: ['education'] },
    { id: 'students', name: 'Students', industries: ['education'] },
    { id: 'enrollments', name: 'Enrollments', industries: ['education'] },

    // Hospitality
    { id: 'rooms', name: 'Rooms', industries: ['hospitality'] },
    { id: 'reservations', name: 'Reservations', industries: ['hospitality'] },
    { id: 'housekeeping', name: 'Housekeeping', industries: ['hospitality'] },

    // Fitness
    { id: 'members', name: 'Members', industries: ['fitness'] },
    { id: 'classes', name: 'Classes', industries: ['fitness'] },

    // Legal & Finance
    { id: 'cases', name: 'Cases', industries: ['legal'] },
    { id: 'documents', name: 'Documents', industries: ['legal', 'services'] },
    { id: 'billing', name: 'Billing', industries: ['legal', 'services'] },

    // Operations
    { id: 'production', name: 'Production', industries: ['manufacturing'] },
    { id: 'work_orders', name: 'Work Orders', industries: ['manufacturing'] },
    { id: 'vehicles', name: 'Vehicles', industries: ['logistics'] },
    { id: 'tracking', name: 'Tracking', industries: ['logistics'] },
    { id: 'shipments', name: 'Shipments', industries: ['logistics'] },

    // Restaurant
    { id: 'menu', name: 'Menu', industries: ['restaurant'] },
    { id: 'tables', name: 'Tables', industries: ['restaurant'] },
    { id: 'kitchen', name: 'Kitchen Orders', industries: ['restaurant'] }
];

const defaultPermissions = {
    admin: { dashboard: ['read'], employees: ['create', 'read', 'update', 'delete'], users: ['create', 'read', 'update', 'delete'], inquiries: ['create', 'read', 'update', 'delete'], leads: ['create', 'read', 'update', 'delete'], communications: ['create', 'read', 'update', 'delete'] },
    manager: { dashboard: ['read'], employees: ['read', 'update'], users: [], inquiries: ['create', 'read', 'update'], leads: ['create', 'read', 'update'], communications: ['create', 'read', 'update'] },
    sales_operator: { dashboard: ['read'], employees: [], users: [], inquiries: ['read', 'update'], leads: ['create', 'read', 'update'], communications: ['read'] },
    user: { dashboard: ['read'], employees: [], users: [], inquiries: ['read'], leads: ['read'], communications: [] }
};

export default function Permissions() {
    const { getIndustry } = useTenantConfig();
    const { permissions, updatePermissions } = usePermissions();
    const currentIndustry = getIndustry();

    // Local state for editing before saving (optional, but let's sync directly for simplicity or keep local?)
    // User expects to click "Save Changes". So we should keep local state and then commit.
    // However, to make sure it loads correctly, we initialize from context.
    const [localPermissions, setLocalPermissions] = useState(permissions);
    const [selectedRole, setSelectedRole] = useState('admin');

    // Sync local state when permissions change externally (e.g. reload)
    useEffect(() => {
        setLocalPermissions(permissions);
    }, [permissions]);

    // Filter modules based on current industry
    const modules = allModules.filter(m =>
        m.industries.includes('all') ||
        m.industries.includes(currentIndustry) ||
        (currentIndustry === 'general' && m.industries.includes('services')) // Fallback for general
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

    const hasPermission = (module, action) => {
        return localPermissions[selectedRole]?.[module]?.includes(action) || false;
    };

    const handleSave = () => {
        updatePermissions(localPermissions);
        toast.success('Permissions saved successfully');
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
                        </p>
                    </div>
                </div>
                <button onClick={handleSave} className="btn-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                </button>
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
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${hasPermission(module.id, action)
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
            </div>
        </div>
    );
}
