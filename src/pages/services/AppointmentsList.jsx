import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { getTodayDate, getUserTimezone } from '../../utils/dateUtils';

const AppointmentsList = () => {
    const { user } = useAuth();
    const { hasModule } = useTenantConfig();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(getTodayDate(getUserTimezone(user)));
    const [status, setStatus] = useState('');
    const [stats, setStats] = useState({});

    useEffect(() => { fetchAppointments(); fetchStats(); }, [date, status]);

    const fetchAppointments = async () => {
        try {
            const params = new URLSearchParams();
            if (date) params.append('date', date);
            if (status) params.append('status', status);
            const response = await apiClient.get(`/appointments?${params}`);
            setAppointments(response.data.data || []);
        } catch (error) { console.error('Failed:', error); } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try { const r = await apiClient.get('/appointments/stats'); setStats(r.data.stats || {}); } catch (e) { }
    };

    if (!hasModule('appointments')) {
        return <div className="upgrade-prompt"><h2>Services Module</h2><p>Upgrade to access.</p></div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>Appointments</h1>
                <button className="btn-primary">+ New Appointment</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card"><span className="stat-value">{stats.today || 0}</span><span className="stat-label">Today</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.completed || 0}</span><span className="stat-label">Completed</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.pending || 0}</span><span className="stat-label">Pending</span></div>
                <div className="stat-card danger"><span className="stat-value">{stats.cancelled || 0}</span><span className="stat-label">Cancelled</span></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="">All Status</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th>Time</th><th>Client</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                            {appointments.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No appointments found.</td></tr> : appointments.map(a => (
                                <tr key={a.id}>
                                    <td>{a.start_time?.slice(0, 5)}</td>
                                    <td>{a.client_name}</td>
                                    <td>{a.service_name || '-'}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>₹{a.price?.toLocaleString() || 0}</td>
                                    <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
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
                .status-badge.scheduled{background:#dbeafe;color:#1e40af}
                .status-badge.completed{background:#d1fae5;color:#065f46}
                .status-badge.cancelled{background:#fee2e2;color:#991b1b}
                th,td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--border-color)}
                th{background:var(--bg-tertiary);font-weight:600;font-size:13px;text-transform:uppercase}
                .btn-primary{background:var(--primary-color);color:white;border:none;padding:12px 20px;border-radius:8px;cursor:pointer}
            `}</style>
        </div>
    );
};

export default AppointmentsList;
