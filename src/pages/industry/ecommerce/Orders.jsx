import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';
import ProCard from '../../../components/common/ProCard';

const mockOrders = [
    { id: 'ORD-001', customer: 'John Smith', date: '2024-12-23', amount: '$540.00', status: 'pending', items: 3 },
    { id: 'ORD-002', customer: 'Sarah Johnson', date: '2024-12-22', amount: '$120.50', status: 'shipped', items: 1 },
    { id: 'ORD-003', customer: 'Michael Brown', date: '2024-12-22', amount: '$1,250.00', status: 'delivered', items: 5 },
    { id: 'ORD-004', customer: 'Emily Davis', date: '2024-12-21', amount: '$75.00', status: 'processing', items: 2 },
    { id: 'ORD-005', customer: 'David Wilson', date: '2024-12-20', amount: '$320.00', status: 'cancelled', items: 1 },
];

const statusVariants = {
    pending: 'warning',
    processing: 'info',
    shipped: 'indigo',
    delivered: 'success',
    cancelled: 'error'
};

export default function OrderList() {
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
    const [orders] = useState(mockOrders);

    const columns = [
        { header: 'Order ID', accessor: 'id', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Customer', accessor: 'customer' },
        { header: 'Date', accessor: 'date', className: 'text-slate-500' },
        { header: 'Items', accessor: 'items', align: 'right' },
        { header: 'Amount', accessor: 'amount', align: 'right', className: 'font-medium' },
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

            {viewMode === 'list' ? (
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
                                            <span className="font-medium text-slate-900 dark:text-white text-sm">{order.id}</span>
                                            <span className="text-xs text-slate-500">{order.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{order.customer}</p>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                                            <span className="text-xs text-slate-500">{order.items} Items</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{order.amount}</span>
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
