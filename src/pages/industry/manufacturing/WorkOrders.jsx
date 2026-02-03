import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';

export default function WorkOrders() {
    const [workOrders, setWorkOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        task_title: '',
        work_type: 'production',
        quantity: '',
        priority: 'normal',
        planned_end: '',
        notes: ''
    });

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const fetchWorkOrders = async () => {
        try {
            const response = await apiClient.get('/work-orders');
            setWorkOrders(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch work orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/work-orders', formData);
            setShowModal(false);
            setFormData({ task_title: '', work_type: 'production', quantity: '', priority: 'normal', planned_end: '', notes: '' });
            fetchWorkOrders();
        } catch (error) {
            console.error('Failed to create work order:', error);
            alert('Failed to create work order');
        }
    };

    const handleExport = () => {
        const csv = [
            ['Order #', 'Task Title', 'Work Type', 'Quantity', 'Priority', 'Status', 'Due Date'],
            ...workOrders.map(o => [o.order_number || `WO-${o.id}`, o.task_title || o.notes || '', o.work_type || '', o.quantity, o.priority, o.status, o.planned_end || ''])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `work_orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n').slice(1); // Skip header
            let imported = 0;
            for (const row of rows) {
                const [, task_title, work_type, quantity, priority] = row.split(',');
                if (task_title?.trim() || quantity) {
                    try {
                        await apiClient.post('/work-orders', {
                            task_title: task_title?.trim() || 'Imported Task',
                            work_type: work_type?.trim() || 'production',
                            quantity: parseInt(quantity) || 1,
                            priority: priority?.trim() || 'normal'
                        });
                        imported++;
                    } catch (err) {
                        console.error('Import row failed:', err);
                    }
                }
            }
            alert(`Imported ${imported} work orders`);
            fetchWorkOrders();
        };
        reader.readAsText(file);
    };

    const getStatusBadge = (status) => {
        const styles = {
            planned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return styles[status] || styles.planned;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded mb-4 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <nav className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span>Factory</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Work Orders</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Work Orders</h1>
                </div>
                <div className="flex gap-2">
                    <label className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                    </label>
                    <button onClick={handleExport} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Work Order
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {workOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No work orders</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Create work orders to manage production.</p>
                        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Create First Work Order
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Order #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Qty</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {workOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{order.order_number || `WO-${order.id}`}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.task_title || order.notes || order.product_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 capitalize">{order.work_type?.replace('_', ' ') || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 capitalize">{order.priority}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                {order.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New Work Order</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.task_title || ''}
                                    onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
                                    placeholder="e.g., Assemble Widget A"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Type</label>
                                <select
                                    value={formData.work_type || 'production'}
                                    onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="production">Production</option>
                                    <option value="assembly">Assembly</option>
                                    <option value="quality_check">Quality Check</option>
                                    <option value="packaging">Packaging</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.planned_end}
                                    onChange={(e) => setFormData({ ...formData, planned_end: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Instructions</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Enter detailed work instructions..."
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    Create Work Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
