/**
 * Manufacturing Inventory Page - Manufacturing Module
 */
import { useState, useEffect } from 'react';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

export default function ManufacturingInventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [typeFilter, setTypeFilter] = useState('all');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchInventory();
        fetchStats();
    }, [typeFilter, lowStockOnly, search]);

    const fetchInventory = async () => {
        try {
            const response = await apiClient.get('/manufacturing/inventory', {
                params: { type: typeFilter, low_stock: lowStockOnly || undefined, search: search || undefined }
            });
            setInventory(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/manufacturing/inventory/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const adjustStock = async (type, id, adjustment) => {
        const amount = prompt('Enter adjustment amount (positive to add, negative to subtract):');
        if (!amount || isNaN(Number(amount))) return;

        try {
            await apiClient.put(`/manufacturing/inventory/${type}/${id}/adjust`, {
                adjustment: Number(amount)
            });
            toast.success('Stock adjusted');
            fetchInventory();
            fetchStats();
        } catch (error) {
            toast.error('Failed to adjust stock');
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing Inventory</h1>
                    <p className="text-slate-500 text-sm">Track raw materials and finished products</p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Raw Materials</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.materials?.count || 0}</p>
                        <p className="text-sm text-slate-500">${(stats.materials?.total_value || 0).toLocaleString()} value</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Finished Products</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.products?.count || 0}</p>
                        <p className="text-sm text-slate-500">${(stats.products?.total_value || 0).toLocaleString()} value</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Total Inventory Value</p>
                        <p className="text-2xl font-bold text-green-600">${(stats.combined?.total_value || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Low Stock Items</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.combined?.low_stock_items || 0}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex gap-2">
                    {['all', 'materials', 'products'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === type
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                        >
                            {type === 'all' ? 'All Items' : type === 'materials' ? 'Raw Materials' : 'Finished Products'}
                        </button>
                    ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={lowStockOnly}
                        onChange={(e) => setLowStockOnly(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Low stock only</span>
                </label>
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : inventory.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No inventory items found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">SKU</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Unit Cost</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {inventory.map((item) => (
                                <tr key={`${item.item_type}-${item.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${item.item_type === 'material'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            }`}>
                                            {item.item_type === 'material' ? 'Raw Material' : 'Product'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                    <td className="px-4 py-3 text-slate-500">{item.sku}</td>
                                    <td className="px-4 py-3 text-slate-500">{item.category || '-'}</td>
                                    <td className="px-4 py-3 text-slate-900 dark:text-white">{item.quantity} {item.unit}</td>
                                    <td className="px-4 py-3 text-slate-500">${item.unit_cost || 0}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${item.is_low_stock
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {item.is_low_stock ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => adjustStock(item.item_type, item.id)}
                                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200"
                                        >
                                            Adjust
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
