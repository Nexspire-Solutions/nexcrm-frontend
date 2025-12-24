import React from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

const topProducts = [
    { id: 1, name: 'Wireless Headphones', sales: 1240, revenue: '$62,000', stock: 45 },
    { id: 2, name: 'Smart Watch', sales: 850, revenue: '$127,500', stock: 12 },
    { id: 3, name: 'Bluetooth Speaker', sales: 600, revenue: '$30,000', stock: 8 },
    { id: 4, name: 'Laptop Stand', sales: 450, revenue: '$13,500', stock: 150 },
];

const lowStock = [
    { id: 3, name: 'Bluetooth Speaker', stock: 8, status: 'critical' },
    { id: 5, name: 'USB-C Cable', stock: 5, status: 'critical' },
    { id: 2, name: 'Smart Watch', stock: 12, status: 'warning' },
];

export default function Analytics() {
    const columns = [
        { header: 'Product Name', accessor: 'name', className: 'font-medium' },
        { header: 'Sales', accessor: 'sales', align: 'right' },
        { header: 'Revenue', accessor: 'revenue', align: 'right' },
        { header: 'Stock', accessor: 'stock', align: 'right' },
    ];

    const lowStockColumns = [
        { header: 'Product', accessor: 'name' },
        { header: 'Stock Level', accessor: 'stock', align: 'right', className: 'font-bold text-red-600' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => <StatusBadge status={row.status} variant={row.status === 'critical' ? 'error' : 'warning'} />
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Product Analytics"
                subtitle="Insights into your product performance and inventory"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'E-Commerce' }, { label: 'Analytics' }]}
                actions={<button className="btn-primary">Download Report</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <ProCard className="bg-indigo-600 text-white border-none">
                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
                    <p className="text-3xl font-bold mt-2">$233,000</p>
                    <p className="text-indigo-200 text-sm mt-1">+12% from last month</p>
                </ProCard>
                <ProCard>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Orders</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">1,540</p>
                    <p className="text-emerald-600 text-sm mt-1">+5% from last month</p>
                </ProCard>
                <ProCard>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Avg. Order Value</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">$151.30</p>
                    <p className="text-slate-400 text-sm mt-1">Stable</p>
                </ProCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ProCard title="Top Performing Products" action={<button className="text-sm text-indigo-600">View All</button>} noPadding>
                        <ProTable columns={columns} data={topProducts} />
                    </ProCard>
                </div>
                <div>
                    <ProCard title="Low Stock Alerts" className="border-red-100 dark:border-red-900/30" noPadding>
                        <ProTable columns={lowStockColumns} data={lowStock} emptyMessage="Inventory healthy" />
                    </ProCard>
                </div>
            </div>
        </div>
    );
}
