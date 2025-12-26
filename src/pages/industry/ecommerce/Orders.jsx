import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';
import ProCard from '../../../components/common/ProCard';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

const statusVariants = {
    pending: 'warning',
    processing: 'info',
    shipped: 'indigo',
    delivered: 'success',
    cancelled: 'error'
};

export default function OrderList() {
    const [viewMode, setViewMode] = useState('list');
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/orders');
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            // Empty state instead of mock data
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'Order ID', accessor: 'order_number', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Customer', accessor: 'shipping_name' },
        { header: 'Date', accessor: 'created_at', className: 'text-slate-500', render: (row) => new Date(row.created_at).toLocaleDateString() },
        { header: 'Items', accessor: 'items', align: 'right', render: (row) => row.items?.length || 0 },
        { header: 'Amount', accessor: 'total', align: 'right', className: 'font-medium', render: (row) => `₹${(row.total || 0).toLocaleString()}` },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => <StatusBadge status={row.status} variant={statusVariants[row.status]} />
        },
        {
            header: '',
            align: 'right',
            render: () => (
                <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">View</button>
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
                title="Orders"
                subtitle="Manage and track customer orders"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'E-Commerce' }, { label: 'Orders' }]}
                actions={
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                        >
                            Kanban
                        </button>
                    </div>
                }
            />

            {orders.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No orders found</p>
                    </div>
                </ProCard>
            ) : viewMode === 'list' ? (
                <ProCard noPadding>
                    <ProTable
                        columns={columns}
                        data={orders}
                        onRowClick={(row) => console.log('Clicked', row)}
                    />
                </ProCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {['pending', 'processing', 'shipped', 'delivered'].map(status => (
                        <div key={status} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 min-h-[500px]">
                            <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-4 flex justify-between items-center">
                                {status}
                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-0.5 px-2 rounded-full text-xs">
                                    {orders.filter(o => o.status === status).length}
                                </span>
                            </h3>
                            <div className="space-y-3">
                                {orders.filter(o => o.status === status).map(order => (
                                    <div key={order.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-300 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium text-slate-900 dark:text-white text-sm">{order.order_number}</span>
                                            <span className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{order.shipping_name}</p>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                                            <span className="text-xs text-slate-500">{order.items?.length || 0} Items</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">₹{(order.total || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
