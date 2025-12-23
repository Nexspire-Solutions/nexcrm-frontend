import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/**
 * Coupons List Page - Promotions Management
 */
const CouponsList = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    useEffect(() => {
        fetchCoupons();
        fetchStats();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await apiClient.get('/coupons');
            setCoupons(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/coupons/stats');
            setStats(response.data.stats || {});
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await apiClient.delete(`/coupons/${id}`);
            toast.success('Coupon deleted');
            fetchCoupons();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const handleToggleActive = async (coupon) => {
        try {
            await apiClient.put(`/coupons/${coupon.id}`, { is_active: !coupon.is_active });
            toast.success('Coupon updated');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to update coupon');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Coupons & Offers</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage discount codes and promotions</p>
                </div>
                <button onClick={() => { setEditingCoupon(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Coupon
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Coupons</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
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
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_used || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Times Used</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{(stats.total_discount || 0).toLocaleString()}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Discounts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Usage</th>
                                <th className="px-6 py-4">Validity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="empty-state">
                                            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            <h3 className="empty-state-title">No coupons yet</h3>
                                            <p className="empty-state-text">Create your first coupon to offer discounts</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map(coupon => (
                                    <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <code className="text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded">
                                                {coupon.code}
                                            </code>
                                            {coupon.name && <p className="text-xs text-slate-500 mt-1">{coupon.name}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize">{coupon.type}</span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                            {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                            {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'No expiry'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(coupon)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${coupon.is_active
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}
                                            >
                                                {coupon.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingCoupon(coupon); setShowModal(true); }}
                                                    className="btn-ghost btn-sm text-indigo-600"
                                                >
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(coupon.id)} className="btn-ghost btn-sm text-red-600">
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

            {/* Coupon Modal */}
            {showModal && (
                <CouponModal
                    coupon={editingCoupon}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchCoupons(); fetchStats(); }}
                />
            )}
        </div>
    );
};

/**
 * Coupon Add/Edit Modal
 */
const CouponModal = ({ coupon, onClose, onSave }) => {
    const [form, setForm] = useState({
        code: coupon?.code || '',
        name: coupon?.name || '',
        type: coupon?.type || 'percentage',
        value: coupon?.value || '',
        min_order_value: coupon?.min_order_value || '',
        max_discount: coupon?.max_discount || '',
        usage_limit: coupon?.usage_limit || '',
        per_user_limit: coupon?.per_user_limit || 1,
        end_date: coupon?.end_date?.split('T')[0] || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.code || !form.value) {
            toast.error('Code and value are required');
            return;
        }

        setSaving(true);
        try {
            if (coupon) {
                await apiClient.put(`/coupons/${coupon.id}`, form);
            } else {
                await apiClient.post('/coupons', form);
            }
            toast.success(coupon ? 'Coupon updated' : 'Coupon created');
            onSave();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save coupon');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={coupon ? 'Edit Coupon' : 'Create Coupon'}
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : (coupon ? 'Update' : 'Create')}
                    </button>
                </>
            }
        >
            <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Coupon Code *</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            className="input"
                            placeholder="SAVE20"
                        />
                    </div>
                    <div>
                        <label className="label">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input"
                            placeholder="Summer Sale"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Discount Type</label>
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                            <option value="free_shipping">Free Shipping</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Value *</label>
                        <input
                            type="number"
                            value={form.value}
                            onChange={(e) => setForm({ ...form, value: e.target.value })}
                            className="input"
                            placeholder={form.type === 'percentage' ? '20' : '500'}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Min Order Value</label>
                        <input
                            type="number"
                            value={form.min_order_value}
                            onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                            className="input"
                            placeholder="1000"
                        />
                    </div>
                    <div>
                        <label className="label">Max Discount</label>
                        <input
                            type="number"
                            value={form.max_discount}
                            onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                            className="input"
                            placeholder="500"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="label">Usage Limit</label>
                        <input
                            type="number"
                            value={form.usage_limit}
                            onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                            className="input"
                            placeholder="∞"
                        />
                    </div>
                    <div>
                        <label className="label">Per User Limit</label>
                        <input
                            type="number"
                            value={form.per_user_limit}
                            onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">Expiry Date</label>
                        <input
                            type="date"
                            value={form.end_date}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            className="input"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default CouponsList;
