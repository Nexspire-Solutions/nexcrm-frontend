import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const mockUsers = [
    { id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@company.com', role: 'admin', status: 'active', lastLogin: '2024-12-21 10:30' },
    { id: 2, firstName: 'John', lastName: 'Manager', email: 'john@company.com', role: 'manager', status: 'active', lastLogin: '2024-12-21 09:15' },
    { id: 3, firstName: 'Sarah', lastName: 'Sales', email: 'sarah@company.com', role: 'sales_operator', status: 'active', lastLogin: '2024-12-20 16:45' },
    { id: 4, firstName: 'Mike', lastName: 'User', email: 'mike@company.com', role: 'user', status: 'inactive', lastLogin: '2024-12-15 11:00' },
];

const roleColors = {
    admin: 'badge-danger',
    manager: 'badge-primary',
    sales_operator: 'badge-warning',
    user: 'badge-gray'
};

const roleLabels = {
    admin: 'Admin',
    manager: 'Manager',
    sales_operator: 'Sales Operator',
    user: 'User'
};

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            setUsers(mockUsers);
            setIsLoading(false);
        }, 500);
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            setUsers(prev => prev.filter(u => u.id !== id));
            toast.success('User deleted successfully');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="card p-4 space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users & Permissions</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage user accounts and access permissions
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/users/permissions" className="btn-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Manage Roles
                    </Link>
                    <button
                        onClick={() => { setEditingUser(null); setShowModal(true); }}
                        className="btn-primary"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(roleLabels).map(([key, label]) => {
                    const count = users.filter(u => u.role === key).length;
                    return (
                        <div key={key} className="stat-card">
                            <div className="flex items-center justify-between">
                                <span className={roleColors[key]}>{label}</span>
                                <span className="stat-card-value text-lg">{count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="select w-full sm:w-48"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="sales_operator">Sales Operator</option>
                        <option value="user">User</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={roleColors[user.role]}>{roleLabels[user.role]}</span>
                                </td>
                                <td>
                                    <span className={user.status === 'active' ? 'badge-success' : 'badge-gray'}>
                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="text-slate-500 dark:text-slate-400 text-sm">
                                    {user.lastLogin}
                                </td>
                                <td>
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => { setEditingUser(user); setShowModal(true); }}
                                            className="btn-ghost btn-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <h3 className="empty-state-title">No users found</h3>
                        <p className="empty-state-text">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={() => setShowModal(false)} className="btn-ghost p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">First Name</label>
                                    <input type="text" className="input" defaultValue={editingUser?.firstName} />
                                </div>
                                <div>
                                    <label className="label">Last Name</label>
                                    <input type="text" className="input" defaultValue={editingUser?.lastName} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input type="email" className="input" defaultValue={editingUser?.email} />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="label">Password</label>
                                    <input type="password" className="input" placeholder="Enter password" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Role</label>
                                    <select className="select" defaultValue={editingUser?.role || 'user'}>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="sales_operator">Sales Operator</option>
                                        <option value="user">User</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Status</label>
                                    <select className="select" defaultValue={editingUser?.status || 'active'}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={() => { setShowModal(false); toast.success('User saved'); }} className="btn-primary">
                                {editingUser ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
