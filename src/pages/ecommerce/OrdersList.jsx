import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/**
 * Orders List Page - E-Commerce Module
 */
const OrdersList = () => {
    const { hasModule } = useTenantConfig();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [stats, setStats] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, [search, status]);

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);

            const response = await apiClient.get(`/orders?${params}`);
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/orders/stats');
            setStats(response.data.stats || {});
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
            toast.success('Order status updated');
            fetchOrders();
            fetchStats();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    if (!hasModule('orders')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Orders Module</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Upgrade your plan to access Orders management.</p>
                    <button className="btn-primary">Upgrade Plan</button>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
            shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
    };

    const getPaymentColor = (status) => {
        const colors = {
            paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6  rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Orders</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage customer orders</p>
                </div>
                <button
                    onClick={() => toast.info('Create order feature coming soon!')}
                    className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Order
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.today_orders || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Today's Orders</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{(stats.today_revenue || 0).toLocaleString()}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Today's Revenue</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">{stats.pending || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-indigo-600">{stats.processing || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Processing</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">{stats.shipped || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Shipped</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.delivered || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Delivered</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search orders..."
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
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Order #</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12">
                                        <div className="empty-state">
                                            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <h3 className="empty-state-title">No orders found</h3>
                                            <p className="empty-state-text">Orders will appear here when customers place them</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <code className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400">
                                                {order.order_number}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {order.shipping_name || order.client_name || 'Guest'}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {order.shipping_phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                                            ₹{order.total?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(order.payment_status)}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className={`select text-xs px-3 py-1 ${getStatusColor(order.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="btn-ghost btn-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
};

/**
 * Order Detail Modal - Enhanced with items list, payment breakdown, and timeline
 */
const OrderDetailModal = ({ order, onClose }) => {
    const [activeTab, setActiveTab] = useState('details');

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
            shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };

    const getPaymentColor = (status) => {
        const colors = {
            paid: 'bg-emerald-100 text-emerald-800',
            pending: 'bg-amber-100 text-amber-800',
            failed: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'items', label: `Items (${order.items?.length || 0})` },
        { id: 'shipping', label: 'Shipping' }
    ];

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <span>Order {order.order_number}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 -mx-6 px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Order Date</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Payment Status</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(order.payment_status)}`}>
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Customer
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
                                <p className="font-medium text-slate-900 dark:text-white">{order.shipping_name || order.client_name || 'Guest'}</p>
                                {order.shipping_phone && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{order.shipping_phone}</p>
                                )}
                                {order.shipping_email && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{order.shipping_email}</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Breakdown */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Payment Breakdown
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                                    <span className="text-slate-900 dark:text-white">₹{(order.subtotal || order.total || 0).toLocaleString()}</span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount</span>
                                        <span>-₹{order.discount_amount.toLocaleString()}</span>
                                    </div>
                                )}
                                {order.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Tax</span>
                                        <span className="text-slate-900 dark:text-white">₹{order.tax.toLocaleString()}</span>
                                    </div>
                                )}
                                {order.shipping_cost > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                                        <span className="text-slate-900 dark:text-white">₹{order.shipping_cost.toLocaleString()}</span>
                                    </div>
                                )}
                                <hr className="border-slate-200 dark:border-slate-700 my-2" />
                                <div className="flex justify-between font-semibold text-base">
                                    <span className="text-slate-900 dark:text-white">Total</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">₹{(order.total || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Notes</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                    {order.notes}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Items Tab */}
                {activeTab === 'items' && (
                    <div className="space-y-3">
                        {order.items?.length > 0 ? (
                            order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {item.product_image ? (
                                            <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{item.product_name || item.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {item.variant && `${item.variant} • `}Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-indigo-600 dark:text-indigo-400">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">₹{item.price} × {item.quantity}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p>No items in this order</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Shipping Tab */}
                {activeTab === 'shipping' && (
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Shipping Address
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-1 text-sm">
                                <p className="font-medium text-slate-900 dark:text-white">{order.shipping_name}</p>
                                <p className="text-slate-600 dark:text-slate-400">{order.shipping_address}</p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {order.shipping_city}{order.shipping_state && `, ${order.shipping_state}`} - {order.shipping_pincode}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">Phone: {order.shipping_phone}</p>
                            </div>
                        </div>

                        {/* Tracking Info */}
                        {order.tracking_number && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                    Tracking
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <code className="text-sm bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                            {order.tracking_number}
                                        </code>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(order.tracking_number); toast.success('Copied!'); }}
                                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Provider */}
                        {order.shipping_provider && (
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Shipping Provider</p>
                                <p className="font-medium text-slate-900 dark:text-white">{order.shipping_provider}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default OrdersList;
