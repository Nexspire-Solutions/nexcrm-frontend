import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const RoomsList = () => {
    const { hasModule } = useTenantConfig();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [roomType, setRoomType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editRoom, setEditRoom] = useState(null);
    const [stats, setStats] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    useEffect(() => { fetchRooms(); fetchStats(); }, [status, roomType]);

    const fetchRooms = async () => {
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (roomType) params.append('room_type_id', roomType);
            const response = await apiClient.get(`/rooms?${params}`);
            setRooms(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally { setLoading(false); }
    };

    const fetchStats = async () => {
        try { const response = await apiClient.get('/rooms/stats'); setStats(response.data.stats || {}); } catch (error) { }
    };

    const handleDelete = (id) => { setDeleteTargetId(id); setShowDeleteConfirm(true); };
    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try { await apiClient.delete(`/rooms/${deleteTargetId}`); fetchRooms(); setDeleteTargetId(null); } catch (error) { }
    };

    if (!hasModule('rooms')) {
        return (<div className="upgrade-prompt"><h2>Hospitality Module</h2><p>Upgrade your plan to access Room Management.</p><button className="btn-primary">Upgrade Plan</button></div>);
    }

    return (
        <div className="rooms-page">
            <div className="page-header">
                <div><h1>Rooms</h1><p className="subtitle">Manage hotel rooms</p></div>
                <button className="btn-primary" onClick={() => { setEditRoom(null); setShowModal(true); }}>+ Add Room</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><span className="stat-value">{stats.total || 0}</span><span className="stat-label">Total Rooms</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.available || 0}</span><span className="stat-label">Available</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.occupied || 0}</span><span className="stat-label">Occupied</span></div>
                <div className="stat-card danger"><span className="stat-value">{stats.maintenance || 0}</span><span className="stat-label">Maintenance</span></div>
            </div>

            <div className="filters-bar">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="cleaning">Cleaning</option>
                </select>
            </div>

            {loading ? (<div className="loading">Loading rooms...</div>) : (
                <div className="rooms-grid">
                    {rooms.length === 0 ? (<div className="empty-state">No rooms found.</div>) : (
                        rooms.map(room => (
                            <div key={room.id} className={`room-card ${room.status}`}>
                                <div className="room-header">
                                    <span className="room-number">{room.room_number}</span>
                                    <span className={`status-badge ${room.status}`}>{room.status}</span>
                                </div>
                                <div className="room-type">{room.type_name || 'Standard'}</div>
                                <div className="room-details">
                                    <span>🛏️ {room.beds || 1} Bed</span>
                                    <span>👥 Max {room.max_occupancy || 2}</span>
                                </div>
                                <div className="room-price">₹{room.price_per_night?.toLocaleString() || 0}/night</div>
                                <div className="room-actions">
                                    <button onClick={() => { setEditRoom(room); setShowModal(true); }}>Edit</button>
                                    <button className="danger" onClick={() => handleDelete(room.id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showModal && <RoomModal room={editRoom} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchRooms(); fetchStats(); }} />}
            <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Delete Room" message="Are you sure?" confirmText="Delete" variant="danger" />

            <style>{`
                .rooms-page { padding: 24px; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .page-header h1 { margin: 0; font-size: 24px; }
                .subtitle { color: var(--text-secondary); margin: 4px 0 0; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                .stat-card { background: var(--bg-secondary); border-radius: 12px; padding: 20px; text-align: center; }
                .stat-value { display: block; font-size: 32px; font-weight: 700; }
                .stat-label { color: var(--text-secondary); font-size: 14px; }
                .stat-card.success .stat-value { color: #10b981; }
                .stat-card.warning .stat-value { color: #f59e0b; }
                .stat-card.danger .stat-value { color: #ef4444; }
                .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; }
                .filters-bar select { padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); }
                .rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
                .room-card { background: var(--bg-secondary); border-radius: 12px; padding: 20px; border-left: 4px solid var(--border-color); }
                .room-card.available { border-left-color: #10b981; }
                .room-card.occupied { border-left-color: #f59e0b; }
                .room-card.reserved { border-left-color: #3b82f6; }
                .room-card.maintenance { border-left-color: #ef4444; }
                .room-card.cleaning { border-left-color: #8b5cf6; }
                .room-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                .room-number { font-size: 24px; font-weight: 700; }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; text-transform: uppercase; font-weight: 600; }
                .status-badge.available { background: #d1fae5; color: #065f46; }
                .status-badge.occupied { background: #fef3c7; color: #92400e; }
                .status-badge.reserved { background: #dbeafe; color: #1e40af; }
                .status-badge.maintenance { background: #fee2e2; color: #991b1b; }
                .status-badge.cleaning { background: #ede9fe; color: #5b21b6; }
                .room-type { color: var(--text-secondary); font-size: 14px; margin-bottom: 12px; }
                .room-details { display: flex; gap: 16px; font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
                .room-price { font-size: 18px; font-weight: 600; color: var(--primary-color); margin-bottom: 16px; }
                .room-actions { display: flex; gap: 8px; }
                .room-actions button { flex: 1; padding: 8px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; background: var(--bg-tertiary); }
                .room-actions button.danger { background: #fee2e2; color: #991b1b; }
                .btn-primary { background: var(--primary-color); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
                .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); grid-column: 1 / -1; }
                .loading { text-align: center; padding: 40px; }
                .upgrade-prompt { text-align: center; padding: 60px; }
            `}</style>
        </div>
    );
};

const RoomModal = ({ room, onClose, onSave }) => {
    const [form, setForm] = useState({
        room_number: room?.room_number || '', floor: room?.floor || '',
        room_type_id: room?.room_type_id || '', status: room?.status || 'available',
        price_per_night: room?.price_per_night || '', max_occupancy: room?.max_occupancy || 2,
        amenities: room?.amenities || '', notes: room?.notes || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (room) await apiClient.put(`/rooms/${room.id}`, form);
            else await apiClient.post('/rooms', form);
            onSave();
        } catch (error) { alert('Failed to save room'); } finally { setSaving(false); }
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2>{room ? 'Edit Room' : 'Add Room'}</h2><button className="close-btn" onClick={onClose}>×</button></div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group"><label>Room Number *</label><input type="text" value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} required /></div>
                        <div className="form-group"><label>Floor</label><input type="text" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} /></div>
                        <div className="form-group"><label>Price/Night *</label><input type="number" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} required /></div>
                        <div className="form-group"><label>Max Occupancy</label><input type="number" value={form.max_occupancy} onChange={e => setForm({ ...form, max_occupancy: e.target.value })} /></div>
                        <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="available">Available</option><option value="occupied">Occupied</option><option value="reserved">Reserved</option><option value="maintenance">Maintenance</option><option value="cleaning">Cleaning</option></select></div>
                        <div className="form-group full"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows="2" /></div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : (room ? 'Update' : 'Create')}</button>
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

export default RoomsList;
