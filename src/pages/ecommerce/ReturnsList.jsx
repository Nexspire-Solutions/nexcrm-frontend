import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

export default function ReturnsList() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [returns] = useState([
        { id: 1, orderId: '#ORD-7829', customer: 'John Doe', reason: 'Defective Item', status: 'Pending', date: '2023-10-25', amount: 129.00 },
        { id: 2, orderId: '#ORD-7811', customer: 'Jane Smith', reason: 'Wrong Size', status: 'Approved', date: '2023-10-24', amount: 59.50 },
        { id: 3, orderId: '#ORD-7790', customer: 'Mike Johnson', reason: 'Changed Mind', status: 'Rejected', date: '2023-10-22', amount: 45.00 },
        { id: 4, orderId: '#ORD-7780', customer: 'Sarah Wilson', reason: 'Wrong Item Sent', status: 'Completed', date: '2023-10-20', amount: 89.99 },
    ]);

    const stats = {
        total: 4,
        pending: 1,
        approved: 1,
        total_amount: 323.49
    };

    const handleCreateReturn = () => {
        setIsCreateOpen(true);
    };

    const handleProcess = (item) => {
        toast.info(`Process functionality coming soon for ${item.orderId}`);
    };

    const handleSaveReturn = () => {
        toast.success('Return created successfully');
        setIsCreateOpen(false);
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            'Approved': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6  rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Returns Management</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Process and track customer returns</p>
                </div>
                <button
                    onClick={handleCreateReturn}
                    className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Return
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Returns</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.approved}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Approved</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{stats.total_amount.toFixed(2)}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Amount</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Returns Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {returns.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <code className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400">
                                            {item.orderId}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.customer}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.reason}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{item.date}</td>
                                    <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                                        ₹{item.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleProcess(item)}
                                            className="btn-ghost btn-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
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

            {/* Create Return Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create New Return"
                footer={
                    <>
                        <button onClick={() => setIsCreateOpen(false)} className="btn-secondary">Cancel</button>
                        <button onClick={handleSaveReturn} className="btn-primary">Create Return</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Order ID</label>
                        <input type="text" className="input" placeholder="#ORD-" />
                    </div>
                    <div>
                        <label className="label">Customer Name</label>
                        <input type="text" className="input" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="label">Return Reason</label>
                        <select className="select">
                            <option>Defective Item</option>
                            <option>Wrong Size</option>
                            <option>Changed Mind</option>
                            <option>Wrong Item Sent</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Refund Amount (₹)</label>
                        <input type="number" className="input" placeholder="0.00" step="0.01" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
