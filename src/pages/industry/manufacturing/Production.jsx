import { useEffect, useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

const initialFormData = {
    product_id: '',
    quantity: '',
    priority: 'normal',
    planned_start: '',
    planned_end: '',
    produced_quantity: '',
    rejected_quantity: '',
    notes: ''
};

export default function Production() {
    const [production, setProduction] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        fetchProduction();
        fetchProducts();
    }, []);

    const fetchProduction = async () => {
        try {
            const response = await apiClient.get('/production');
            setProduction(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch production:', error);
            toast.error('Failed to load production orders');
            setProduction([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/production/products', { params: { limit: 200 } });
            setProducts(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load manufactured products');
        }
    };

    const resetForm = () => {
        setEditingOrder(null);
        setFormData(initialFormData);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                quantity: Number(formData.quantity || 0),
                produced_quantity: formData.produced_quantity === '' ? undefined : Number(formData.produced_quantity || 0),
                rejected_quantity: formData.rejected_quantity === '' ? undefined : Number(formData.rejected_quantity || 0)
            };

            if (editingOrder) {
                await apiClient.put(`/production/${editingOrder.id}`, payload);
                toast.success('Production order updated');
            } else {
                await apiClient.post('/production', payload);
                toast.success('Production order created');
            }

            resetForm();
            fetchProduction();
        } catch (error) {
            console.error('Failed to create order:', error);
            toast.error(error.response?.data?.error || 'Failed to save production order');
        }
    };

    const handleExport = () => {
        const csv = [
            ['Order #', 'Product', 'Quantity', 'Priority', 'Status', 'Planned Start', 'Planned End'],
            ...production.map(o => [o.order_number || o.id, o.product || o.product_name || '', o.quantity, o.priority || '', o.status, o.planned_start || o.dueDate || '', o.planned_end || ''])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `production_orders_${new Date().toISOString().split('T')[0]}.csv`;
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
                const [, productValue, quantity, priority, plannedStart, plannedEnd, notes] = row.split(',');
                const product = products.find((entry) => {
                    const needle = productValue?.trim();
                    if (!needle) return false;
                    return String(entry.id) === needle || entry.name === needle || entry.sku === needle;
                });

                if (product && quantity) {
                    try {
                        await apiClient.post('/production', {
                            product_id: product.id,
                            quantity: parseInt(quantity),
                            priority: priority?.trim() || 'normal',
                            planned_start: plannedStart?.trim() || '',
                            planned_end: plannedEnd?.trim() || '',
                            notes: notes?.trim() || ''
                        });
                        imported++;
                    } catch (err) {
                        console.error('Import row failed:', err);
                    }
                }
            }

            toast.success(`Imported ${imported} production orders`);
            fetchProduction();
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const openCreateModal = () => {
        setEditingOrder(null);
        setFormData(initialFormData);
        setShowModal(true);
    };

    const openEditModal = (order) => {
        setEditingOrder(order);
        setFormData({
            product_id: String(order.product_id || ''),
            quantity: order.quantity ?? '',
            priority: order.priority || 'normal',
            planned_start: order.planned_start ? String(order.planned_start).split('T')[0] : '',
            planned_end: order.planned_end ? String(order.planned_end).split('T')[0] : '',
            produced_quantity: order.produced_quantity ?? '',
            rejected_quantity: order.rejected_quantity ?? '',
            notes: order.notes || ''
        });
        setShowModal(true);
    };

    const updateStatus = async (order, nextStatus) => {
        try {
            const payload = { status: nextStatus };

            if (nextStatus === 'completed') {
                const producedQuantity = window.prompt('Produced quantity', order.produced_quantity ?? order.quantity ?? 0);
                if (producedQuantity === null) return;
                const rejectedQuantity = window.prompt('Rejected quantity', order.rejected_quantity ?? 0);
                if (rejectedQuantity === null) return;

                payload.produced_quantity = Number(producedQuantity || 0);
                payload.rejected_quantity = Number(rejectedQuantity || 0);
            }

            await apiClient.patch(`/production/${order.id}/status`, payload);
            toast.success(`Order moved to ${nextStatus.replace('_', ' ')}`);
            fetchProduction();
        } catch (error) {
            console.error('Failed to update production status:', error);
            toast.error(error.response?.data?.error || 'Failed to update production status');
        }
    };

    const columns = [
        { header: 'Order #', accessor: 'order_number', render: (row) => row.order_number || `PO-${row.id}`, className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Product', accessor: 'product', render: (row) => row.product || row.product_name || '-', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Quantity', accessor: 'quantity' },
        {
            header: 'Schedule',
            accessor: 'planned_start',
            render: (row) => (
                <div className="text-sm">
                    <div>{row.planned_start ? new Date(row.planned_start).toLocaleDateString('en-IN') : 'Not set'}</div>
                    <div className="text-xs text-slate-500">{row.planned_end ? `to ${new Date(row.planned_end).toLocaleDateString('en-IN')}` : 'No end date'}</div>
                </div>
            )
        },
        {
            header: 'Output',
            accessor: 'produced_quantity',
            render: (row) => (
                <div className="text-sm">
                    <div>Produced: {Number(row.produced_quantity || 0).toLocaleString('en-IN')}</div>
                    <div className="text-xs text-slate-500">Rejected: {Number(row.rejected_quantity || 0).toLocaleString('en-IN')}</div>
                </div>
            )
        },
        { header: 'Priority', accessor: 'priority', render: (row) => <span className="capitalize">{row.priority || 'normal'}</span> },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const variant = row.status === 'completed'
                    ? 'success'
                    : row.status === 'cancelled'
                        ? 'error'
                        : row.status === 'in_progress'
                            ? 'info'
                            : 'warning';
                return <StatusBadge status={row.status || 'planned'} variant={variant} />;
            }
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => openEditModal(row)} className="px-2 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                        Edit
                    </button>
                    {row.status === 'planned' && (
                        <button onClick={() => updateStatus(row, 'in_progress')} className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200">
                            Start
                        </button>
                    )}
                    {row.status === 'in_progress' && (
                        <>
                            <button onClick={() => updateStatus(row, 'on_hold')} className="px-2 py-1 text-xs rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200">
                                Hold
                            </button>
                            <button onClick={() => updateStatus(row, 'completed')} className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 hover:bg-green-200">
                                Complete
                            </button>
                        </>
                    )}
                    {row.status === 'on_hold' && (
                        <button onClick={() => updateStatus(row, 'in_progress')} className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200">
                            Resume
                        </button>
                    )}
                    {!['completed', 'cancelled'].includes(row.status) && (
                        <button onClick={() => updateStatus(row, 'cancelled')} className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200">
                            Cancel
                        </button>
                    )}
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Production"
                subtitle="Manage production orders"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Manufacturing' }, { label: 'Production' }]}
                actions={
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
                        <button onClick={openCreateModal} className="btn-primary">New Order</button>
                    </div>
                }
            />

            {production.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">No production orders found</p>
                        <button onClick={openCreateModal} className="btn-primary">Create First Order</button>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={production} />
                </ProCard>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingOrder ? 'Edit Production Order' : 'New Production Order'}
                            </h2>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product</label>
                                <select
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>
                                    ))}
                                </select>
                            </div>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.planned_start}
                                        onChange={(e) => setFormData({ ...formData, planned_start: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.planned_end}
                                        onChange={(e) => setFormData({ ...formData, planned_end: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Produced Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.produced_quantity}
                                        onChange={(e) => setFormData({ ...formData, produced_quantity: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rejected Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.rejected_quantity}
                                        onChange={(e) => setFormData({ ...formData, rejected_quantity: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
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
                                <button type="button" onClick={resetForm} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingOrder ? 'Save Changes' : 'Create Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
