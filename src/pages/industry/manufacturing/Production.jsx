import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Production() {
    const [production, setProduction] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProduction();
    }, []);

    const fetchProduction = async () => {
        try {
            const response = await apiClient.get('/production');
            setProduction(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch production:', error);
            setProduction([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'Order ID', accessor: 'id', className: 'font-medium' },
        { header: 'Product', accessor: 'product', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Quantity', accessor: 'quantity' },
        { header: 'Due Date', accessor: 'dueDate', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-' },
        { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status || 'pending'} variant={row.status === 'completed' ? 'success' : row.status === 'in_progress' ? 'info' : 'warning'} /> },
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
                actions={<button className="btn-primary">New Order</button>}
            />

            {production.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No production orders found</p>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={production} />
                </ProCard>
            )}
        </div>
    );
}
