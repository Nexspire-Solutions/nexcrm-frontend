import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const CoursesList = () => {
    const { hasModule } = useTenantConfig();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [stats, setStats] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    useEffect(() => { fetchCourses(); fetchStats(); }, [search]);

    const fetchCourses = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            const response = await apiClient.get(`/courses?${params}`);
            setCourses(response.data.data || []);
        } catch (error) { console.error('Failed to fetch courses:', error); } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try { const response = await apiClient.get('/courses/stats'); setStats(response.data.stats || {}); } catch (error) { }
    };

    const handleDelete = (id) => { setDeleteTargetId(id); setShowDeleteConfirm(true); };
    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try { await apiClient.delete(`/courses/${deleteTargetId}`); fetchCourses(); setDeleteTargetId(null); } catch (error) { }
    };

    if (!hasModule('courses')) {
        return (<div className="upgrade-prompt"><h2>Education Module</h2><p>Upgrade your plan to access Course Management.</p><button className="btn-primary">Upgrade Plan</button></div>);
    }

    return (
        <div className="courses-page">
            <div className="page-header">
                <div><h1>Courses</h1><p className="subtitle">Manage courses and batches</p></div>
                <button className="btn-primary" onClick={() => { setEditCourse(null); setShowModal(true); }}>+ Add Course</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><span className="stat-value">{stats.total || 0}</span><span className="stat-label">Total Courses</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.active || 0}</span><span className="stat-label">Active</span></div>
                <div className="stat-card info"><span className="stat-value">{stats.total_students || 0}</span><span className="stat-label">Total Students</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.active_batches || 0}</span><span className="stat-label">Active Batches</span></div>
            </div>

            <div className="filters-bar">
                <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
            </div>

            {loading ? (<div className="loading">Loading courses...</div>) : (
                <div className="courses-grid">
                    {courses.length === 0 ? (<div className="empty-state">No courses found.</div>) : (
                        courses.map(course => (
                            <div key={course.id} className="course-card">
                                <div className="course-icon">📚</div>
                                <h3>{course.name}</h3>
                                <p className="course-code">{course.course_code}</p>
                                <div className="course-meta">
                                    <span>⏱️ {course.duration_hours || 0}h</span>
                                    <span>₹{course.fee?.toLocaleString() || 0}</span>
                                </div>
                                <div className={`status-badge ${course.status}`}>{course.status}</div>
                                <div className="course-actions">
                                    <button onClick={() => { setEditCourse(course); setShowModal(true); }}>Edit</button>
                                    <button className="danger" onClick={() => handleDelete(course.id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showModal && <CourseModal course={editCourse} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchCourses(); fetchStats(); }} />}
            <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Delete Course" message="Are you sure?" confirmText="Delete" variant="danger" />

            <style>{`
                .courses-page { padding: 24px; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .page-header h1 { margin: 0; font-size: 24px; }
                .subtitle { color: var(--text-secondary); margin: 4px 0 0; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                .stat-card { background: var(--bg-secondary); border-radius: 12px; padding: 20px; text-align: center; }
                .stat-value { display: block; font-size: 32px; font-weight: 700; }
                .stat-label { color: var(--text-secondary); font-size: 14px; }
                .stat-card.success .stat-value { color: #10b981; }
                .stat-card.info .stat-value { color: #3b82f6; }
                .stat-card.warning .stat-value { color: #f59e0b; }
                .filters-bar { margin-bottom: 20px; }
                .search-input { width: 100%; max-width: 400px; padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); }
                .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
                .course-card { background: var(--bg-secondary); border-radius: 12px; padding: 24px; text-align: center; }
                .course-icon { font-size: 48px; margin-bottom: 12px; }
                .course-card h3 { margin: 0 0 4px; font-size: 18px; }
                .course-code { color: var(--text-secondary); font-size: 13px; margin: 0 0 16px; }
                .course-meta { display: flex; justify-content: center; gap: 16px; font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; }
                .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: capitalize; margin-bottom: 16px; }
                .status-badge.active { background: #d1fae5; color: #065f46; }
                .status-badge.inactive { background: #e5e7eb; color: #4b5563; }
                .course-actions { display: flex; gap: 8px; justify-content: center; }
                .course-actions button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; background: var(--bg-tertiary); }
                .course-actions button.danger { background: #fee2e2; color: #991b1b; }
                .btn-primary { background: var(--primary-color); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
                .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); grid-column: 1 / -1; }
                .loading { text-align: center; padding: 40px; }
                .upgrade-prompt { text-align: center; padding: 60px; }
            `}</style>
        </div>
    );
};

const CourseModal = ({ course, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: course?.name || '', course_code: course?.course_code || '',
        description: course?.description || '', duration_hours: course?.duration_hours || '',
        fee: course?.fee || '', max_students: course?.max_students || '',
        status: course?.status || 'active'
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (course) await apiClient.put(`/courses/${course.id}`, form);
            else await apiClient.post('/courses', form);
            onSave();
        } catch (error) { alert('Failed to save course'); } finally { setSaving(false); }
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2>{course ? 'Edit Course' : 'Add Course'}</h2><button className="close-btn" onClick={onClose}>×</button></div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full"><label>Course Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                        <div className="form-group"><label>Course Code</label><input type="text" value={form.course_code} onChange={e => setForm({ ...form, course_code: e.target.value })} /></div>
                        <div className="form-group"><label>Duration (hours)</label><input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: e.target.value })} /></div>
                        <div className="form-group"><label>Fee</label><input type="number" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} /></div>
                        <div className="form-group"><label>Max Students</label><input type="number" value={form.max_students} onChange={e => setForm({ ...form, max_students: e.target.value })} /></div>
                        <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                        <div className="form-group full"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" /></div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : (course ? 'Update' : 'Create')}</button>
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

export default CoursesList;
