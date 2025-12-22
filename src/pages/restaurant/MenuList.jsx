import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';

const MenuList = () => {
    const { hasModule } = useTenantConfig();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => { fetchMenu(); fetchCategories(); }, [categoryFilter]);

    const fetchMenu = async () => {
        try {
            const params = new URLSearchParams();
            if (categoryFilter) params.append('category_id', categoryFilter);
            const response = await apiClient.get(`/menu?${params}`);
            setItems(response.data.data || []);
        } catch (error) { console.error('Failed:', error); } finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try { const r = await apiClient.get('/menu/categories'); setCategories(r.data.data || []); } catch (e) { }
    };

    if (!hasModule('menu')) {
        return <div className="upgrade-prompt"><h2>Restaurant Module</h2><p>Upgrade to access.</p></div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 style={{ margin: 0 }}>Menu Items</h1>
                <button className="btn-primary">+ Add Item</button>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                    {items.length === 0 ? <div style={{ textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>No items found.</div> : items.map(item => (
                        <div key={item.id} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 20 }}>
                            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>{item.is_vegetarian ? '🥗' : '🍖'}</div>
                            <h3 style={{ margin: '0 0 4px', textAlign: 'center' }}>{item.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', margin: '0 0 12px' }}>{item.category_name}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary-color)' }}>₹{item.price}</span>
                                <span className={`status-badge ${item.is_available ? 'available' : 'unavailable'}`}>{item.is_available ? 'Available' : 'Unavailable'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                .status-badge{padding:4px 12px;border-radius:20px;font-size:12px}
                .status-badge.available{background:#d1fae5;color:#065f46}
                .status-badge.unavailable{background:#fee2e2;color:#991b1b}
                .btn-primary{background:var(--primary-color);color:white;border:none;padding:12px 20px;border-radius:8px;cursor:pointer}
            `}</style>
        </div>
    );
};

export default MenuList;
