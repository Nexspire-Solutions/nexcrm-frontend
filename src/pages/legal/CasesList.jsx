import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';

const CasesList = () => {
    const { hasModule } = useTenantConfig();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [stats, setStats] = useState({});

    useEffect(() => { fetchCases(); fetchStats(); }, [search, status]);

    const fetchCases = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            const response = await apiClient.get(`/cases?${params}`);
            setCases(response.data.data || []);
        } catch (error) { console.error('Failed:', error); } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try { const r = await apiClient.get('/cases/stats'); setStats(r.data.stats || {}); } catch (e) { }
    };

    if (!hasModule('legal_cases')) {
        return <div className="upgrade-prompt"><h2>Legal Module</h2><p>Upgrade to access.</p></div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>Legal Cases</h1>
                <button className="btn-primary">+ New Case</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card"><span className="stat-value">{stats.total || 0}</span><span className="stat-label">Total Cases</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.active || 0}</span><span className="stat-label">Active</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.upcoming_hearings || 0}</span><span className="stat-label">Upcoming Hearings</span></div>
                <div className="stat-card info"><span className="stat-value">{stats.won || 0}</span><span className="stat-label">Won</span></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <input type="text" placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="">All Status</option><option value="open">Open</option><option value="in_progress">In Progress</option><option value="won">Won</option><option value="lost">Lost</option><option value="closed">Closed</option>
                </select>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th>Case</th><th>Client</th><th>Type</th><th>Next Hearing</th><th>Status</th></tr></thead>
                        <tbody>
                            {cases.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No cases found.</td></tr> : cases.map(c => (
                                <tr key={c.id}>
                                    <td><div style={{ fontWeight: 500 }}>{c.title}</div><div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.case_number}</div></td>
                                    <td>{c.client_name}</td>
                                    <td><span style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--bg-tertiary)', fontSize: 12, textTransform: 'capitalize' }}>{c.case_type}</span></td>
                                    <td>{c.next_hearing ? new Date(c.next_hearing).toLocaleDateString() : '-'}</td>
                                    <td><span className={`status-badge ${c.status}`}>{c.status}</span></td>
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
                .status-badge.open,.status-badge.in_progress{background:#dbeafe;color:#1e40af}
                .status-badge.won{background:#d1fae5;color:#065f46}
                .status-badge.lost{background:#fee2e2;color:#991b1b}
                .status-badge.closed{background:#e5e7eb;color:#4b5563}
                th,td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--border-color)}
                th{background:var(--bg-tertiary);font-weight:600;font-size:13px;text-transform:uppercase}
                .btn-primary{background:var(--primary-color);color:white;border:none;padding:12px 20px;border-radius:8px;cursor:pointer}
            `}</style>
        </div>
    );
};

export default CasesList;
