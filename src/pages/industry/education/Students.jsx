import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

const mockStudents = [
    { id: 'STU-001', name: 'Alex Thompson', course: 'Web Development', grade: 'A', attendance: '95%', status: 'active' },
    { id: 'STU-002', name: 'Maria Garcia', course: 'Data Science', grade: 'B+', attendance: '88%', status: 'active' },
    { id: 'STU-003', name: 'James Lee', course: 'UI/UX Design', grade: 'A-', attendance: '92%', status: 'active' },
    { id: 'STU-004', name: 'Sophie Turner', course: 'Mobile Development', grade: 'B', attendance: '85%', status: 'warning' },
    { id: 'STU-005', name: 'Ryan Mitchell', course: 'Web Development', grade: 'C', attendance: '70%', status: 'at-risk' },
];

export default function Students() {
    const [students] = useState(mockStudents);

    const columns = [
        {
            header: 'Student',
            accessor: 'name',
            render: (row) => (
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.id}</p>
                </div>
            )
        },
        { header: 'Course', accessor: 'course' },
        {
            header: 'Grade',
            accessor: 'grade',
            className: 'font-bold text-indigo-600'
        },
        { header: 'Attendance', accessor: 'attendance' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={row.status === 'active' ? 'success' : row.status === 'warning' ? 'warning' : 'error'}
                />
            )
        },
        {
            header: 'Actions',
            align: 'right',
            render: () => (
                <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">View</button>
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Students"
                subtitle="Track student performance and attendance"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Education' }, { label: 'Students' }]}
                actions={<button className="btn-primary">Enroll Student</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Students</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">128</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Courses</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">12</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Attendance</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">89%</p>
                </ProCard>
                <ProCard>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">At Risk</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">3</p>
                </ProCard>
            </div>

            <ProCard noPadding>
                <ProTable columns={columns} data={students} />
            </ProCard>
        </div>
    );
}
