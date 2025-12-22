import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient from '../../api/axios';

/**
 * Products List Page - E-Commerce Module
 */
const ProductsList = () => {
    const { hasModule } = useTenantConfig();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchStats();
    }, [search, category, status]);

    const fetchProducts = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (status) params.append('status', status);

            const response = await apiClient.get(`/products?${params}`);
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/products/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/products/stats');
            setStats(response.data.stats || {});
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Archive this product?')) return;
        try {
            await apiClient.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    if (!hasModule('products')) {
        return (
            <div className="upgrade-prompt">
                <h2>E-Commerce Module</h2>
                <p>Upgrade your plan to access Products & Orders management.</p>
                <button className="btn-primary">Upgrade Plan</button>
            </div>
        );
    }

    return (
        <div className="products-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Products</h1>
                    <p className="subtitle">Manage your product catalog</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>
                    + Add Product
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-value">{stats.total || 0}</span>
                    <span className="stat-label">Total Products</span>
                </div>
                <div className="stat-card success">
                    <span className="stat-value">{stats.active || 0}</span>
                    <span className="stat-label">Active</span>
                </div>
                <div className="stat-card warning">
                    <span className="stat-value">{stats.low_stock || 0}</span>
                    <span className="stat-label">Low Stock</span>
                </div>
                <div className="stat-card danger">
                    <span className="stat-value">{stats.out_of_stock || 0}</span>
                    <span className="stat-label">Out of Stock</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="loading">Loading products...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        No products found. Add your first product!
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="product-cell">
                                                <div className="product-image">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt={product.name} />
                                                    ) : (
                                                        <div className="placeholder">📦</div>
                                                    )}
                                                </div>
                                                <span className="product-name">{product.name}</span>
                                            </div>
                                        </td>
                                        <td><code>{product.sku || '-'}</code></td>
                                        <td>{product.category || '-'}</td>
                                        <td className="price">₹{product.price?.toLocaleString()}</td>
                                        <td>
                                            <span className={`stock ${product.stock <= 10 ? 'low' : ''}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${product.status}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button onClick={() => { setEditProduct(product); setShowModal(true); }}>
                                                    Edit
                                                </button>
                                                <button className="danger" onClick={() => handleDelete(product.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <ProductModal
                    product={editProduct}
                    categories={categories}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchProducts(); fetchStats(); }}
                />
            )}

            <style>{`
                .products-page { padding: 24px; }
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
                .search-input { flex: 1; padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; }
                .filters-bar select { padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; }
                
                .table-container { background: var(--bg-secondary); border-radius: 12px; overflow: hidden; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
                th { background: var(--bg-tertiary); font-weight: 600; font-size: 13px; text-transform: uppercase; }
                
                .product-cell { display: flex; align-items: center; gap: 12px; }
                .product-image { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: var(--bg-tertiary); }
                .product-image img { width: 100%; height: 100%; object-fit: cover; }
                .placeholder { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 20px; }
                
                .price { font-weight: 600; color: var(--primary-color); }
                .stock { padding: 4px 10px; border-radius: 20px; background: #d1fae5; color: #065f46; font-size: 13px; }
                .stock.low { background: #fee2e2; color: #991b1b; }
                
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: capitalize; }
                .status-badge.active { background: #d1fae5; color: #065f46; }
                .status-badge.draft { background: #fef3c7; color: #92400e; }
                .status-badge.archived { background: #e5e7eb; color: #4b5563; }
                
                .actions { display: flex; gap: 8px; }
                .actions button { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
                .actions button.danger { background: #fee2e2; color: #991b1b; }
                
                .btn-primary { background: var(--primary-color); color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
                .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }
                .loading { text-align: center; padding: 40px; }
                
                .upgrade-prompt { text-align: center; padding: 60px; }
                .upgrade-prompt h2 { margin-bottom: 12px; }
            `}</style>
        </div>
    );
};

/**
 * Product Add/Edit Modal
 */
const ProductModal = ({ product, categories, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: product?.name || '',
        sku: product?.sku || '',
        description: product?.description || '',
        price: product?.price || '',
        compare_price: product?.compare_price || '',
        category: product?.category || '',
        stock: product?.stock || 0,
        status: product?.status || 'draft'
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (product) {
                await apiClient.put(`/products/${product.id}`, form);
            } else {
                await apiClient.post('/products', form);
            }
            onSave();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full">
                            <label>Product Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>SKU</label>
                            <input
                                type="text"
                                value={form.sku}
                                onChange={e => setForm({ ...form, sku: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Price *</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Compare Price</label>
                            <input
                                type="number"
                                value={form.compare_price}
                                onChange={e => setForm({ ...form, compare_price: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Stock</label>
                            <input
                                type="number"
                                value={form.stock}
                                onChange={e => setForm({ ...form, stock: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                            </select>
                        </div>
                        <div className="form-group full">
                            <label>Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (product ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal { background: var(--bg-primary); border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
                .modal-header h2 { margin: 0; font-size: 20px; }
                .close-btn { background: none; border: none; font-size: 28px; cursor: pointer; color: var(--text-secondary); }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group.full { grid-column: span 2; }
                .form-group label { font-weight: 500; font-size: 14px; }
                .form-group input, .form-group select, .form-group textarea { padding: 10px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; }
                
                .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--border-color); }
                .btn-secondary { background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 10px 20px; border-radius: 8px; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default ProductsList;
