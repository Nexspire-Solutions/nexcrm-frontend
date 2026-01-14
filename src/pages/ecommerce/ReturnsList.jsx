import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { returnsAPI, ordersAPI } from '../../api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ReturnsList() {
    const [returns, setReturns] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, total_amount: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isProcessOpen, setIsProcessOpen] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
    const [formData, setFormData] = useState({
        order_id: '',
        reason: 'Defective Item',
        notes: '',
        refund_amount: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch returns
            const returnsRes = await returnsAPI.getAll().catch(() => ({ data: [] }));
            setReturns(returnsRes.data || []);

            // Fetch stats
            const statsRes = await returnsAPI.getStats().catch(() => ({ data: {} }));
            setStats(statsRes.data || { total: 0, pending: 0, approved: 0, total_amount: 0 });

            // Fetch orders for dropdown
            const ordersRes = await ordersAPI.getAll({ status: 'delivered' }).catch(() => ({ data: [] }));
            setOrders(ordersRes.data || []);
        } catch (error) {
            console.error('Failed to load returns:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateReturn = async () => {
        if (!formData.order_id) {
            toast.error('Please select an order');
            return;
        }
        if (!formData.refund_amount || parseFloat(formData.refund_amount) <= 0) {
            toast.error('Please enter a valid refund amount');
            return;
        }

        setSaving(true);
        try {
            await returnsAPI.create({
                order_id: formData.order_id,
                reason: formData.reason,
                notes: formData.notes,
                refund_amount: parseFloat(formData.refund_amount)
            });
            toast.success('Return request created');
            setIsCreateOpen(false);
            setFormData({ order_id: '', reason: 'Defective Item', notes: '', refund_amount: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create return');
        } finally {
            setSaving(false);
        }
    };

    const handleProcess = (item) => {
        setSelectedReturn(item);
        setIsProcessOpen(true);
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedReturn) return;

        setSaving(true);
        try {
            await returnsAPI.updateStatus(selectedReturn.id, status);
            toast.success(`Return ${status.toLowerCase()}`);
            setIsProcessOpen(false);
            setSelectedReturn(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await returnsAPI.delete(deleteId);
            toast.success('Return deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete return');
        }
        setDeleteId(null);
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { draggableId, source, destination } = result;
        if (source.droppableId === destination.droppableId) return;

        const returnId = parseInt(draggableId);
        const newStatus = destination.droppableId;

        // Optimistic update
        const updatedReturns = returns.map(item =>
            item.id === returnId ? { ...item, status: newStatus } : item
        );
        setReturns(updatedReturns);

        try {
            await returnsAPI.updateStatus(returnId, newStatus);
            toast.success(`Moved to ${newStatus}`);
            fetchData(); // Refresh to ensure sync
        } catch (error) {
            toast.error('Failed to update status');
            fetchData(); // Revert on error
        }
    };

    const getColumns = () => {
        const columns = {
            'pending': { title: 'Pending', items: [], color: 'bg-amber-100 text-amber-800' },
            'approved': { title: 'Approved', items: [], color: 'bg-blue-100 text-blue-800' },
            'completed': { title: 'Completed', items: [], color: 'bg-emerald-100 text-emerald-800' },
            'rejected': { title: 'Rejected', items: [], color: 'bg-red-100 text-red-800' }
        };
        returns.forEach(item => {
            if (columns[item.status]) {
                columns[item.status].items.push(item);
            }
        });
        return columns;
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            'approved': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status?.toLowerCase()] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <div className="card p-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded mb-2 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Returns Management</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Process and track customer returns</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                        >
                            Kanban
                        </button>
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Return
                    </button>
                </div>
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
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{parseFloat(stats.total_amount || 0).toFixed(2)}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Amount</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Content */}
            {viewMode === 'list' ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                    {returns.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <p className="text-slate-500 dark:text-slate-400">No returns found</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create a return request when needed</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">Return ID</th>
                                        <th className="px-6 py-4">Order</th>
                                        <th className="px-6 py-4">Reason</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Refund</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {returns.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400">
                                                    #RTN-{String(item.id).padStart(4, '0')}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                    #ORD-{String(item.order_id).padStart(4, '0')}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{item.reason}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                                                ₹{parseFloat(item.refund_amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {item.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleProcess(item)}
                                                            className="btn-ghost btn-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                        >
                                                            Process
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setDeleteId(item.id); setDeleteConfirm(true); }}
                                                        className="btn-ghost btn-sm text-red-500 hover:text-red-600"
                                                    >
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
                        </div>
                    )}
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
                        {Object.entries(getColumns()).map(([columnId, column]) => (
                            <Droppable key={columnId} droppableId={columnId}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 min-h-[500px] border border-slate-200 dark:border-slate-700 flex flex-col"
                                    >
                                        <div className={`flex items-center justify-between mb-4 px-2 py-1 rounded ${column.color} bg-opacity-20`}>
                                            <h3 className="font-bold">{column.title}</h3>
                                            <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full opacity-70">
                                                {column.items.length}
                                            </span>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            {column.items.map((item, index) => (
                                                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                                            onClick={(e) => {
                                                                // Prevent modal opening when dragging
                                                                if (!e.defaultPrevented) handleProcess(item);
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">
                                                                    #{String(item.id).padStart(4, '0')}
                                                                </span>
                                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                                    ₹{item.refund_amount}
                                                                </span>
                                                            </div>
                                                            <p className="font-medium text-sm text-slate-900 dark:text-white mb-1 truncate">{item.reason}</p>
                                                            <p className="text-xs text-slate-500 mb-3 truncate">Order #{String(item.order_id).padStart(4, '0')}</p>
                                                            <div className="flex justify-between items-center text-xs text-slate-400">
                                                                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                                <button onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); setDeleteConfirm(true); }} className="hover:text-red-500">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            )}

            {/* Create Return Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create New Return"
                footer={
                    <>
                        <button onClick={() => setIsCreateOpen(false)} className="btn-secondary" disabled={saving}>Cancel</button>
                        <button onClick={handleCreateReturn} className="btn-primary" disabled={saving}>
                            {saving ? 'Creating...' : 'Create Return'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Order *</label>
                        <select
                            className="select"
                            value={formData.order_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, order_id: e.target.value }))}
                        >
                            <option value="">Select an order</option>
                            {orders.map(o => (
                                <option key={o.id} value={o.id}>
                                    #ORD-{String(o.id).padStart(4, '0')} - ₹{parseFloat(o.total || 0).toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">Return Reason</label>
                        <select
                            className="select"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        >
                            <option>Defective Item</option>
                            <option>Wrong Size</option>
                            <option>Changed Mind</option>
                            <option>Wrong Item Sent</option>
                            <option>Damaged in Transit</option>
                            <option>Not as Described</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Notes</label>
                        <textarea
                            className="input min-h-20"
                            placeholder="Additional details..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="label">Refund Amount (₹) *</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="0.00"
                            step="0.01"
                            value={formData.refund_amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, refund_amount: e.target.value }))}
                        />
                    </div>
                </div>
            </Modal>

            {/* Process Return Modal */}
            <Modal
                isOpen={isProcessOpen}
                onClose={() => setIsProcessOpen(false)}
                title="Process Return"
                size="md"
            >
                {selectedReturn && (
                    <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400">Return ID</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">#RTN-{String(selectedReturn.id).padStart(4, '0')}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400">Order ID</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">#ORD-{String(selectedReturn.order_id).padStart(4, '0')}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400">Reason</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{selectedReturn.reason}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400">Refund Amount</p>
                                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">₹{parseFloat(selectedReturn.refund_amount || 0).toFixed(2)}</p>
                                </div>
                            </div>
                            {selectedReturn.notes && (
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Notes</p>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm">{selectedReturn.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleUpdateStatus('approved')}
                                disabled={saving}
                                className="flex-1 btn-primary bg-emerald-600 hover:bg-emerald-700"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('rejected')}
                                disabled={saving}
                                className="flex-1 btn-secondary text-red-600 border-red-300 hover:bg-red-50"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Return"
                message="Are you sure you want to delete this return request? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}

