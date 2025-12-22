import { useState } from 'react';
import Modal from '../../components/common/Modal';

export default function InventoryList() {
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [inventory] = useState([
        { id: 1, sku: 'SKU001', product: 'Wireless Headphones', stock: 156, reserved: 12, status: 'In Stock', warehouse: 'Main Warehouse' },
        { id: 2, sku: 'SKU002', product: 'Smart Watch', stock: 43, reserved: 5, status: 'Low Stock', warehouse: 'West Wing' },
        { id: 3, sku: 'SKU003', product: 'Laptop Stand', stock: 0, reserved: 0, status: 'Out of Stock', warehouse: 'Main Warehouse' },
    ]);

    const handleAdjustStock = () => {
        setIsAdjustOpen(true);
    };

    const handleEdit = (item) => {
        alert(`Edit feature coming soon for ${item.product} (${item.sku})`);
    };

    const handleSaveAdjustment = () => {
        alert('Stock adjustment saved (simulated)');
        setIsAdjustOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Track stock levels across warehouses</p>
                </div>
                <button
                    onClick={handleAdjustStock}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Adjust Stock
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">SKU</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Product</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Stock</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Reserved</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Warehouse</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{item.sku}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{item.product}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.stock}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.reserved}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'In Stock'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : item.status === 'Low Stock'
                                                ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.warehouse}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
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

            <Modal
                isOpen={isAdjustOpen}
                onClose={() => setIsAdjustOpen(false)}
                title="Adjust Stock Level"
                footer={
                    <>
                        <button
                            onClick={() => setIsAdjustOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveAdjustment}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            Save Adjustment
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Product
                        </label>
                        <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                            {inventory.map(item => (
                                <option key={item.id} value={item.id}>{item.product} ({item.sku})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Adjustment Type
                        </label>
                        <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                            <option>Add Stock</option>
                            <option>Remove Stock</option>
                            <option>Set Absolute Quantity</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Reason
                        </label>
                        <textarea
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                            placeholder="Reason for adjustment..."
                        ></textarea>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
