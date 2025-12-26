import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Cases() {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const response = await apiClient.get('/cases');
            setCases(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch cases:', error);
            setCases([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'Case #', accessor: 'caseNumber', className: 'font-medium' },
        { header: 'Client', accessor: 'clientName', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Type', accessor: 'caseType' },
        { header: 'Filed Date', accessor: 'filedDate', render: (row) => row.filedDate ? new Date(row.filedDate).toLocaleDateString() : '-' },
        { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status || 'open'} variant={row.status === 'closed' ? 'success' : row.status === 'pending' ? 'warning' : 'info'} /> },
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
                title="Cases"
                subtitle="Manage legal cases"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Legal' }, { label: 'Cases' }]}
                actions={<button className="btn-primary">New Case</button>}
            />

            {cases.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No cases found</p>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={cases} />
                </ProCard>
            )}
        </div>
    );
}
