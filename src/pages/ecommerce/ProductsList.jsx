import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import apiClient, { tenantUtils } from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

/**
 * Products List Page - E-Commerce Module (with Inventory Management)
 */
const ProductsList = () => {
    const { hasModule } = useTenantConfig();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const mediaBaseUrl = tenantUtils.getMediaBaseUrl();
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [stats, setStats] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    // Bulk import state
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);
    // Tab and Inventory state
    const [activeTab, setActiveTab] = useState('products');
    const [showStockAdjust, setShowStockAdjust] = useState(false);
    const [adjustProduct, setAdjustProduct] = useState(null);
    const [adjustForm, setAdjustForm] = useState({ type: 'add', quantity: '', reason: '' });
    const [adjusting, setAdjusting] = useState(false);

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
            toast.error('Failed to load products');
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

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            await apiClient.delete(`/products/${deleteTargetId}`);
            toast.success('Product archived successfully');
            fetchProducts();
            fetchStats();
            setDeleteTargetId(null);
        } catch (error) {
            console.error('Failed to delete:', error);
            toast.error('Failed to archive product');
        }
    };

    const handleSave = () => {
        setShowModal(false);
        fetchProducts();
        fetchStats();
        toast.success(editProduct ? 'Product updated successfully' : 'Product created successfully');
    };

    // Bulk import handler
    const handleBulkImport = async (file, duplicateAction) => {
        setImporting(true);
        setImportResults(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('duplicateAction', duplicateAction);

            const response = await apiClient.post('/products/bulk-import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setImportResults(response.data.results);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchProducts();
                fetchStats();
            }
        } catch (error) {
            console.error('Bulk import failed:', error);
            toast.error(error.response?.data?.error || 'Failed to import products');
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await apiClient.get('/products/bulk-import/template', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product_import_template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download template failed:', error);
            toast.error('Failed to download template');
        }
    };

    // Stock adjustment handler
    const handleStockAdjust = async () => {
        if (!adjustProduct || !adjustForm.quantity) {
            toast.error('Please enter a quantity');
            return;
        }

        setAdjusting(true);
        try {
            const quantity = parseInt(adjustForm.quantity);
            let newStock = adjustProduct.stock || 0;

            if (adjustForm.type === 'add') {
                newStock += quantity;
            } else if (adjustForm.type === 'remove') {
                newStock = Math.max(0, newStock - quantity);
            } else if (adjustForm.type === 'set') {
                newStock = quantity;
            }

            await apiClient.put(`/products/${adjustProduct.id}`, {
                ...adjustProduct,
                stock: newStock
            });

            toast.success('Stock adjusted successfully');
            setShowStockAdjust(false);
            setAdjustProduct(null);
            setAdjustForm({ type: 'add', quantity: '', reason: '' });
            fetchProducts();
            fetchStats();
        } catch (error) {
            console.error('Stock adjustment failed:', error);
            toast.error('Failed to adjust stock');
        } finally {
            setAdjusting(false);
        }
    };

    const openStockAdjust = (product) => {
        setAdjustProduct(product);
        setAdjustForm({ type: 'add', quantity: '', reason: '' });
        setShowStockAdjust(true);
    };

    if (!hasModule('products')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">E-Commerce Module</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Upgrade your plan to access Products & Orders management.</p>
                    <button className="btn-primary">Upgrade Plan</button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Products & Inventory</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {activeTab === 'products' ? 'Manage your product catalog' : 'Track and adjust stock levels'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {activeTab === 'products' && (
                        <>
                            <button
                                onClick={() => { setShowBulkImport(true); setImportResults(null); }}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Bulk Import
                            </button>
                            <button
                                onClick={() => { setEditProduct(null); setShowModal(true); }}
                                className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Product
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'products'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Products
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'inventory'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        Inventory
                    </div>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Products</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.low_stock || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Low Stock</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.out_of_stock || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Out of Stock</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10 w-full"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="select">
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>

            {/* Products Table */}
            {activeTab === 'products' && (
                loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">SKU</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12">
                                            <div className="empty-state">
                                                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <h3 className="empty-state-title">No products found</h3>
                                                <p className="empty-state-text">Add your first product to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                                                        {product.images?.[0] ? (
                                                            <img src={`${mediaBaseUrl}${product.images[0]}`} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-slate-900 dark:text-white">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                                    {product.sku || '-'}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{product.category || '-'}</td>
                                            <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                                                ₹{product.price?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock <= 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    product.stock <= 10 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    product.status === 'draft' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditProduct(product); setShowModal(true); }}
                                                        className="btn-ghost btn-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Inventory Table */}
            {activeTab === 'inventory' && (
                loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">SKU</th>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Current Stock</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12">
                                                <div className="empty-state">
                                                    <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                    </svg>
                                                    <h3 className="empty-state-title">No inventory items</h3>
                                                    <p className="empty-state-text">Add products to track inventory</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map(product => (
                                            <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                                        {product.sku || '-'}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                                                            {product.images?.[0] ? (
                                                                <img src={`${mediaBaseUrl}${product.images[0]}`} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${product.stock <= 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        product.stock <= 10 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }`}>
                                                        {product.stock || 0} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock <= 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        product.stock <= 10 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }`}>
                                                        {product.stock <= 0 ? 'Out of Stock' : product.stock <= 10 ? 'Low Stock' : 'In Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{product.category || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => openStockAdjust(product)}
                                                        className="btn-secondary btn-sm flex items-center gap-1.5"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        Adjust Stock
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <ProductModal
                    product={editProduct}
                    categories={categories}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    onCategoryAdd={fetchCategories}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Archive Product"
                message="Are you sure you want to archive this product?"
                confirmText="Archive"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Bulk Import Modal */}
            {showBulkImport && (
                <BulkImportModal
                    onClose={() => setShowBulkImport(false)}
                    onImport={handleBulkImport}
                    onDownloadTemplate={downloadTemplate}
                    importing={importing}
                    results={importResults}
                />
            )}

            {/* Stock Adjustment Modal */}
            {showStockAdjust && adjustProduct && (
                <Modal
                    isOpen={true}
                    onClose={() => { setShowStockAdjust(false); setAdjustProduct(null); }}
                    title="Adjust Stock Level"
                    footer={
                        <>
                            <button onClick={() => { setShowStockAdjust(false); setAdjustProduct(null); }} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleStockAdjust} className="btn-primary" disabled={adjusting}>
                                {adjusting ? 'Adjusting...' : 'Save Adjustment'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                                    {adjustProduct.images?.[0] ? (
                                        <img src={`${mediaBaseUrl}${adjustProduct.images[0]}`} alt={adjustProduct.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{adjustProduct.name}</p>
                                    <p className="text-sm text-slate-500">Current Stock: <span className="font-semibold">{adjustProduct.stock || 0} units</span></p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="label">Adjustment Type</label>
                            <select
                                value={adjustForm.type}
                                onChange={e => setAdjustForm({ ...adjustForm, type: e.target.value })}
                                className="select"
                            >
                                <option value="add">Add Stock</option>
                                <option value="remove">Remove Stock</option>
                                <option value="set">Set Absolute Quantity</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Quantity</label>
                            <input
                                type="number"
                                value={adjustForm.quantity}
                                onChange={e => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                                className="input"
                                placeholder="Enter quantity"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="label">Reason (Optional)</label>
                            <textarea
                                value={adjustForm.reason}
                                onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                                className="input"
                                rows="2"
                                placeholder="Reason for adjustment..."
                            ></textarea>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

/**
 * Product Add/Edit Modal
 */
const ProductModal = ({ product, categories, onClose, onSave, onCategoryAdd }) => {
    const mediaBaseUrl = tenantUtils.getMediaBaseUrl();
    const [form, setForm] = useState({
        name: product?.name || '',
        sku: product?.sku || '',
        description: product?.description || '',
        price: product?.price || '',
        compare_price: product?.compare_price || '',
        category: product?.category || '',
        stock: product?.stock || 0,
        status: product?.status || 'draft',
        images: product?.images || []
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // New Category State
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAddCategory = async () => {
        try {
            const response = await apiClient.post('/products/categories', { name: newCategoryName });
            if (response.data.success) {
                toast.success('Category created');
                if (onCategoryAdd) onCategoryAdd();
                setNewCategoryName('');
                setShowAddCategory(false);
                // Auto-select the new category
                setForm(prev => ({ ...prev, category: response.data.data.slug }));
            }
        } catch (error) {
            console.error('Create category failed:', error);
            toast.error(error.response?.data?.error || 'Failed to create category');
        }
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check file count limit (10 max)
        if (files.length > 10) {
            toast.error('Maximum 10 images allowed at once');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }

            const response = await apiClient.post('/upload/product-images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const newImages = [...(form.images || []), ...response.data.urls];
                setForm({ ...form, images: newImages });
                toast.success('Images uploaded successfully');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to upload images';
            toast.error(errorMsg);
        } finally {
            setUploading(false);
            // Reset file input
            e.target.value = '';
        }
    };

    const removeImage = (index) => {
        const newImages = form.images.filter((_, i) => i !== index);
        setForm({ ...form, images: newImages });
    };

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
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to save product';
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={product ? 'Edit Product' : 'Add Product'}
            footer={
                <>
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" form="product-form" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : (product ? 'Update' : 'Create')}
                    </button>
                </>
            }
        >
            <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label">Product Name *</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="input"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">SKU</label>
                        <input
                            type="text"
                            value={form.sku}
                            onChange={e => setForm({ ...form, sku: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <div className="flex gap-2">
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="select flex-1">
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowAddCategory(!showAddCategory)}
                                className="btn-secondary px-3"
                                title="Add New Category"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                        {showAddCategory && (
                            <div className="mt-2 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="New category name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="input flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="btn-primary px-3"
                                    disabled={!newCategoryName.trim()}
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Price *</label>
                        <input
                            type="number"
                            value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })}
                            className="input"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Compare Price</label>
                        <input
                            type="number"
                            value={form.compare_price}
                            onChange={e => setForm({ ...form, compare_price: e.target.value })}
                            className="input"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Stock</label>
                        <input
                            type="number"
                            value={form.stock}
                            onChange={e => setForm({ ...form, stock: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="select">
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="label">Description</label>
                    <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows="3"
                        className="input"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="label">Product Images</label>
                    <div className="space-y-3">
                        {/* Image Preview Grid */}
                        {form.images && form.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                                {form.images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img
                                            src={`${mediaBaseUrl}${img}`}
                                            alt={`Product ${idx + 1}`}
                                            className="w-full h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Button */}
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

/**
 * Bulk Import Modal
 */
const BulkImportModal = ({ onClose, onImport, onDownloadTemplate, importing, results }) => {
    const [file, setFile] = useState(null);
    const [duplicateAction, setDuplicateAction] = useState('update');
    const fileInputRef = React.useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                toast.error('Please select a CSV file');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleImport = () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }
        onImport(file, duplicateAction);
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Bulk Import Products"
            footer={
                <>
                    <button type="button" onClick={onClose} className="btn-secondary">
                        {results ? 'Close' : 'Cancel'}
                    </button>
                    {!results && (
                        <button
                            onClick={handleImport}
                            className="btn-primary"
                            disabled={importing || !file}
                        >
                            {importing ? 'Importing...' : 'Import Products'}
                        </button>
                    )}
                </>
            }
        >
            <div className="space-y-6">
                {/* Download Template */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-white">Download Template</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Download the CSV template to see the required format
                            </p>
                        </div>
                        <button onClick={onDownloadTemplate} className="btn-secondary btn-sm">
                            Download
                        </button>
                    </div>
                </div>

                {/* File Upload */}
                {!results && (
                    <>
                        <div>
                            <label className="label">Select CSV File</label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                    ${file
                                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {file ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium text-slate-900 dark:text-white">{file.name}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-10 h-10 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Click to select or drag and drop a CSV file
                                        </p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </div>

                        {/* Duplicate Handling */}
                        <div>
                            <label className="label">When SKU already exists</label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                                    ${duplicateAction === 'update'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                        : 'border-slate-200 dark:border-slate-700'}`}>
                                    <input
                                        type="radio"
                                        name="duplicateAction"
                                        value="update"
                                        checked={duplicateAction === 'update'}
                                        onChange={(e) => setDuplicateAction(e.target.value)}
                                        className="accent-indigo-600"
                                    />
                                    <div>
                                        <span className="font-medium text-slate-900 dark:text-white">Update</span>
                                        <p className="text-xs text-slate-500">Replace existing product data</p>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                                    ${duplicateAction === 'skip'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                        : 'border-slate-200 dark:border-slate-700'}`}>
                                    <input
                                        type="radio"
                                        name="duplicateAction"
                                        value="skip"
                                        checked={duplicateAction === 'skip'}
                                        onChange={(e) => setDuplicateAction(e.target.value)}
                                        className="accent-indigo-600"
                                    />
                                    <div>
                                        <span className="font-medium text-slate-900 dark:text-white">Skip</span>
                                        <p className="text-xs text-slate-500">Keep existing product</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </>
                )}

                {/* Import Results */}
                {results && (
                    <div className="space-y-4">
                        <h4 className="font-medium text-slate-900 dark:text-white">Import Results</h4>
                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                                <p className="text-2xl font-bold text-emerald-600">{results.success}</p>
                                <p className="text-xs text-slate-500">Created</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                <p className="text-2xl font-bold text-blue-600">{results.updated}</p>
                                <p className="text-xs text-slate-500">Updated</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                                <p className="text-2xl font-bold text-amber-600">{results.skipped}</p>
                                <p className="text-xs text-slate-500">Skipped</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                                <p className="text-xs text-slate-500">Failed</p>
                            </div>
                        </div>

                        {results.errors && results.errors.length > 0 && (
                            <div className="mt-4">
                                <h5 className="font-medium text-red-600 mb-2">Errors</h5>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 max-h-40 overflow-auto">
                                    {results.errors.map((err, idx) => (
                                        <p key={idx} className="text-sm text-red-600">
                                            Row {err.row}: {err.error}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Importing Progress */}
                {importing && (
                    <div className="flex items-center justify-center gap-3 py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <span className="text-slate-600 dark:text-slate-400">Importing products...</span>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ProductsList;
