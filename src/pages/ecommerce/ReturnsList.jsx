import { useState } from 'react';
import Modal from '../../components/common/Modal';

export default function ReturnsList() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [returns] = useState([
        { id: 1, orderId: '#ORD-7829', customer: 'John Doe', reason: 'Defective Item', status: 'Pending', date: '2023-10-25', amount: '$129.00' },
        { id: 2, orderId: '#ORD-7811', customer: 'Jane Smith', reason: 'Wrong Size', status: 'Approved', date: '2023-10-24', amount: '$59.50' },
        { id: 3, orderId: '#ORD-7790', customer: 'Mike Johnson', reason: 'Changed Mind', status: 'Rejected', date: '2023-10-22', amount: '$45.00' },
    ]);

    const handleCreateReturn = () => {
        setIsCreateOpen(true);
    };

    const handleProcess = (item) => {
        alert(`Process feature coming soon for return ${item.orderId}`);
    };

    const handleSaveReturn = () => {
        alert('Return created (simulated)');
        setIsCreateOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Returns Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Process and track customer returns</p>
                </div>
                <button
                    onClick={handleCreateReturn}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Create Return
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Order ID</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Reason</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {returns.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium">{item.orderId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{item.customer}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.reason}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'Approved'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : item.status === 'Pending'
                                                ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{item.amount}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleProcess(item)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                                        >
                                            Process
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create New Return"
                footer={
                    <>
                        <button
                            onClick={() => setIsCreateOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveReturn}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            Create Return
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Order ID
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="#ORD-"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Customer Name
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Return Reason
                        </label>
                        <select className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500">
                            <option>Defective Item</option>
                            <option>Wrong Size</option>
                            <option>Changed Mind</option>
                            <option>Wrong Item Sent</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Refund Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-500">$</span>
                            <input
                                type="number"
                                className="w-full pl-7 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
