import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const PatientsList = () => {
    const { hasModule } = useTenantConfig();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editPatient, setEditPatient] = useState(null);
    const [stats, setStats] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    useEffect(() => { fetchPatients(); fetchStats(); }, [search, status]);

    const fetchPatients = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            const response = await apiClient.get(`/patients?${params}`);
            setPatients(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/patients/stats');
            setStats(response.data.stats || {});
        } catch (error) { }
    };

    const handleDelete = (id) => { setDeleteTargetId(id); setShowDeleteConfirm(true); };
    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try { await apiClient.delete(`/patients/${deleteTargetId}`); fetchPatients(); setDeleteTargetId(null); } catch (error) { }
    };

    if (!hasModule('patients')) {
        return (<div className="upgrade-prompt"><h2>Healthcare Module</h2><p>Upgrade your plan to access Patient Management.</p><button className="btn-primary">Upgrade Plan</button></div>);
    }

    return (
        <div className="patients-page">
            <div className="page-header">
                <div><h1>Patients</h1><p className="subtitle">Manage patient records</p></div>
                <button className="btn-primary" onClick={() => { setEditPatient(null); setShowModal(true); }}>+ Add Patient</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><span className="stat-value">{stats.total || 0}</span><span className="stat-label">Total Patients</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.active || 0}</span><span className="stat-label">Active</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.today_appointments || 0}</span><span className="stat-label">Today's Appointments</span></div>
                <div className="stat-card info"><span className="stat-value">{stats.new_this_month || 0}</span><span className="stat-label">New This Month</span></div>
            </div>

            <div className="filters-bar">
                <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
                <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
            </div>

            {loading ? (<div className="loading">Loading patients...</div>) : (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Patient</th><th>Contact</th><th>Blood Group</th><th>Age</th><th>Last Visit</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {patients.length === 0 ? (<tr><td colSpan="7" className="empty-state">No patients found.</td></tr>) : (
                                patients.map(patient => (
                                    <tr key={patient.id}>
                                        <td>
                                            <div className="patient-cell">
                                                <div className="avatar">{patient.first_name?.[0]}{patient.last_name?.[0]}</div>
                                                <div><span className="patient-name">{patient.first_name} {patient.last_name}</span><span className="patient-id">{patient.patient_id}</span></div>
                                            </div>
                                        </td>
                                        <td><div>{patient.phone}</div><div className="email">{patient.email}</div></td>
                                        <td><span className="blood-badge">{patient.blood_group || '-'}</span></td>
                                        <td>{patient.date_of_birth ? Math.floor((new Date() - new Date(patient.date_of_birth)) / 31557600000) : '-'}</td>
                                        <td>{patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'Never'}</td>
                                        <td><span className={`status-badge ${patient.status}`}>{patient.status}</span></td>
                                        <td>
                                            <div className="actions">
                                                <button onClick={() => { setEditPatient(patient); setShowModal(true); }}>Edit</button>
                                                <button className="danger" onClick={() => handleDelete(patient.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && <PatientModal patient={editPatient} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchPatients(); fetchStats(); }} />}
            <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Delete Patient" message="Are you sure?" confirmText="Delete" variant="danger" />

            <style>{`
                .patients-page { padding: 24px; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .page-header h1 { margin: 0; font-size: 24px; }
                .subtitle { color: var(--text-secondary); margin: 4px 0 0; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                .stat-card { background: var(--bg-secondary); border-radius: 12px; padding: 20px; text-align: center; }
                .stat-value { display: block; font-size: 32px; font-weight: 700; }
                .stat-label { color: var(--text-secondary); font-size: 14px; }
                .stat-card.success .stat-value { color: #10b981; }
                .stat-card.warning .stat-value { color: #f59e0b; }
                .stat-card.info .stat-value { color: #3b82f6; }
                .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; }
                .search-input { flex: 1; padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); }
                .filters-bar select { padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); }
                .table-container { background: var(--bg-secondary); border-radius: 12px; overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
                th { background: var(--bg-tertiary); font-weight: 600; font-size: 13px; text-transform: uppercase; }
                .patient-cell { display: flex; align-items: center; gap: 12px; }
                .avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; }
                .patient-name { display: block; font-weight: 500; }
                .patient-id { font-size: 12px; color: var(--text-secondary); }
                .email { font-size: 12px; color: var(--text-secondary); }
                .blood-badge { padding: 4px 10px; border-radius: 20px; background: #fef2f2; color: #991b1b; font-weight: 600; font-size: 12px; }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: capitalize; }
                .status-badge.active { background: #d1fae5; color: #065f46; }
                .status-badge.inactive { background: #e5e7eb; color: #4b5563; }
                .actions { display: flex; gap: 8px; }
                .actions button { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; background: var(--bg-tertiary); }
                .actions button.danger { background: #fee2e2; color: #991b1b; }
                .btn-primary { background: var(--primary-color); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
                .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }
                .loading { text-align: center; padding: 40px; }
                .upgrade-prompt { text-align: center; padding: 60px; }
            `}</style>
        </div>
    );
};

const PatientModal = ({ patient, onClose, onSave }) => {
    const [form, setForm] = useState({
        first_name: patient?.first_name || '', last_name: patient?.last_name || '',
        email: patient?.email || '', phone: patient?.phone || '',
        date_of_birth: patient?.date_of_birth?.split('T')[0] || '', gender: patient?.gender || 'male',
        blood_group: patient?.blood_group || '', address: patient?.address || '',
        emergency_contact_name: patient?.emergency_contact_name || '',
        emergency_contact_phone: patient?.emergency_contact_phone || '',
        allergies: patient?.allergies || '', medical_conditions: patient?.medical_conditions || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (patient) await apiClient.put(`/patients/${patient.id}`, form);
            else await apiClient.post('/patients', form);
            onSave();
        } catch (error) { alert('Failed to save patient'); } finally { setSaving(false); }
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2>{patient ? 'Edit Patient' : 'Add Patient'}</h2><button className="close-btn" onClick={onClose}>×</button></div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group"><label>First Name *</label><input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required /></div>
                        <div className="form-group"><label>Last Name</label><input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
                        <div className="form-group"><label>Phone</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                        <div className="form-group"><label>Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} /></div>
                        <div className="form-group"><label>Gender</label><select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                        <div className="form-group"><label>Blood Group</label><select value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}><option value="">Select</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
                        <div className="form-group full"><label>Address</label><input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                        <div className="form-group"><label>Emergency Contact Name</label><input type="text" value={form.emergency_contact_name} onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })} /></div>
                        <div className="form-group"><label>Emergency Contact Phone</label><input type="tel" value={form.emergency_contact_phone} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} /></div>
                        <div className="form-group full"><label>Allergies</label><textarea value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} rows="2" /></div>
                        <div className="form-group full"><label>Medical Conditions</label><textarea value={form.medical_conditions} onChange={e => setForm({ ...form, medical_conditions: e.target.value })} rows="2" /></div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : (patient ? 'Update' : 'Create')}</button>
                    </div>
                </form>
            </div>
            <style>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; }
                .modal { background: var(--bg-primary); border-radius: 16px; width: 100%; max-width: 700px; max-height: 90vh; overflow: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
                .modal-header h2 { margin: 0; font-size: 20px; }
                .close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-secondary); }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group.full { grid-column: span 2; }
                .form-group label { font-weight: 500; font-size: 14px; }
                .form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; background: var(--bg-primary); color: var(--text-primary); }
                .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--border-color); }
                .btn-secondary { background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 10px 20px; border-radius: 8px; cursor: pointer; color: var(--text-primary); }
            `}</style>
        </div>,
        document.body
    );
};

export default PatientsList;
