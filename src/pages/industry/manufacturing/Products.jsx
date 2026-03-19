/**
 * Manufactured Products Page - Manufacturing Module
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

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
    bom: ''
};

function formatCurrency(value) {
    return `Rs. ${(Number(value) || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function formatBomValue(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;

    try {
        return JSON.stringify(value, null, 2);
    } catch (error) {
        return '';
    }
}

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const summary = useMemo(() => {
        const lowStockCount = products.filter(product => Number(product.stock_quantity || 0) <= Number(product.min_stock_level || 0)).length;
        const inventoryValue = products.reduce((sum, product) => sum + ((Number(product.stock_quantity) || 0) * (Number(product.cost_price) || 0)), 0);

        return {
            totalProducts: products.length,
            lowStockCount,
            inventoryValue
        };
    }, [products]);

    const resetForm = () => {
        setEditingId(null);
        setFormData(initialFormData);
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

        if (formData.bom) {
            try {
                JSON.parse(formData.bom);
            } catch (error) {
                toast.error('BOM must be valid JSON');
                return;
            }
        }

        try {
            if (editingId) {
                await apiClient.put(`/production/products/${editingId}`, formData);
                toast.success('Product updated');
            } else {
                await apiClient.post('/production/products', formData);
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
            bom: formatBomValue(product.bom)
        });
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await apiClient.delete(`/production/products/${id}`);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product:', error);
            toast.error('Failed to delete product');
        }
    };

    const handleExport = () => {
        const csv = [
            ['Name', 'SKU', 'Description', 'Category', 'Unit', 'Selling Price', 'Cost Price', 'Stock Quantity', 'Min Stock Level', 'BOM'],
            ...products.map(product => [
                product.name,
                product.sku || '',
                product.description || '',
                product.category || '',
                product.unit || '',
                product.selling_price ?? '',
                product.cost_price ?? '',
                product.stock_quantity ?? '',
                product.min_stock_level ?? '',
                JSON.stringify(product.bom || '')
            ])
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
                const [name, sku, description, category, unit, selling_price, cost_price, stock_quantity, min_stock_level, bom] = row.split(',');
                if (name?.trim()) {
                    try {
                        await apiClient.post('/production/products', {
                            name: name.trim(),
                            sku: sku?.trim() || '',
                            description: description?.trim() || '',
                            category: category?.trim() || '',
                            unit: unit?.trim() || 'pcs',
                            selling_price: selling_price?.trim() || '',
                            cost_price: cost_price?.trim() || '',
                            stock_quantity: stock_quantity?.trim() || '',
                            min_stock_level: min_stock_level?.trim() || '',
                            bom: bom?.trim() || ''
                        });
                        imported++;
                    } catch (err) {
                        console.error('Import row failed:', err);
                    }
                }
            }
            toast.success(`Imported ${imported} products`);
            fetchProducts();
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="space-y-6">
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
                    <p className="text-slate-500 text-sm">Maintain pricing, stock and BOM details for production-ready products.</p>
                </div>
                <div className="flex gap-2">
                    <label className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                    </label>
                    <button onClick={handleExport} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormData); }}
                        className="btn-primary flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </button>
                </div>
            </div>

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
            <div>
                <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-80 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
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
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No products</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Add products to start creating production orders.</p>
                        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
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
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">BOM</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {products.map((product) => {
                                    const lowStock = Number(product.stock_quantity || 0) <= Number(product.min_stock_level || 0);
                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                                                <div className="text-xs text-slate-500">{product.sku || 'Auto SKU'} • {product.unit || 'pcs'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{product.category || '-'}</td>
                                            <td className="px-4 py-3 text-slate-500">{formatCurrency(product.selling_price)}</td>
                                            <td className="px-4 py-3 text-slate-500">{formatCurrency(product.cost_price)}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900 dark:text-white">{Number(product.stock_quantity || 0).toLocaleString('en-IN')}</div>
                                                <div className={`text-xs ${lowStock ? 'text-amber-600' : 'text-slate-500'}`}>
                                                    Min {Number(product.min_stock_level || 0).toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-sm">{product.bom ? 'Configured' : 'Not set'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(product)} className="p-1.5 text-slate-400 hover:text-indigo-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-slate-400 hover:text-red-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
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

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            {editingId ? 'Edit Product' : 'Add Product'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g., Widget Pro 3000"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        placeholder="Auto-generated if blank"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g., Electronics"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    >
                                        <option value="pcs">Pieces</option>
                                        <option value="kg">Kilograms</option>
                                        <option value="ltr">Liters</option>
                                        <option value="m">Meters</option>
                                        <option value="units">Units</option>
                                        <option value="boxes">Boxes</option>
                                        <option value="sets">Sets</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selling Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.selling_price}
                                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost_price}
                                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Stock Level</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.min_stock_level}
                                        onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Optional product description..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">BOM JSON</label>
                                <textarea
                                    value={formData.bom}
                                    onChange={(e) => setFormData({ ...formData, bom: e.target.value })}
                                    rows={6}
                                    placeholder='[{"material_id":1,"quantity":2.5,"unit":"kg"}]'
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    {editingId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
