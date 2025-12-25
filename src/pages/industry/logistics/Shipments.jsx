import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Shipments() {
    const [shipments, setShipments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {
            const response = await apiClient.get('/shipments');
            setShipments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch shipments:', error);
            setShipments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'Tracking #', accessor: 'trackingNumber', className: 'font-medium' },
        { header: 'Origin', accessor: 'origin' },
        { header: 'Destination', accessor: 'destination' },
        { header: 'Ship Date', accessor: 'shipDate', render: (row) => row.shipDate ? new Date(row.shipDate).toLocaleDateString() : '-' },
        { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status || 'pending'} variant={row.status === 'delivered' ? 'success' : row.status === 'in_transit' ? 'info' : 'warning'} /> },
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
                title="Shipments"
                subtitle="Track and manage shipments"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Logistics' }, { label: 'Shipments' }]}
                actions={<button className="btn-primary">New Shipment</button>}
            />

            {shipments.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No shipments found</p>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={shipments} />
                </ProCard>
            )}
        </div>
    );
}
