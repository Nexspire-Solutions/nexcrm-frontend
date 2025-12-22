import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';

const ProductionList = () => {
    const { hasModule } = useTenantConfig();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [stats, setStats] = useState({});

    useEffect(() => { fetchOrders(); fetchStats(); }, [status]);

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            const response = await apiClient.get(`/production?${params}`);
            setOrders(response.data.data || []);
        } catch (error) { console.error('Failed:', error); } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try { const r = await apiClient.get('/production/stats'); setStats(r.data.stats || {}); } catch (e) { }
    };

    if (!hasModule('production')) {
        return <div className="upgrade-prompt"><h2>Manufacturing Module</h2><p>Upgrade to access.</p></div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>Production Orders</h1>
                <button className="btn-primary">+ New Order</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card"><span className="stat-value">{stats.total || 0}</span><span className="stat-label">Total Orders</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.completed || 0}</span><span className="stat-label">Completed</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.in_progress || 0}</span><span className="stat-label">In Progress</span></div>
                <div className="stat-card danger"><span className="stat-value">{stats.low_stock_materials || 0}</span><span className="stat-label">Low Stock</span></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="">All Status</option><option value="planned">Planned</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
                </select>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th>Order #</th><th>Product</th><th>Quantity</th><th>Progress</th><th>Status</th></tr></thead>
                        <tbody>
                            {orders.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No orders found.</td></tr> : orders.map(o => (
                                <tr key={o.id}>
                                    <td><code>{o.order_number}</code></td>
                                    <td>{o.product_name}</td>
                                    <td>{o.quantity}</td>
                                    <td><div style={{ width: 100, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4 }}><div style={{ width: `${(o.produced_quantity / o.quantity) * 100 || 0}%`, height: '100%', background: '#10b981', borderRadius: 4 }}></div></div></td>
                                    <td><span className={`status-badge ${o.status}`}>{o.status?.replace('_', ' ')}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <style>{`
                .stat-card{background:var(--bg-secondary);border-radius:12px;padding:20px;text-align:center}
                .stat-value{display:block;font-size:32px;font-weight:700}
                .stat-label{color:var(--text-secondary);font-size:14px}
                .stat-card.success .stat-value{color:#10b981}
                .stat-card.warning .stat-value{color:#f59e0b}
                .stat-card.danger .stat-value{color:#ef4444}
                .status-badge{padding:4px 12px;border-radius:20px;font-size:12px;text-transform:capitalize}
                .status-badge.planned{background:#e5e7eb;color:#4b5563}
                .status-badge.in_progress{background:#fef3c7;color:#92400e}
                .status-badge.completed{background:#d1fae5;color:#065f46}
                th,td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--border-color)}
                th{background:var(--bg-tertiary);font-weight:600;font-size:13px;text-transform:uppercase}
                .btn-primary{background:var(--primary-color);color:white;border:none;padding:12px 20px;border-radius:8px;cursor:pointer}
            `}</style>
        </div>
    );
};

export default ProductionList;
