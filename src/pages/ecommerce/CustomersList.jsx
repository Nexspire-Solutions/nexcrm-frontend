import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/**
 * Customers List Page - Customer Management
 */
const CustomersList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [stats, setStats] = useState({});
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'active' });
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    useEffect(() => {
        fetchCustomers();
        fetchStats();
    }, [search, status]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);

            const response = await apiClient.get(`/customers?${params}`);
            setCustomers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/customers/stats');
            setStats(response.data.stats || {});
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleStatusChange = async (customerId, newStatus) => {
        try {
            await apiClient.patch(`/customers/${customerId}/status`, { status: newStatus });
            toast.success('Customer status updated');
            fetchCustomers();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and Email are required');
            return;
        }

        setSaving(true);
        try {
            if (editingCustomer) {
                await apiClient.put(`/customers/${editingCustomer.id}`, formData);
                toast.success('Customer updated successfully');
            } else {
                await apiClient.post('/customers', formData);
                toast.success('Customer created successfully');
            }
            setShowModal(false);
            setFormData({ name: '', email: '', phone: '', status: 'active' });
            setEditingCustomer(null);
            fetchCustomers();
            fetchStats();
        } catch (error) {
            console.error('Save customer error:', error);
            toast.error(error.response?.data?.error || 'Failed to save customer');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await apiClient.delete(`/customers/${deleteTargetId}`);
            toast.success('Customer deleted successfully');
            fetchCustomers();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete customer');
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const openEditModal = (customer) => {
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            status: customer.status
        });
        setEditingCustomer(customer);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Customers</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage your customer base</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCustomer(null);
                        setFormData({ name: '', email: '', phone: '', status: 'active' });
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Customer
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Customers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactive || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Blocked</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.new_today || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">New Today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10 w-full"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Blocked</option>
                </select>
            </div>

            {/* Customers Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Total Spent</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12">
                                        <div className="empty-state">
                                            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <h3 className="empty-state-title">No customers found</h3>
                                            <p className="empty-state-text">Customers will appear here when they register</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                customers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                        {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{customer.email}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{customer.phone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                {customer.total_orders || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                                            ₹{(customer.total_spent || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className="btn-ghost btn-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(customer)}
                                                    className="btn-ghost btn-sm text-slate-600 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>Cancel</button>
                        <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (editingCustomer ? 'Update' : 'Create')}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Full Name *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="label">Email *</label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="label">Phone</label>
                        <input
                            type="tel"
                            className="input"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 XXXXX XXXXX"
                        />
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select
                            className="select"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Blocked</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            {/* Note: Ensure ConfirmModal is imported if you use it, or implement inline */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Customer</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            Are you sure you want to delete this customer? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Customer Detail Modal
 */
const CustomerDetailModal = ({ customer, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, [customer.id]);

    const fetchDetails = async () => {
        try {
            const response = await apiClient.get(`/customers/${customer.id}`);
            setDetails(response.data.data);
        } catch (error) {
            toast.error('Failed to load customer details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Customer: ${customer.name}`}>
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : details ? (
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500">Email:</span>
                                <span className="ml-2 text-slate-900 dark:text-white">{details.email}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Phone:</span>
                                <span className="ml-2 text-slate-900 dark:text-white">{details.phone || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Wallet */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Wallet Balance</h3>
                        <p className="text-2xl font-bold text-indigo-600">₹{(details.wallet?.balance || 0).toLocaleString()}</p>
                    </div>

                    {/* Addresses */}
                    {details.addresses?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Addresses</h3>
                            <div className="space-y-2">
                                {details.addresses.map((addr, idx) => (
                                    <div key={idx} className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                        <p className="font-medium text-slate-900 dark:text-white">{addr.name}</p>
                                        <p>{addr.address_line1}</p>
                                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Orders */}
                    {details.orders?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Recent Orders</h3>
                            <div className="space-y-2">
                                {details.orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                        <div>
                                            <code className="text-indigo-600">{order.order_number}</code>
                                            <span className="ml-2 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className="font-semibold">₹{order.total?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-slate-500">No details available</p>
            )}
        </Modal>
    );
};

export default CustomersList;
