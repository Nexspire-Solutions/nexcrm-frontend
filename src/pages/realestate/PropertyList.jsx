import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const PropertyList = () => {
    const { hasModule } = useTenantConfig();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editProperty, setEditProperty] = useState(null);
    const [stats, setStats] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    useEffect(() => {
        fetchProperties();
        fetchStats();
    }, [search, propertyType, status]);

    const fetchProperties = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (propertyType) params.append('property_type', propertyType);
            if (status) params.append('status', status);
            const response = await apiClient.get(`/properties?${params}`);
            setProperties(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/properties/stats');
            setStats(response.data.stats || {});
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleDelete = (id) => { setDeleteTargetId(id); setShowDeleteConfirm(true); };
    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            await apiClient.delete(`/properties/${deleteTargetId}`);
            fetchProperties();
            setDeleteTargetId(null);
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    if (!hasModule('properties')) {
        return (
            <div className="upgrade-prompt">
                <h2>Real Estate Module</h2>
                <p>Upgrade your plan to access Property Management.</p>
                <button className="btn-primary">Upgrade Plan</button>
            </div>
        );
    }

    return (
        <div className="properties-page">
            <div className="page-header">
                <div>
                    <h1>Properties</h1>
                    <p className="subtitle">Manage your property listings</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditProperty(null); setShowModal(true); }}>
                    + Add Property
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><span className="stat-value">{stats.total || 0}</span><span className="stat-label">Total Properties</span></div>
                <div className="stat-card success"><span className="stat-value">{stats.available || 0}</span><span className="stat-label">Available</span></div>
                <div className="stat-card warning"><span className="stat-value">{stats.rented || 0}</span><span className="stat-label">Rented</span></div>
                <div className="stat-card info"><span className="stat-value">{stats.sold || 0}</span><span className="stat-label">Sold</span></div>
            </div>

            <div className="filters-bar">
                <input type="text" placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="sold">Sold</option>
                </select>
            </div>

            {loading ? (
                <div className="loading">Loading properties...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Property</th><th>Type</th><th>Location</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {properties.length === 0 ? (
                                <tr><td colSpan="6" className="empty-state">No properties found. Add your first property!</td></tr>
                            ) : (
                                properties.map(property => (
                                    <tr key={property.id}>
                                        <td>
                                            <div className="property-cell">
                                                <div className="property-image">
                                                    {property.images?.[0] ? <img src={property.images[0]} alt={property.title} /> : <div className="placeholder">🏠</div>}
                                                </div>
                                                <div>
                                                    <span className="property-name">{property.title}</span>
                                                    <span className="property-code">{property.property_code}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="type-badge">{property.property_type}</span></td>
                                        <td>{property.city}, {property.state}</td>
                                        <td className="price">₹{property.price?.toLocaleString()}</td>
                                        <td><span className={`status-badge ${property.status}`}>{property.status}</span></td>
                                        <td>
                                            <div className="actions">
                                                <button onClick={() => { setEditProperty(property); setShowModal(true); }}>Edit</button>
                                                <button className="danger" onClick={() => handleDelete(property.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && <PropertyModal property={editProperty} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchProperties(); fetchStats(); }} />}
            <ConfirmModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDelete} title="Delete Property" message="Are you sure?" confirmText="Delete" variant="danger" />

            <style>{`
                .properties-page { padding: 24px; }
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
                .property-cell { display: flex; align-items: center; gap: 12px; }
                .property-image { width: 50px; height: 50px; border-radius: 8px; overflow: hidden; background: var(--bg-tertiary); }
                .property-image img { width: 100%; height: 100%; object-fit: cover; }
                .placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 24px; }
                .property-name { display: block; font-weight: 500; }
                .property-code { font-size: 12px; color: var(--text-secondary); }
                .price { font-weight: 600; color: var(--primary-color); }
                .type-badge { padding: 4px 10px; border-radius: 20px; background: var(--bg-tertiary); font-size: 12px; text-transform: capitalize; }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: capitalize; }
                .status-badge.available { background: #d1fae5; color: #065f46; }
                .status-badge.rented { background: #dbeafe; color: #1e40af; }
                .status-badge.sold { background: #e5e7eb; color: #4b5563; }
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

const PropertyModal = ({ property, onClose, onSave }) => {
    const [form, setForm] = useState({
        title: property?.title || '', property_type: property?.property_type || 'apartment',
        listing_type: property?.listing_type || 'sale', price: property?.price || '',
        area_sqft: property?.area_sqft || '', bedrooms: property?.bedrooms || '',
        bathrooms: property?.bathrooms || '', address: property?.address || '',
        city: property?.city || '', state: property?.state || '', pincode: property?.pincode || '',
        description: property?.description || '', status: property?.status || 'available'
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (property) await apiClient.put(`/properties/${property.id}`, form);
            else await apiClient.post('/properties', form);
            onSave();
        } catch (error) {
            alert('Failed to save property');
        } finally { setSaving(false); }
    };

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{property ? 'Edit Property' : 'Add Property'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full"><label>Title *</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
                        <div className="form-group"><label>Type</label><select value={form.property_type} onChange={e => setForm({ ...form, property_type: e.target.value })}><option value="apartment">Apartment</option><option value="house">House</option><option value="villa">Villa</option><option value="commercial">Commercial</option><option value="land">Land</option></select></div>
                        <div className="form-group"><label>Listing</label><select value={form.listing_type} onChange={e => setForm({ ...form, listing_type: e.target.value })}><option value="sale">For Sale</option><option value="rent">For Rent</option></select></div>
                        <div className="form-group"><label>Price *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
                        <div className="form-group"><label>Area (sqft)</label><input type="number" value={form.area_sqft} onChange={e => setForm({ ...form, area_sqft: e.target.value })} /></div>
                        <div className="form-group"><label>Bedrooms</label><input type="number" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })} /></div>
                        <div className="form-group"><label>Bathrooms</label><input type="number" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} /></div>
                        <div className="form-group full"><label>Address</label><input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                        <div className="form-group"><label>City</label><input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                        <div className="form-group"><label>State</label><input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
                        <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="available">Available</option><option value="rented">Rented</option><option value="sold">Sold</option></select></div>
                        <div className="form-group full"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="3" /></div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : (property ? 'Update' : 'Create')}</button>
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

export default PropertyList;
