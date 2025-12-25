import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { usersAPI } from '../../api';

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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        status: 'active'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await usersAPI.getAll();
            setUsers(response.data || []);
        } catch (error) {
            toast.error('Failed to load users');
            console.error('Fetch users error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            role: 'user',
            status: 'active'
        });
    };

    const handleSubmit = async () => {
        if (!formData.firstName.trim() || !formData.email.trim()) {
            toast.error('First name and email are required');
            return;
        }
        if (!editingUser && !formData.password.trim()) {
            toast.error('Password is required for new users');
            return;
        }
        setSaving(true);
        try {
            if (editingUser) {
                await usersAPI.update(editingUser.id, formData);
                toast.success('User updated successfully');
            } else {
                await usersAPI.create(formData);
                toast.success('User created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setEditingUser(null);
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            password: '',
            phone: user.phone || '',
            role: user.role || 'user',
            status: user.status || 'active'
        });
        setEditingUser(user);
        setShowModal(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId) {
            try {
                await usersAPI.delete(deleteTargetId);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
            setDeleteTargetId(null);
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
                    <button onClick={openCreateModal} className="btn-primary">
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
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                                            {user.firstName?.[0]}{user.lastName?.[0]}
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
                                    <span className={roleColors[user.role]}>{roleLabels[user.role] || user.role}</span>
                                </td>
                                <td>
                                    <span className={user.status === 'active' ? 'badge-success' : 'badge-gray'}>
                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="text-slate-500 dark:text-slate-400 text-sm">
                                    {user.phone || '-'}
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(user)}
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

            {/* User Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? 'Edit User' : 'Add New User'}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>Cancel</button>
                        <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">First Name *</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="label">Last Name</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                placeholder="Doe"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Email *</label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="john@example.com"
                        />
                    </div>
                    {!editingUser && (
                        <div>
                            <label className="label">Password *</label>
                            <input
                                type="password"
                                className="input"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Enter password"
                            />
                        </div>
                    )}
                    <div>
                        <label className="label">Phone</label>
                        <input
                            type="tel"
                            className="input"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Role</label>
                            <select
                                className="select"
                                value={formData.role}
                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            >
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="sales_operator">Sales Operator</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select
                                className="select"
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
