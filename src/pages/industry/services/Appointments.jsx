import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
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

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Appointments"
                subtitle="Manage service appointments"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Services' }, { label: 'Appointments' }]}
                actions={<button className="btn-primary">New Appointment</button>}
            />

            {appointments.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No appointments found</p>
                        <p className="text-sm text-slate-400 mt-1">Schedule your first appointment to get started</p>
                    </div>
                </ProCard>
            ) : (
                <div className="space-y-4">
                    {appointments.map(apt => (
                        <ProCard key={apt.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{apt.customerName || apt.name}</h3>
                                        <p className="text-sm text-slate-500">{apt.service || 'General Service'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {apt.date ? new Date(apt.date).toLocaleDateString() : '-'}
                                    </p>
                                    <p className="text-sm text-slate-500">{apt.time || '-'}</p>
                                </div>
                                <StatusBadge
                                    status={apt.status || 'scheduled'}
                                    variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'error' : 'info'}
                                />
                            </div>
                        </ProCard>
                    ))}
                </div>
            )}
        </div>
    );
}
