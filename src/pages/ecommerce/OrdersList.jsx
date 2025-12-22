import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';

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
            fetchOrders();
            fetchStats();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    if (!hasModule('orders')) {
        return (
            <div className="upgrade-prompt">
                <h2>Orders Module</h2>
                <p>Upgrade your plan to access Orders management.</p>
                <button className="btn-primary">Upgrade Plan</button>
            </div>
        );
    }

    const statusColors = {
        pending: '#fef3c7',
        confirmed: '#dbeafe',
        processing: '#e0e7ff',
        shipped: '#c7d2fe',
        delivered: '#d1fae5',
        cancelled: '#fee2e2'
    };

    return (
        <div className="orders-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Orders</h1>
                    <p className="subtitle">Manage customer orders</p>
                </div>
                <button className="btn-primary" onClick={() => alert('Create order coming soon!')}>
                    + Create Order
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-value">{stats.today_orders || 0}</span>
                    <span className="stat-label">Today's Orders</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">₹{(stats.today_revenue || 0).toLocaleString()}</span>
                    <span className="stat-label">Today's Revenue</span>
                </div>
                <div className="stat-card warning">
                    <span className="stat-value">{stats.pending || 0}</span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="stat-card success">
                    <span className="stat-value">{stats.delivered || 0}</span>
                    <span className="stat-label">Delivered</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <input
                    type="text"
                    placeholder="Search orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
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
                <div className="loading">Loading orders...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="empty-state">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <span className="order-number">{order.order_number}</span>
                                        </td>
                                        <td>
                                            <div className="customer-info">
                                                <span className="name">{order.shipping_name || order.client_name || 'Guest'}</span>
                                                <span className="phone">{order.shipping_phone}</span>
                                            </div>
                                        </td>
                                        <td>{order.items?.length || '?'} items</td>
                                        <td className="total">₹{order.total?.toLocaleString()}</td>
                                        <td>
                                            <span className={`payment-badge ${order.payment_status}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                style={{ background: statusColors[order.status] }}
                                                className="status-select"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="date">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button onClick={() => setSelectedOrder(order)}>View</button>
                                            </div>
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

            <style>{`
                .orders-page { padding: 24px; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .page-header h1 { margin: 0; font-size: 24px; }
                .subtitle { color: var(--text-secondary); margin: 4px 0 0; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                .stat-card { background: var(--bg-secondary); border-radius: 12px; padding: 20px; text-align: center; }
                .stat-value { display: block; font-size: 28px; font-weight: 700; }
                .stat-label { color: var(--text-secondary); font-size: 14px; }
                .stat-card.warning .stat-value { color: #f59e0b; }
                .stat-card.success .stat-value { color: #10b981; }
                
                .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; }
                .search-input { flex: 1; padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; }
                .filters-bar select { padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; }
                
                .table-container { background: var(--bg-secondary); border-radius: 12px; overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
                th { background: var(--bg-tertiary); font-weight: 600; font-size: 13px; text-transform: uppercase; }
                
                .order-number { font-family: monospace; font-weight: 600; color: var(--primary-color); }
                .customer-info { display: flex; flex-direction: column; }
                .customer-info .name { font-weight: 500; }
                .customer-info .phone { font-size: 12px; color: var(--text-secondary); }
                
                .total { font-weight: 600; color: var(--primary-color); }
                
                .payment-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; text-transform: capitalize; }
                .payment-badge.paid { background: #d1fae5; color: #065f46; }
                .payment-badge.pending { background: #fef3c7; color: #92400e; }
                .payment-badge.failed { background: #fee2e2; color: #991b1b; }
                
                .status-select { padding: 6px 10px; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }
                .date { color: var(--text-secondary); font-size: 13px; }
                
                .actions button { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; background: var(--bg-tertiary); }
                .btn-primary { background: var(--primary-color); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; }
                .empty-state, .loading { text-align: center; padding: 40px; color: var(--text-secondary); }
                .upgrade-prompt { text-align: center; padding: 60px; }
            `}</style>
        </div>
    );
};

/**
 * Order Detail Modal
 */
const OrderDetailModal = ({ order, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Order {order.order_number}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <div className="order-section">
                        <h3>Order Details</h3>
                        <div className="detail-grid">
                            <div><strong>Status:</strong> {order.status}</div>
                            <div><strong>Payment:</strong> {order.payment_status}</div>
                            <div><strong>Total:</strong> ₹{order.total?.toLocaleString()}</div>
                            <div><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="order-section">
                        <h3>Shipping Address</h3>
                        <p>
                            {order.shipping_name}<br />
                            {order.shipping_address}<br />
                            {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}<br />
                            Phone: {order.shipping_phone}
                        </p>
                    </div>

                    {order.tracking_number && (
                        <div className="order-section">
                            <h3>Tracking</h3>
                            <p>Tracking #: {order.tracking_number}</p>
                        </div>
                    )}

                    {order.notes && (
                        <div className="order-section">
                            <h3>Notes</h3>
                            <p>{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal { background: var(--bg-primary); border-radius: 16px; width: 100%; max-width: 500px; max-height: 90vh; overflow: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
                .modal-header h2 { margin: 0; font-size: 20px; }
                .close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-secondary); }
                .modal-body { padding: 24px; }
                .order-section { margin-bottom: 24px; }
                .order-section h3 { margin: 0 0 12px; font-size: 16px; color: var(--text-secondary); }
                .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            `}</style>
        </div>
    );
};

export default OrdersList;
