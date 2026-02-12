/**
 * E-Commerce Products Page - Full CRUD Management
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
    name: '', sku: '', price: '', compare_at_price: '', inventory_count: '',
    status: 'active', image_url: '', description: '', category_id: ''
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);

    console.log('Products render, showForm:', showForm);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(), 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    const fetchProducts = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const response = await apiClient.get('/ecommerce/products', { params });
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/ecommerce/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            // Categories are optional
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name?.trim()) {
            toast.error('Product name is required');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
                inventory_count: parseInt(formData.inventory_count) || 0,
                category_id: formData.category_id || null
            };

            if (editingId) {
                await apiClient.put(`/ecommerce/products/${editingId}`, payload);
                toast.success('Product updated');
            } else {
                await apiClient.post('/ecommerce/products', payload);
                toast.success('Product created');
            }
            closeForm();
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name || '',
            sku: product.sku || '',
            price: product.price?.toString() || '',
            compare_at_price: product.compare_at_price?.toString() || '',
            inventory_count: product.inventory_count?.toString() || '',
            status: product.status || 'active',
            image_url: product.image_url || '',
            description: product.description || '',
            category_id: product.category_id?.toString() || ''
        });
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
        try {
            await apiClient.delete(`/ecommerce/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(INITIAL_FORM);
    };

    const openAddForm = () => {
        console.log('openAddForm clicked, setting showForm to true');
        setFormData(INITIAL_FORM);
        setEditingId(null);
        setShowForm(true);
    };

    const handleExport = () => {
        const csv = [
            ['Name', 'SKU', 'Price', 'Stock', 'Status', 'Description'],
            ...products.map(p => [
                p.name, p.sku || '', p.price || '', p.inventory_count || '', p.status || '', (p.description || '').replace(/,/g, ';')
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        draft: products.filter(p => p.status !== 'active').length,
        lowStock: products.filter(p => p.inventory_count <= (p.low_stock_threshold || 5)).length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span>E-commerce</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Products</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
                    <p className="text-slate-500 text-sm">Manage your e-commerce product catalog</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <button
                        onClick={openAddForm}
                        className="btn-primary flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Products', value: stats.total, color: 'indigo' },
                    { label: 'Active', value: stats.active, color: 'emerald' },
                    { label: 'Draft', value: stats.draft, color: 'amber' },
                    { label: 'Low Stock', value: stats.lowStock, color: 'rose' }
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 items-center">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-80 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No products found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Get started by adding your first product.</p>
                        <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
                            Add First Product
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Image</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3">
                                        <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                                        {product.description && (
                                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{product.sku || '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 dark:text-white">
                                            {product.currency || '$'}{parseFloat(product.price || 0).toFixed(2)}
                                        </div>
                                        {product.compare_at_price && (
                                            <div className="text-xs text-slate-400 line-through">
                                                {product.currency || '$'}{parseFloat(product.compare_at_price).toFixed(2)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-medium ${product.inventory_count <= (product.low_stock_threshold || 5) ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {product.inventory_count ?? 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : product.status === 'archived'
                                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {product.status || 'draft'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(product)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Product Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingId ? 'Edit Product' : 'Add Product'}
                            </h2>
                            <button onClick={closeForm} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Premium Moisturizer"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* SKU + Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        placeholder="Auto-generated if blank"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    {categories.length > 0 ? (
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">No category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            placeholder="Category ID"
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Compare Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.compare_at_price}
                                        onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                                        placeholder="Original price"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Qty</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.inventory_count}
                                        onChange={(e) => setFormData({ ...formData, inventory_count: e.target.value })}
                                        placeholder="0"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Status + Image URL */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Product description..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                ></textarea>
                            </div>

                            {/* Image Preview */}
                            {formData.image_url && (
                                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <span className="text-sm text-slate-500">Image preview</span>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" onClick={closeForm} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {saving && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {editingId ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
