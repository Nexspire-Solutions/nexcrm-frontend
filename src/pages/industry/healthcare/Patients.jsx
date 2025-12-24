import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

const mockPatients = [
    { id: 'PAT-001', name: 'John Doe', age: 45, condition: 'Hypertension', lastVisit: '2024-12-10', nextAppt: '2025-01-10', status: 'active' },
    { id: 'PAT-002', name: 'Jane Smith', age: 32, condition: 'Routine Checkup', lastVisit: '2024-11-05', nextAppt: '2025-05-05', status: 'stable' },
    { id: 'PAT-003', name: 'Robert Johnson', age: 67, condition: 'Diabetes Type 2', lastVisit: '2024-12-20', nextAppt: '2024-12-27', status: 'critical' },
    { id: 'PAT-004', name: 'Emily White', age: 28, condition: 'Prenatal Care', lastVisit: '2024-12-15', nextAppt: '2025-01-15', status: 'active' },
];

export default function Patients() {
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
        {
            header: 'Patient Name',
            accessor: 'name',
            className: 'font-medium',
            render: (row) => (
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
                    <p className="text-xs text-slate-500">ID: {row.id}</p>
                </div>
            )
        },
        { header: 'Age', accessor: 'age' },
        { header: 'Condition', accessor: 'condition' },
        { header: 'Last Visit', accessor: 'lastVisit' },
        { header: 'Next Appt', accessor: 'nextAppt', className: 'text-indigo-600 font-medium' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={row.status === 'critical' ? 'error' : row.status === 'stable' ? 'success' : 'info'}
                />
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Patient Directory"
                subtitle="Securely manage patient records and appointments"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Healthcare' }, { label: 'Patients' }]}
                actions={<button className="btn-primary">Register Patient</button>}
            />

            <ProCard noPadding>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <input
                        type="text"
                        placeholder="Search patients by name or ID..."
                        className="input max-w-md w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ProTable columns={columns} data={mockPatients} />
            </ProCard>
        </div>
    );
}
