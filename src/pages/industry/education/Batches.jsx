import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Batches() {
    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await apiClient.get('/education/batches');
            setBatches(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch batches:', error);
            setBatches([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'Batch Code', accessor: 'batch_code', className: 'font-medium' },
        { header: 'Course Name', accessor: 'course_name', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Instructor', accessor: 'instructor_name' },
        { header: 'Schedule', accessor: 'schedule_days', render: (row) => `${row.schedule_days} (${row.start_time} - ${row.end_time})` },
        { header: 'Students', accessor: 'student_count', render: (row) => `${row.student_count}/${row.capacity}` },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={row.status === 'ongoing' ? 'success' : row.status === 'upcoming' ? 'info' : 'neutral'}
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
                title="Batches & Scheduling"
                subtitle="Manage course batches, instructors, and student assignments"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Education' }, { label: 'Batches' }]}
                actions={<button className="btn-primary">Create Batch</button>}
            />

            {batches.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No active batches found</p>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={batches} />
                </ProCard>
            )}
        </div>
    );
}
