import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

const mockCases = [
    { id: 'CASE-2024-001', title: 'Contract Dispute - ABC Corp', client: 'ABC Corporation', attorney: 'John Smith', courtDate: '2025-01-15', status: 'active', priority: 'high' },
    { id: 'CASE-2024-002', title: 'Property Settlement', client: 'Jane Doe', attorney: 'Sarah Williams', courtDate: '2025-02-10', status: 'pending', priority: 'medium' },
    { id: 'CASE-2023-089', title: 'Employment Matter', client: 'XYZ Inc', attorney: 'Mike Davis', courtDate: '2024-12-18', status: 'closed', priority: 'low' },
    { id: 'CASE-2024-003', title: 'Criminal Defense', client: 'Robert Johnson', attorney: 'Emily Brown', courtDate: '2025-01-20', status: 'active', priority: 'critical' },
];

export default function Cases() {
    const [cases] = useState(mockCases);

    const columns = [
        {
            header: 'Case',
            accessor: 'title',
            render: (row) => (
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{row.title}</p>
                    <p className="text-xs text-slate-500">{row.id}</p>
                </div>
            )
        },
        { header: 'Client', accessor: 'client' },
        { header: 'Attorney', accessor: 'attorney' },
        { header: 'Court Date', accessor: 'courtDate', className: 'font-medium' },
        {
            header: 'Priority',
            accessor: 'priority',
            render: (row) => (
                <StatusBadge
                    status={row.priority}
                    variant={row.priority === 'critical' ? 'error' : row.priority === 'high' ? 'warning' : row.priority === 'medium' ? 'info' : 'neutral'}
                />
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'neutral'}
                />
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Cases"
                subtitle="Manage legal cases and court dates"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Legal' }, { label: 'Cases' }]}
                actions={<button className="btn-primary">New Case</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Cases</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">24</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Upcoming Hearings</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">8</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Critical Priority</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">3</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cases Won (YTD)</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">45</p>
                </ProCard>
            </div>

            <ProCard noPadding>
                <ProTable columns={columns} data={cases} />
            </ProCard>
        </div>
    );
}
