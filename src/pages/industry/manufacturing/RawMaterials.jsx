/**
 * Raw Materials Page - Manufacturing Module
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

export default function RawMaterials() {
    const [materials, setMaterials] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [recentMovements, setRecentMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        quantity: 0,
        unit: 'pcs',
        min_stock_level: 0,
        cost_per_unit: '',
        supplier_id: '',
        location: ''
    });

    useEffect(() => {
        Promise.all([fetchMaterials(), fetchStats(), fetchSuppliers(), fetchMovements()]).finally(() => setLoading(false));
    }, [search]);

    const fetchMaterials = async () => {
        try {
            const response = await apiClient.get('/materials', { params: { search } });
            setMaterials(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/materials/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await apiClient.get('/suppliers');
            setSuppliers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        }
    };

    const fetchMovements = async () => {
        try {
            const response = await apiClient.get('/material-movements', { params: { limit: 8 } });
            setRecentMovements(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch material movements:', error);
        }
    };

    const refreshAll = async () => {
        await Promise.all([fetchMaterials(), fetchStats(), fetchMovements()]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await apiClient.put(`/materials/${editingId}`, formData);
                toast.success('Material updated');
            } else {
                await apiClient.post('/materials', formData);
                toast.success('Material created');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', sku: '', category: '', quantity: 0, unit: 'pcs', min_stock_level: 0, cost_per_unit: '', supplier_id: '', location: '' });
            refreshAll();
        } catch (error) {
            toast.error('Failed to save material');
        }
    };

    const handleEdit = (material) => {
        setFormData({
            name: material.name || '',
            sku: material.sku || '',
            category: material.category || '',
            quantity: material.quantity || 0,
            unit: material.unit || 'pcs',
            min_stock_level: material.min_stock_level || 0,
            cost_per_unit: material.cost_per_unit || '',
            supplier_id: material.supplier_id || '',
            location: material.location || ''
        });
        setEditingId(material.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this material?')) return;
        try {
            await apiClient.delete(`/materials/${id}`);
            toast.success('Material deleted');
            refreshAll();
        } catch (error) {
            toast.error('Failed to delete material');
        }
    };

    const handleAdjustStock = async (material) => {
        const amount = window.prompt(`Adjust stock for ${material.name}. Use positive to add or negative to subtract.`);
        if (amount === null || Number.isNaN(Number(amount))) return;

        try {
            await apiClient.put(`/materials/${material.id}/stock`, { adjustment: Number(amount) });
            toast.success('Stock adjusted');
            refreshAll();
        } catch (error) {
            toast.error('Failed to adjust stock');
        }
    };

    const handleExport = () => {
        const csv = [
            ['Name', 'SKU', 'Category', 'Supplier', 'Quantity', 'Unit', 'Min Stock', 'Unit Cost'],
            ...materials.map((m) => [m.name, m.sku || '', m.category || '', m.supplier_name || '', m.quantity, m.unit || '', m.min_stock_level || 0, m.cost_per_unit || 0])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raw_materials_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n').slice(1);
            let imported = 0;
            for (const row of rows) {
                const [name, sku, category, supplierName, quantity, unit, minStock, unitCost] = row.split(',');
                if (name?.trim()) {
                    try {
                        const supplier = suppliers.find((item) => item.name === supplierName?.trim());
                        await apiClient.post('/materials', {
                            name: name.trim(),
                            sku: sku?.trim() || '',
                            category: category?.trim() || '',
                            quantity: parseInt(quantity) || 0,
                            unit: unit?.trim() || 'pcs',
                            min_stock_level: parseInt(minStock) || 0,
                            cost_per_unit: unitCost ? Number(unitCost) : null,
                            supplier_id: supplier?.id || null
                        });
                        imported++;
                    } catch (err) {
                        console.error('Import row failed:', err);
                    }
                }
            }
            toast.success(`Imported ${imported} materials`);
            refreshAll();
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Raw Materials</h1>
                    <p className="text-slate-500 text-sm">Manage material stock, suppliers, and replenishment thresholds.</p>
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
                        onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', sku: '', category: '', quantity: 0, unit: 'pcs', min_stock_level: 0, cost_per_unit: '', supplier_id: '', location: '' }); }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Material
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Total Materials</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_materials || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Total Stock</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_stock || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Inventory Value</p>
                        <p className="text-2xl font-bold text-green-600">${Number(stats.total_value || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Low Stock</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.low_stock_items || 0}</p>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search materials..."
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
                ) : materials.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No materials found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Unit Cost</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {materials.map((material) => (
                                <tr key={material.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{material.name}</td>
                                    <td className="px-4 py-3 text-slate-500">{material.sku || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{material.category || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{material.supplier_name || '-'}</td>
                                    <td className="px-4 py-3 text-slate-900 dark:text-white">
                                        <div>{material.quantity} {material.unit}</div>
                                        <div className={`text-xs ${Number(material.quantity) <= Number(material.min_stock_level || 0) ? 'text-amber-600' : 'text-slate-400'}`}>
                                            Min {material.min_stock_level || 0}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">${Number(material.cost_per_unit || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAdjustStock(material)} className="p-1.5 text-slate-400 hover:text-emerald-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleEdit(material)} className="p-1.5 text-slate-400 hover:text-indigo-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(material.id)} className="p-1.5 text-slate-400 hover:text-red-600">
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

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Material Movements</h2>
                        <p className="text-sm text-slate-500">Latest stock purchases, adjustments, and consumption.</p>
                    </div>
                    <Link to="/material-movements" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Open Ledger</Link>
                </div>
                {recentMovements.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500">No material movements recorded yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Material</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {recentMovements.map((movement) => (
                                    <tr key={movement.id}>
                                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{movement.material_name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500 capitalize">{movement.movement_type?.replace('_', ' ')}</td>
                                        <td className={`px-4 py-3 text-sm font-medium ${Number(movement.quantity) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Number(movement.quantity) >= 0 ? '+' : ''}{movement.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{new Date(movement.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            {editingId ? 'Edit Material' : 'Add Material'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                                    <input
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
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
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Stock Level</label>
                                    <input
                                        type="number"
                                        value={formData.min_stock_level}
                                        onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Cost</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost_per_unit}
                                        onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
                                    <select
                                        value={formData.supplier_id}
                                        onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
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
