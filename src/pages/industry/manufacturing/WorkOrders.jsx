import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../../api/axios';

const initialFormData = {
    production_order_id: '',
    operation_name: '',
    sequence: 1,
    workstation: '',
    planned_hours: '',
    actual_hours: '',
    status: 'pending',
    notes: ''
};

export default function WorkOrders() {
    const [workOrders, setWorkOrders] = useState([]);
    const [productionOrders, setProductionOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        Promise.all([fetchWorkOrders(), fetchProductionOrders(), fetchStats()]).finally(() => setIsLoading(false));
    }, [search, statusFilter]);

    const fetchWorkOrders = async () => {
        try {
            const response = await apiClient.get('/work-orders', {
                params: {
                    search: search || undefined,
                    status: statusFilter || undefined,
                    limit: 200
                }
            });
            setWorkOrders(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch work orders:', error);
        }
    };

    const fetchProductionOrders = async () => {
        try {
            const response = await apiClient.get('/production');
            setProductionOrders(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch production orders:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/work-orders/stats');
            setStats(response.data?.data || null);
        } catch (error) {
            console.error('Failed to fetch work order stats:', error);
        }
    };

    const refreshAll = async () => {
        await Promise.all([fetchWorkOrders(), fetchStats()]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                production_order_id: Number(formData.production_order_id),
                sequence: Number(formData.sequence || 1),
                planned_hours: formData.planned_hours ? Number(formData.planned_hours) : null,
                actual_hours: formData.actual_hours ? Number(formData.actual_hours) : null
            };

            if (editingOrder) {
                await apiClient.put(`/work-orders/${editingOrder.id}`, payload);
                toast.success('Work order updated');
            } else {
                await apiClient.post('/work-orders', payload);
                toast.success('Work order created');
            }

            setShowModal(false);
            setEditingOrder(null);
            setFormData(initialFormData);
            refreshAll();
        } catch (error) {
            console.error('Failed to create work order:', error);
            toast.error(error.response?.data?.error || 'Failed to create work order');
        }
    };

    const handleExport = () => {
        const csv = [
            ['WO #', 'Production Order', 'Product', 'Operation', 'Sequence', 'Workstation', 'Hours', 'Status'],
            ...workOrders.map((order) => [
                `WO-${order.id}`,
                order.order_number || '',
                order.product_name || '',
                order.operation_name || '',
                order.sequence || '',
                order.workstation || '',
                order.planned_hours || '',
                order.status || ''
            ])
        ].map((row) => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `work_orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const rows = String(event.target?.result || '').split('\n').slice(1);
            let imported = 0;

            for (const row of rows) {
                const [, orderNumber, , operationName, sequence, workstation, plannedHours] = row.split(',');
                const productionOrder = productionOrders.find((item) => item.order_number === orderNumber?.trim());
                if (!productionOrder || !operationName?.trim()) continue;

                try {
                    await apiClient.post('/work-orders', {
                        production_order_id: productionOrder.id,
                        operation_name: operationName.trim(),
                        sequence: Number(sequence || 1),
                        workstation: workstation?.trim() || '',
                        planned_hours: plannedHours ? Number(plannedHours) : null
                    });
                    imported += 1;
                } catch (err) {
                    console.error('Import row failed:', err);
                }
            }

            toast.success(`Imported ${imported} work orders`);
            refreshAll();
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
        return styles[status] || styles.pending;
    };

    const openCreateModal = () => {
        setEditingOrder(null);
        setFormData(initialFormData);
        setShowModal(true);
    };

    const openEditModal = (order) => {
        setEditingOrder(order);
        setFormData({
            production_order_id: String(order.production_order_id || ''),
            operation_name: order.operation_name || '',
            sequence: order.sequence || 1,
            workstation: order.workstation || '',
            planned_hours: order.planned_hours ?? '',
            actual_hours: order.actual_hours ?? '',
            status: order.status || 'pending',
            notes: order.notes || ''
        });
        setShowModal(true);
    };

    const updateStatus = async (order, status) => {
        try {
            await apiClient.put(`/work-orders/${order.id}`, { status });
            toast.success(`Work order moved to ${status.replace('_', ' ')}`);
            refreshAll();
        } catch (error) {
            console.error('Failed to update work order status:', error);
            toast.error(error.response?.data?.error || 'Failed to update work order');
        }
    };

    const deleteWorkOrder = async (id) => {
        if (!window.confirm('Delete this work order?')) return;

        try {
            await apiClient.delete(`/work-orders/${id}`);
            toast.success('Work order deleted');
            refreshAll();
        } catch (error) {
            console.error('Failed to delete work order:', error);
            toast.error(error.response?.data?.error || 'Failed to delete work order');
        }
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
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track sub-operations inside each production order.</p>
                </div>
                <div className="flex gap-2">
                    <label className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-2">
                        Import
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
                    </label>
                    <button onClick={handleExport} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Export
                    </button>
                    <button onClick={openCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        New Work Order
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by operation, workstation, product or order #"
                    className="w-full md:w-80 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full md:w-48 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-sm text-slate-500">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.pending || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-sm text-slate-500">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.in_progress || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-sm text-slate-500">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-sm text-slate-500">Planned Hours</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{Number(stats.planned_hours || 0).toLocaleString()}</p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {workOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No work orders</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Create work orders to break production into trackable operations.</p>
                        <button onClick={openCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Create First Work Order
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">WO #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Production Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Operation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Workstation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Hours</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {workOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{`WO-${order.id}`}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.order_number || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.product_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="font-medium">{order.operation_name}</div>
                                            <div className="text-xs text-slate-400">Sequence {order.sequence || 1}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{order.workstation || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.planned_hours || 0}h</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                {order.status?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button onClick={() => openEditModal(order)} className="px-2 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                                                    Edit
                                                </button>
                                                {order.status === 'pending' && (
                                                    <button onClick={() => updateStatus(order, 'in_progress')} className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                        Start
                                                    </button>
                                                )}
                                                {order.status === 'in_progress' && (
                                                    <button onClick={() => updateStatus(order, 'completed')} className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 hover:bg-green-200">
                                                        Complete
                                                    </button>
                                                )}
                                                <button onClick={() => deleteWorkOrder(order.id)} className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200">
                                                    Delete
                                                </button>
                                            </div>
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
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingOrder ? 'Edit Work Order' : 'New Work Order'}
                            </h2>
                            <button onClick={() => { setShowModal(false); setEditingOrder(null); setFormData(initialFormData); }} className="text-slate-400 hover:text-slate-600">x</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Production Order *</label>
                                <select
                                    required
                                    value={formData.production_order_id}
                                    onChange={(e) => setFormData({ ...formData, production_order_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select order</option>
                                    {productionOrders.map((order) => (
                                        <option key={order.id} value={order.id}>
                                            {order.order_number} - {order.product_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Operation Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.operation_name}
                                    onChange={(e) => setFormData({ ...formData, operation_name: e.target.value })}
                                    placeholder="e.g., Cutting, Welding, Assembly"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sequence</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.sequence}
                                        onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Workstation</label>
                                    <input
                                        type="text"
                                        value={formData.workstation}
                                        onChange={(e) => setFormData({ ...formData, workstation: e.target.value })}
                                        placeholder="e.g., Line A / CNC 04"
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Planned Hours</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={formData.planned_hours}
                                    onChange={(e) => setFormData({ ...formData, planned_hours: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            {editingOrder && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Actual Hours</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={formData.actual_hours}
                                            onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setShowModal(false); setEditingOrder(null); setFormData(initialFormData); }} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    {editingOrder ? 'Save Changes' : 'Create Work Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
