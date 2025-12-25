import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await apiClient.get('/patients');
            setPatients(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            setPatients([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'Patient ID', accessor: 'id', className: 'font-medium' },
        { header: 'Name', accessor: 'name', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Age', accessor: 'age' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Last Visit', accessor: 'lastVisit', render: (row) => row.lastVisit ? new Date(row.lastVisit).toLocaleDateString() : '-' },
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
                title="Patients"
                subtitle="Manage patient records"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Healthcare' }, { label: 'Patients' }]}
                actions={<button className="btn-primary">Add Patient</button>}
            />

            {patients.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No patients found</p>
                        <p className="text-sm text-slate-400 mt-1">Add your first patient to get started</p>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={patients} />
                </ProCard>
            )}
        </div>
    );
}
