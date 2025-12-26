import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await apiClient.get('/students');
            setStudents(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Course', accessor: 'course' },
        { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status || 'active'} variant={row.status === 'active' ? 'success' : 'neutral'} /> },
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
                title="Students"
                subtitle="Manage enrolled students"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Education' }, { label: 'Students' }]}
                actions={<button className="btn-primary">Add Student</button>}
            />

            {students.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No students found</p>
                        <p className="text-sm text-slate-400 mt-1">Add your first student to get started</p>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={students} />
                </ProCard>
            )}
        </div>
    );
}
