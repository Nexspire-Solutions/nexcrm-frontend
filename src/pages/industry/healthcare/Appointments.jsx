import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await apiClient.get('/appointments');
            setAppointments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        { header: 'ID', accessor: 'id', className: 'font-medium' },
        { header: 'Patient', accessor: 'patient_name', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'Doctor', accessor: 'doctor_name' },
        { header: 'Date', accessor: 'appointment_date', render: (row) => new Date(row.appointment_date).toLocaleDateString() },
        { header: 'Time', accessor: 'appointment_time' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={
                        row.status === 'scheduled' ? 'warning' :
                            row.status === 'completed' ? 'success' :
                                row.status === 'cancelled' ? 'danger' : 'neutral'
                    }
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
                title="Appointments"
                subtitle="Manage healthcare appointments and schedules"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Healthcare' }, { label: 'Appointments' }]}
                actions={<button className="btn-primary">New Appointment</button>}
            />

            {appointments.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No appointments scheduled</p>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={appointments} />
                </ProCard>
            )}
        </div>
    );
}
