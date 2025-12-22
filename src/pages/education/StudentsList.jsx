import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const StudentsList = () => {
    const { hasModule } = useTenantConfig();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [stats, setStats] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    useEffect(() => { fetchStudents(); fetchStats(); }, [search, status]);

    const fetchStudents = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            const response = await apiClient.get(`/students?${params}`);
            setStudents(response.data.data || []);
        } catch (error) { console.error('Failed to fetch students:', error); } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try { const response = await apiClient.get('/students/stats'); setStats(response.data.stats || {}); } catch (error) { }
    };

    const handleDelete = (id) => { setDeleteTargetId(id); setShowDeleteConfirm(true); };
    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try { await apiClient.delete(`/students/${deleteTargetId}`); fetchStudents(); setDeleteTargetId(null); } catch (error) { }
    };

    if (!hasModule('students')) {
        return (<div className="upgrade-prompt"><h2>Education Module</h2><p>Upgrade your plan to access Student Management.</p><button className="btn-primary">Upgrade Plan</button></div>);
    }

    return (
        <div className="students-page">
            <div className="page-header">
                <div><h1>Students</h1><p className="subtitle">Manage student records</p></div>
                <button className="btn-primary" onClick={() => { setEditStudent(null); setShowModal(true); }}>+ Add Student</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><span className="stat-value">{stats.total || 0}</span><span className="stat-label">Total Students</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.active || 0}</span><span className="stat-label">Active</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.pending_fees || 0}</span><span className="stat-label">Pending Fees</span></div>
                <div className="stat-card info"><span className="stat-value">{stats.new_this_month || 0}</span><span className="stat-label">New This Month</span></div>
            </div>

            <div className="filters-bar">
                <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
                <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="graduated">Graduated</option></select>
            </div>

            {loading ? (<div className="loading">Loading students...</div>) : (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Student</th><th>Contact</th><th>Course</th><th>Enrolled</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {students.length === 0 ? (<tr><td colSpan="6" className="empty-state">No students found.</td></tr>) : (
                                students.map(student => (
                                    <tr key={student.id}>
                                        <td>
                                            <div className="student-cell">
                                                <div className="avatar">{student.first_name?.[0]}{student.last_name?.[0]}</div>
                                                <div><span className="student-name">{student.first_name} {student.last_name}</span><span className="student-id">{student.student_id}</span></div>
                                            </div>
                                        </td>
                                        <td><div>{student.phone}</div><div className="email">{student.email}</div></td>
                                        <td>{student.course_name || '-'}</td>
                                        <td>{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : '-'}</td>
                                        <td><span className={`status-badge ${student.status}`}>{student.status}</span></td>
                                        <td>
                                            <div className="actions">
                                                <button onClick={() => { setEditStudent(student); setShowModal(true); }}>Edit</button>
                                                <button className="danger" onClick={() => handleDelete(student.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && <StudentModal student={editStudent} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchStudents(); fetchStats(); }} />}
            <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Delete Student" message="Are you sure?" confirmText="Delete" variant="danger" />

            <style>{`
                .students-page { padding: 24px; }
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
                .student-cell { display: flex; align-items: center; gap: 12px; }
                .avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; }
                .student-name { display: block; font-weight: 500; }
                .student-id { font-size: 12px; color: var(--text-secondary); }
                .email { font-size: 12px; color: var(--text-secondary); }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: capitalize; }
                .status-badge.active { background: #d1fae5; color: #065f46; }
                .status-badge.inactive { background: #e5e7eb; color: #4b5563; }
                .status-badge.graduated { background: #dbeafe; color: #1e40af; }
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

const StudentModal = ({ student, onClose, onSave }) => {
    const [form, setForm] = useState({
        first_name: student?.first_name || '', last_name: student?.last_name || '',
        email: student?.email || '', phone: student?.phone || '',
        date_of_birth: student?.date_of_birth?.split('T')[0] || '', gender: student?.gender || 'male',
        address: student?.address || '', guardian_name: student?.guardian_name || '',
        guardian_phone: student?.guardian_phone || '', status: student?.status || 'active'
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (student) await apiClient.put(`/students/${student.id}`, form);
            else await apiClient.post('/students', form);
            onSave();
        } catch (error) { alert('Failed to save student'); } finally { setSaving(false); }
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2>{student ? 'Edit Student' : 'Add Student'}</h2><button className="close-btn" onClick={onClose}>×</button></div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group"><label>First Name *</label><input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required /></div>
                        <div className="form-group"><label>Last Name</label><input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
                        <div className="form-group"><label>Phone</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                        <div className="form-group"><label>Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} /></div>
                        <div className="form-group"><label>Gender</label><select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                        <div className="form-group"><label>Guardian Name</label><input type="text" value={form.guardian_name} onChange={e => setForm({ ...form, guardian_name: e.target.value })} /></div>
                        <div className="form-group"><label>Guardian Phone</label><input type="tel" value={form.guardian_phone} onChange={e => setForm({ ...form, guardian_phone: e.target.value })} /></div>
                        <div className="form-group full"><label>Address</label><input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : (student ? 'Update' : 'Create')}</button>
                    </div>
                </form>
            </div>
            <style>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; }
                .modal { background: var(--bg-primary); border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow: auto; }
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

export default StudentsList;
