import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

const mockBookings = [
    { id: 'BKG-001', client: 'Amanda Lee', service: 'Hair Color + Cut', stylist: 'Sophie Turner', date: '2024-12-23', time: '10:00 AM', duration: '2h', status: 'confirmed' },
    { id: 'BKG-002', client: 'Rachel Green', service: 'Manicure', stylist: 'Emma Stone', date: '2024-12-23', time: '2:00 PM', duration: '1h', status: 'confirmed' },
    { id: 'BKG-003', client: 'Monica Bing', service: 'Facial Treatment', stylist: 'Lisa Ray', date: '2024-12-24', time: '11:00 AM', duration: '1.5h', status: 'pending' },
    { id: 'BKG-004', client: 'Phoebe Buffay', service: 'Hair Styling', stylist: 'Sophie Turner', date: '2024-12-22', time: '9:00 AM', duration: '1h', status: 'completed' },
];

export default function Bookings() {
    const [bookings] = useState(mockBookings);

    const columns = [
        { header: 'Booking ID', accessor: 'id', className: 'font-medium' },
        { header: 'Client', accessor: 'client', className: 'text-slate-900 dark:text-white' },
        { header: 'Service', accessor: 'service' },
        { header: 'Stylist', accessor: 'stylist' },
        {
            header: 'Date & Time',
            accessor: 'date',
            render: (row) => (
                <div>
                    <p className="font-medium text-slate-900 dark:text-white">{row.date}</p>
                    <p className="text-xs text-slate-500">{row.time} ({row.duration})</p>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={row.status === 'confirmed' ? 'success' : row.status === 'pending' ? 'warning' : 'neutral'}
                />
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Bookings"
                subtitle="Manage salon appointments"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Salon' }, { label: 'Bookings' }]}
                actions={<button className="btn-primary">New Booking</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <ProCard className="bg-indigo-600 text-white border-none">
                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Today's Bookings</p>
                    <p className="text-3xl font-bold mt-2">12</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">This Week</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">47</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Revenue (Today)</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">$1,245</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Utilization</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">85%</p>
                </ProCard>
            </div>

            <ProCard noPadding>
                <ProTable columns={columns} data={bookings} />
            </ProCard>
        </div>
    );
}
