import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';

const BookingsList = () => {
    const { hasModule } = useTenantConfig();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('');
    const [stats, setStats] = useState({});

    useEffect(() => { fetchBookings(); fetchStats(); }, [date, status]);

    const fetchBookings = async () => {
        try {
            const params = new URLSearchParams();
            if (date) params.append('date', date);
            if (status) params.append('status', status);
            const response = await apiClient.get(`/bookings?${params}`);
            setBookings(response.data.data || []);
        } catch (error) { console.error('Failed:', error); } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try { const r = await apiClient.get('/bookings/stats'); setStats(r.data.stats || {}); } catch (e) { }
    };

    if (!hasModule('salon_bookings')) {
        return <div className="upgrade-prompt"><h2>Salon Module</h2><p>Upgrade to access.</p></div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>Appointments</h1>
                <button className="btn-primary">+ New Booking</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card"><span className="stat-value">{stats.total_today || 0}</span><span className="stat-label">Today's Bookings</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.completed || 0}</span><span className="stat-label">Completed</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.upcoming || 0}</span><span className="stat-label">Upcoming</span></div>
                <div className="stat-card info"><span className="stat-value">₹{stats.revenue_today?.toLocaleString() || 0}</span><span className="stat-label">Today's Revenue</span></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="">All Status</option><option value="booked">Booked</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th>Time</th><th>Client</th><th>Staff</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                            {bookings.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No bookings found.</td></tr> : bookings.map(b => (
                                <tr key={b.id}>
                                    <td>{b.start_time?.slice(0, 5)}</td>
                                    <td><div style={{ fontWeight: 500 }}>{b.client_name}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.client_phone}</div></td>
                                    <td>{b.staff_name || '-'}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>₹{b.total_amount?.toLocaleString() || 0}</td>
                                    <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
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
                .status-badge.booked,.status-badge.confirmed{background:#dbeafe;color:#1e40af}
                .status-badge.completed{background:#d1fae5;color:#065f46}
                .status-badge.cancelled{background:#fee2e2;color:#991b1b}
                th,td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--border-color)}
                th{background:var(--bg-tertiary);font-weight:600;font-size:13px;text-transform:uppercase}
                .btn-primary{background:var(--primary-color);color:white;border:none;padding:12px 20px;border-radius:8px;cursor:pointer}
            `}</style>
        </div>
    );
};

export default BookingsList;
