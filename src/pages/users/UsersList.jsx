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
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [newUserCredentials, setNewUserCredentials] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
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
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            role: 'user',
            status: 'active'
        });
    };

    const handleSubmit = async () => {
        if (!formData.first_name.trim() || !formData.email.trim()) {
            toast.error('First name and email are required');
            return;
        }
        setSaving(true);
        try {
            if (editingUser) {
                await usersAPI.update(editingUser.id, formData);
                toast.success('User updated successfully');
                setShowModal(false);
                resetForm();
                fetchUsers();
            } else {
                const response = await usersAPI.create(formData);
                if (response.credentials) {
                    setNewUserCredentials({
                        name: `${formData.first_name} ${formData.last_name}`.trim(),
                        email: response.credentials.email,
                        password: response.credentials.password,
                        emailSent: response.emailSent
                    });
                    setShowCredentialsModal(true);
                } else {
                    toast.success(response.message || 'User created successfully');
                }
                setShowModal(false);
                resetForm();
                fetchUsers();
            }
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
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'user',
            status: user.status || 'active'
        });
        setEditingUser(user);
        setShowModal(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
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
                                            {user.first_name?.[0]}{user.last_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {user.first_name} {user.last_name}
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
                                        <button onClick={() => openEditModal(user)} className="btn-ghost btn-sm">
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

            {/* Create / Edit Modal */}
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
                                value={formData.first_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="label">Last Name</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.last_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
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
                            disabled={!!editingUser}
                        />
                        {editingUser && (
                            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                        )}
                    </div>
                    {!editingUser && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    A secure password will be auto-generated and sent to the user's email. You can copy it after creation.
                                </p>
                            </div>
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
                                <option value="user">User</option>
                                <option value="sales_operator">Sales Operator</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
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

            {/* Credentials Modal */}
            <Modal
                isOpen={showCredentialsModal}
                onClose={() => { setShowCredentialsModal(false); setNewUserCredentials(null); }}
                title="User Created Successfully"
                footer={
                    <button
                        onClick={() => { setShowCredentialsModal(false); setNewUserCredentials(null); }}
                        className="btn-primary"
                    >
                        Done
                    </button>
                }
            >
                {newUserCredentials && (
                    <div className="space-y-4">
                        {newUserCredentials.emailSent ? (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Login credentials have been sent to <strong>{newUserCredentials.email}</strong>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        Email service unavailable. Please share these credentials manually.
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-3">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {newUserCredentials.name}'s Login Credentials
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded border">
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{newUserCredentials.email}</p>
                                    </div>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(newUserCredentials.email); toast.success('Email copied!'); }}
                                        className="btn-ghost text-sm px-2 py-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded border">
                                    <div>
                                        <p className="text-xs text-slate-500">Password</p>
                                        <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">{newUserCredentials.password}</p>
                                    </div>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(newUserCredentials.password); toast.success('Password copied!'); }}
                                        className="btn-ghost text-sm px-2 py-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            The user should change their password after first login.
                        </p>
                    </div>
                )}
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
