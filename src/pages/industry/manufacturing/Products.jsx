/**
 * Manufactured Products Page - Manufacturing Module
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../components/common/ConfirmModal';

const UNITS = ['pcs', 'kg', 'ltr', 'm', 'units', 'boxes', 'sets'];

const initialFormData = {
    name: '',
    sku: '',
    description: '',
    category: '',
    unit: 'pcs',
    selling_price: '',
    cost_price: '',
    stock_quantity: '',
    min_stock_level: '',
};

// BOM spec row shape
const emptySpecRow = () => ({ material_name: '', quantity: '', unit: 'kg' });

function formatCurrency(value) {
    const n = parseFloat(value);
    if (value === null || value === undefined || value === '' || isNaN(n)) return '—';
    return `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Convert a BOM value (JSON string or array) to an array of spec rows for the UI
function parseBomToRows(bom) {
    if (!bom) return [];
    try {
        const arr = typeof bom === 'string' ? JSON.parse(bom) : bom;
        if (!Array.isArray(arr)) return [];
        return arr.map(r => ({
            material_name: r.material_name || r.name || '',
            quantity: r.quantity !== undefined ? String(r.quantity) : '',
            unit: r.unit || 'kg',
        }));
    } catch {
        return [];
    }
}

// Serialise spec rows back to the JSON format the backend expects
function serializeRows(rows) {
    const filled = rows.filter(r => r.material_name.trim());
    if (!filled.length) return null;
    return JSON.stringify(
        filled.map(r => ({
            material_name: r.material_name.trim(),
            quantity: parseFloat(r.quantity) || 0,
            unit: r.unit,
        }))
    );
}

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);
    const [specRows, setSpecRows] = useState([emptySpecRow()]);

    // Confirm-delete modal
    const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const summary = useMemo(() => {
        const lowStockCount = products.filter(p => Number(p.stock_quantity || 0) <= Number(p.min_stock_level || 0)).length;
        const inventoryValue = products.reduce((sum, p) => sum + ((Number(p.stock_quantity) || 0) * (Number(p.cost_price) || 0)), 0);
        return { totalProducts: products.length, lowStockCount, inventoryValue };
    }, [products]);

    const resetForm = () => {
        setEditingId(null);
        setFormData(initialFormData);
        setSpecRows([emptySpecRow()]);
        setShowForm(false);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/production/products', { params: { search, limit: 200 } });
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            bom: serializeRows(specRows),
        };

        try {
            if (editingId) {
                await apiClient.put(`/production/products/${editingId}`, payload);
                toast.success('Product updated');
            } else {
                await apiClient.post('/production/products', payload);
                toast.success('Product created');
            }
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
            toast.error(error.response?.data?.error || 'Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name || '',
            sku: product.sku || '',
            description: product.description || '',
            category: product.category || '',
            unit: product.unit || 'pcs',
            selling_price: product.selling_price ?? '',
            cost_price: product.cost_price ?? '',
            stock_quantity: product.stock_quantity ?? '',
            min_stock_level: product.min_stock_level ?? '',
        });
        const rows = parseBomToRows(product.bom);
        setSpecRows(rows.length ? rows : [emptySpecRow()]);
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async () => {
        try {
            await apiClient.delete(`/production/products/${confirmModal.id}`);
            toast.success('Product deleted');
            setConfirmModal({ open: false, id: null });
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            toast.error('Failed to delete product');
        }
    };

    // ── Spec row helpers ────────────────────────────────────────────────
    const updateSpecRow = (index, field, value) => {
        setSpecRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
    };
    const addSpecRow = () => setSpecRows(prev => [...prev, emptySpecRow()]);
    const removeSpecRow = (index) => setSpecRows(prev => prev.length === 1 ? [emptySpecRow()] : prev.filter((_, i) => i !== index));

    // ── Export / Import ─────────────────────────────────────────────────
    const handleExport = () => {
        const csv = [
            ['Name', 'SKU', 'Description', 'Category', 'Unit', 'Selling Price', 'Cost Price', 'Stock Quantity', 'Min Stock Level'],
            ...products.map(p => [p.name, p.sku || '', p.description || '', p.category || '', p.unit || '', p.selling_price ?? '', p.cost_price ?? '', p.stock_quantity ?? '', p.min_stock_level ?? ''])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manufactured_products_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = String(event.target?.result || '');
            const rows = text.split('\n').slice(1);
            let imported = 0;
            for (const row of rows) {
                const [name, sku, description, category, unit, selling_price, cost_price, stock_quantity, min_stock_level] = row.split(',');
                if (name?.trim()) {
                    try {
                        await apiClient.post('/production/products', { name: name.trim(), sku: sku?.trim() || '', description: description?.trim() || '', category: category?.trim() || '', unit: unit?.trim() || 'pcs', selling_price: selling_price?.trim() || null, cost_price: cost_price?.trim() || null, stock_quantity: stock_quantity?.trim() || 0, min_stock_level: min_stock_level?.trim() || 0 });
                        imported++;
                    } catch (err) { console.error('Import row failed:', err); }
                }
            }
            toast.success(`Imported ${imported} products`);
            fetchProducts();
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const field = (label, key, type = 'text', required = false, placeholder = '') => (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                type={type}
                step={type === 'number' ? '0.01' : undefined}
                min={type === 'number' ? '0' : undefined}
                value={formData[key]}
                onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span>Factory</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Products</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufactured Products</h1>
                    <p className="text-slate-500 text-sm">Maintain pricing, stock and BOM specs for production-ready products.</p>
                </div>
                <div className="flex gap-2">
                    <label className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Import
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                    </label>
                    <button onClick={handleExport} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="btn-primary flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Product
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-500">Products</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalProducts}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-500">Low Stock</p>
                    <p className="text-2xl font-bold text-amber-600">{summary.lowStockCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-500">Inventory Value</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.inventoryValue)}</p>
                </div>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by name or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full md:w-80 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No products</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Add products to start creating production orders.</p>
                        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Add First Product
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sell Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cost Price</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stock</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">BOM Specs</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {products.map((product) => {
                                    const lowStock = Number(product.stock_quantity || 0) <= Number(product.min_stock_level || 0);
                                    const bomRows = parseBomToRows(product.bom);
                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                                                <div className="text-xs text-slate-500">{product.sku || 'Auto SKU'} • {product.unit || 'pcs'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{product.category || '—'}</td>
                                            <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{formatCurrency(product.selling_price)}</td>
                                            <td className="px-4 py-3 text-slate-500">{formatCurrency(product.cost_price)}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900 dark:text-white">{Number(product.stock_quantity || 0).toLocaleString('en-IN')}</div>
                                                <div className={`text-xs ${lowStock ? 'text-amber-600' : 'text-slate-500'}`}>
                                                    Min {Number(product.min_stock_level || 0).toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-sm">
                                                {bomRows.length > 0
                                                    ? <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs">{bomRows.length} material{bomRows.length > 1 ? 's' : ''}</span>
                                                    : <span className="text-slate-400">Not set</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(product)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={() => setConfirmModal({ open: true, id: product.id })} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Add / Edit Product Modal ─────────────────────────────────────── */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4 pt-10">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl p-6 mb-10">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingId ? 'Edit Product' : 'Add Product'}
                            </h2>
                            <button onClick={resetForm} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* ── Basic Info ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {field('Product Name', 'name', 'text', true, 'e.g., Widget Pro 3000')}
                                {field('SKU', 'sku', 'text', false, 'Auto-generated if blank')}
                                {field('Category', 'category', 'text', false, 'e.g., Electronics')}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                                    <select
                                        value={formData.unit}
                                        onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {UNITS.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* ── Pricing ── */}
                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pricing</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {field('Selling Price', 'selling_price', 'number', true, '0.00')}
                                    {field('Cost Price', 'cost_price', 'number', true, '0.00')}
                                </div>
                            </div>

                            {/* ── Stock ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {field('Opening Stock Quantity', 'stock_quantity', 'number', false, '0')}
                                {field('Min Stock Level', 'min_stock_level', 'number', false, '0')}
                            </div>

                            {/* ── Description ── */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                    placeholder="Optional product description..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            {/* ── BOM / Specs ── */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Bill of Materials (Specs)</p>
                                        <p className="text-xs text-slate-400">Materials required to produce one unit of this product.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSpecRow}
                                        className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Add Row
                                    </button>
                                </div>

                                <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Material / Component</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase w-28">Qty</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase w-28">Unit</th>
                                                <th className="px-3 py-2 w-10" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {specRows.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={row.material_name}
                                                            onChange={e => updateSpecRow(idx, 'material_name', e.target.value)}
                                                            placeholder="e.g., Steel Sheet"
                                                            className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={row.quantity}
                                                            onChange={e => updateSpecRow(idx, 'quantity', e.target.value)}
                                                            placeholder="0"
                                                            className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.unit}
                                                            onChange={e => updateSpecRow(idx, 'unit', e.target.value)}
                                                            className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                                        >
                                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSpecRow(idx)}
                                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Remove row"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ── Actions ── */}
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                    {editingId ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Confirm Delete ───────────────────────────────────────────────── */}
            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Product"
                message="Delete this product? This cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
