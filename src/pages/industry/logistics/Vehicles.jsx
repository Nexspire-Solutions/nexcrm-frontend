import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await apiClient.get('/logistics/vehicles');
            setVehicles(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            setVehicles([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'Vehicle ID', accessor: 'vehicle_number', className: 'font-medium' },
        { header: 'Type', accessor: 'vehicle_type' },
        { header: 'Driver', accessor: 'driver_name', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Current Location', accessor: 'current_location' },
        { header: 'Last Update', accessor: 'updated_at', render: (row) => new Date(row.updated_at).toLocaleString() },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={
                        row.status === 'active' ? 'success' :
                            row.status === 'maintenance' ? 'warning' : 'neutral'
                    }
                />
            )
        },
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
                title="Fleet Management"
                subtitle="Track vehicles, drivers and real-time status"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Logistics' }, { label: 'Vehicles' }]}
                actions={<button className="btn-primary">Add Vehicle</button>}
            />

            {vehicles.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No vehicles in fleet</p>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={vehicles} />
                </ProCard>
            )}
        </div>
    );
}
