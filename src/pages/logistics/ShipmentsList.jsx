import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';

const ShipmentsList = () => {
    const { hasModule } = useTenantConfig();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [stats, setStats] = useState({});

    useEffect(() => { fetchShipments(); fetchStats(); }, [status]);

    const fetchShipments = async () => {
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            const response = await apiClient.get(`/shipments?${params}`);
            setShipments(response.data.data || []);
        } catch (error) { console.error('Failed:', error); } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try { const r = await apiClient.get('/shipments/stats'); setStats(r.data.stats || {}); } catch (e) { }
    };

    if (!hasModule('shipments')) {
        return <div className="upgrade-prompt"><h2>Logistics Module</h2><p>Upgrade to access.</p></div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>Shipments</h1>
                <button className="btn-primary">+ New Shipment</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card"><span className="stat-value">{stats.total || 0}</span><span className="stat-label">Total</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.in_transit || 0}</span><span className="stat-label">In Transit</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.delivered || 0}</span><span className="stat-label">Delivered</span></div>
                <div className="stat-card info"><span className="stat-value">{stats.available_vehicles || 0}</span><span className="stat-label">Vehicles Free</span></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="">All Status</option><option value="pending">Pending</option><option value="in_transit">In Transit</option><option value="delivered">Delivered</option>
                </select>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th>Shipment #</th><th>Destination</th><th>Vehicle</th><th>Driver</th><th>Status</th></tr></thead>
                        <tbody>
                            {shipments.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No shipments found.</td></tr> : shipments.map(s => (
                                <tr key={s.id}>
                                    <td><code>{s.shipment_number}</code></td>
                                    <td>{s.destination_city}, {s.destination_state}</td>
                                    <td>{s.vehicle_number || '-'}</td>
                                    <td>{s.driver_name || '-'}</td>
                                    <td><span className={`status-badge ${s.status}`}>{s.status?.replace('_', ' ')}</span></td>
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
                .stat-card.info .stat-value{color:#3b82f6}
                .status-badge{padding:4px 12px;border-radius:20px;font-size:12px;text-transform:capitalize}
                .status-badge.pending{background:#e5e7eb;color:#4b5563}
                .status-badge.in_transit{background:#fef3c7;color:#92400e}
                .status-badge.delivered{background:#d1fae5;color:#065f46}
                th,td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--border-color)}
                th{background:var(--bg-tertiary);font-weight:600;font-size:13px;text-transform:uppercase}
                .btn-primary{background:var(--primary-color);color:white;border:none;padding:12px 20px;border-radius:8px;cursor:pointer}
            `}</style>
        </div>
    );
};

export default ShipmentsList;
