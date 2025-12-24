import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

const mockShipments = [
    { id: 'SHP-001', origin: 'New York, NY', destination: 'Los Angeles, CA', status: 'in-transit', eta: '2024-12-25', carrier: 'FedEx' },
    { id: 'SHP-002', origin: 'Chicago, IL', destination: 'Miami, FL', status: 'delivered', eta: '2024-12-20', carrier: 'UPS' },
    { id: 'SHP-003', origin: 'Seattle, WA', destination: 'Boston, MA', status: 'pending', eta: '2024-12-28', carrier: 'DHL' },
    { id: 'SHP-004', origin: 'Houston, TX', destination: 'Denver, CO', status: 'in-transit', eta: '2024-12-24', carrier: 'FedEx' },
];

export default function Shipments() {
    const [shipments] = useState(mockShipments);

    const columns = [
        { header: 'Shipment ID', accessor: 'id', className: 'font-medium text-slate-900 dark:text-white' },
        {
            header: 'Route',
            accessor: 'origin',
            render: (row) => (
                <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{row.origin}</p>
                    <p className="text-xs text-slate-500">→ {row.destination}</p>
                </div>
            )
        },
        { header: 'Carrier', accessor: 'carrier' },
        { header: 'ETA', accessor: 'eta', className: 'font-medium' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={row.status === 'delivered' ? 'success' : row.status === 'in-transit' ? 'info' : 'warning'}
                />
            )
        },
        {
            header: 'Actions',
            align: 'right',
            render: () => (
                <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Track</button>
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Shipments"
                subtitle="Track and manage logistics"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Logistics' }, { label: 'Shipments' }]}
                actions={<button className="btn-primary">New Shipment</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Shipments</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">234</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">In Transit</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">45</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">On Time Rate</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">94%</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Delayed</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">3</p>
                </ProCard>
            </div>

            <ProCard noPadding>
                <ProTable columns={columns} data={shipments} />
            </ProCard>
        </div>
    );
}
