import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

const mockAppointments = [
    { id: 'APT-001', client: 'John Smith', service: 'Consultation', date: '2024-12-23', time: '10:00 AM', duration: '1h', status: 'confirmed' },
    { id: 'APT-002', client: 'Emma Wilson', service: 'Strategy Session', date: '2024-12-23', time: '2:00 PM', duration: '2h', status: 'confirmed' },
    { id: 'APT-003', client: 'Michael Brown', service: 'Follow-up', date: '2024-12-24', time: '11:00 AM', duration: '30m', status: 'pending' },
    { id: 'APT-004', client: 'Sarah Davis', service: 'Initial Assessment', date: '2024-12-24', time: '3:30 PM', duration: '1.5h', status: 'pending' },
    { id: 'APT-005', client: 'Robert Johnson', service: 'Consultation', date: '2024-12-22', time: '9:00 AM', duration: '1h', status: 'completed' },
];

export default function Appointments() {
    const [appointments] = useState(mockAppointments);

    const columns = [
        { header: 'ID', accessor: 'id', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Client', accessor: 'client' },
        { header: 'Service', accessor: 'service' },
        {
            header: 'Date & Time',
            accessor: 'date',
            render: (row) => (
                <div>
                    <p className="font-medium text-slate-900 dark:text-white">{row.date}</p>
                    <p className="text-xs text-slate-500">{row.time}</p>
                </div>
            )
        },
        { header: 'Duration', accessor: 'duration' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={row.status === 'confirmed' ? 'success' : row.status === 'pending' ? 'warning' : 'neutral'}
                />
            )
        },
        {
            header: 'Actions',
            align: 'right',
            render: () => (
                <div className="flex gap-2 justify-end">
                    <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Edit</button>
                    <button className="text-red-600 hover:text-red-900 font-medium text-sm">Cancel</button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Appointments"
                subtitle="Manage your service bookings"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Services' }, { label: 'Appointments' }]}
                actions={<button className="btn-primary">Book Appointment</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <ProCard className="bg-indigo-600 text-white border-none">
                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Today's Appointments</p>
                    <p className="text-3xl font-bold mt-2">8</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">This Week</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">24</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">5</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completed</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">142</p>
                </ProCard>
            </div>

            <ProCard noPadding>
                <ProTable columns={columns} data={appointments} />
            </ProCard>
        </div>
    );
}
