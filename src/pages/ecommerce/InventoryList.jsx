import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

export default function InventoryList() {
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [inventory] = useState([
        { id: 1, sku: 'SKU001', product: 'Wireless Headphones', stock: 156, reserved: 12, available: 144, status: 'In Stock', warehouse: 'Main Warehouse' },
        { id: 2, sku: 'SKU002', product: 'Smart Watch', stock: 43, reserved: 5, available: 38, status: 'Low Stock', warehouse: 'West Wing' },
        { id: 3, sku: 'SKU003', product: 'Laptop Stand', stock: 0, reserved: 0, available: 0, status: 'Out of Stock', warehouse: 'Main Warehouse' },
    ]);

    const stats = {
        total_items: 3,
        total_stock: 199,
        low_stock: 1,
        out_of_stock: 1
    };

    const handleAdjustStock = () => {
        setIsAdjustOpen(true);
    };

    const handleEdit = (item) => {
        toast.info(`Edit functionality coming soon for ${item.product}`);
    };

    const handleSaveAdjustment = () => {
        toast.success('Stock adjustment saved');
        setIsAdjustOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6  rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Track stock levels across warehouses</p>
                </div>
                <button
                    onClick={handleAdjustStock}
                    className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adjust Stock
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
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_items}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Items</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_stock}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Stock</p>
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
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.low_stock}</p>
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
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.out_of_stock}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Out of Stock</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Reserved</th>
                                <th className="px-6 py-4">Available</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Warehouse</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                            {item.sku}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.product}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.stock}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.reserved}</td>
                                    <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">{item.available}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'In Stock'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : item.status === 'Low Stock'
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.warehouse}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="btn-ghost btn-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjust Stock Modal */}
            <Modal
                isOpen={isAdjustOpen}
                onClose={() => setIsAdjustOpen(false)}
                title="Adjust Stock Level"
                footer={
                    <>
                        <button onClick={() => setIsAdjustOpen(false)} className="btn-secondary">Cancel</button>
                        <button onClick={handleSaveAdjustment} className="btn-primary">Save Adjustment</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Product</label>
                        <select className="select">
                            {inventory.map(item => (
                                <option key={item.id} value={item.id}>{item.product} ({item.sku})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Adjustment Type</label>
                        <select className="select">
                            <option>Add Stock</option>
                            <option>Remove Stock</option>
                            <option>Set Absolute Quantity</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Quantity</label>
                        <input type="number" className="input" placeholder="0" />
                    </div>
                    <div>
                        <label className="label">Reason</label>
                        <textarea className="input" rows="3" placeholder="Reason for adjustment..."></textarea>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
