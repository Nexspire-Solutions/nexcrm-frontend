import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

const mockMembers = [
    { id: 'MBR-001', name: 'Alex Johnson', membership: 'Premium', joined: '2024-01-15', expires: '2025-01-15', status: 'active', checkIns: 45 },
    { id: 'MBR-002', name: 'Sarah Williams', membership: 'Basic', joined: '2024-06-10', expires: '2024-12-10', status: 'expiring', checkIns: 28 },
    { id: 'MBR-003', name: 'Mike Davis', membership: 'Premium', joined: '2023-11-20', expires: '2025-11-20', status: 'active', checkIns: 120 },
    { id: 'MBR-004', name: 'Emma Thompson', membership: 'Basic', joined: '2024-08-01', expires: '2025-02-01', status: 'active', checkIns: 15 },
];

export default function Members() {
    const [members] = useState(mockMembers);

    const columns = [
        {
            header: 'Member',
            accessor: 'name',
            render: (row) => (
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.id}</p>
                </div>
            )
        },
        { header: 'Membership', accessor: 'membership', className: 'font-medium text-indigo-600' },
        { header: 'Check-ins', accessor: 'checkIns', align: 'right' },
        { header: 'Expires', accessor: 'expires' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={row.status === 'active' ? 'success' : 'warning'}
                />
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Members"
                subtitle="Manage gym memberships"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Fitness' }, { label: 'Members' }]}
                actions={<button className="btn-primary">Add Member</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Members</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">456</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Today</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">87</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Expiring Soon</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">23</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Revenue (MTD)</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">$12.5K</p>
                </ProCard>
            </div>

            <ProCard noPadding>
                <ProTable columns={columns} data={members} />
            </ProCard>
        </div>
    );
}
