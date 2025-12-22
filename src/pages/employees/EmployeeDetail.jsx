import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const mockEmployee = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@company.com',
    department: 'Sales',
    position: 'Sales Manager',
    status: 'active',
    phone: '+1 234 567 890',
    joinDate: '2023-01-15',
    address: '123 Main St, New York, NY 10001',
    bio: 'Experienced sales professional with 10+ years in the industry.',
    activities: [
        { id: 1, type: 'lead', title: 'Closed deal with TechCorp', date: '2024-12-20' },
        { id: 2, type: 'meeting', title: 'Client meeting - ABC Inc', date: '2024-12-19' },
        { id: 3, type: 'call', title: 'Follow-up call with prospect', date: '2024-12-18' },
    ]
};

export default function EmployeeDetail() {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setEmployee(mockEmployee);
            setIsLoading(false);
        }, 300);
    }, [id]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse"></div>
                <div className="card p-6 space-y-4">
                    <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">Employee not found</h3>
                <Link to="/employees" className="btn-primary mt-4">Back to Employees</Link>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const styles = { active: 'badge-success', inactive: 'badge-gray', on_leave: 'badge-warning' };
        const labels = { active: 'Active', inactive: 'Inactive', on_leave: 'On Leave' };
        return <span className={styles[status]}>{labels[status]}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/employees" className="btn-ghost p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="flex-1">
                    <h1 className="page-title">{employee.firstName} {employee.lastName}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{employee.position}</p>
                </div>
                <button className="btn-secondary">Edit Profile</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="card p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold mb-4">
                            {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{employee.position}</p>
                        <div className="mt-2">{getStatusBadge(employee.status)}</div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{employee.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{employee.department}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Joined {employee.joinDate}</span>
                        </div>
                    </div>
                </div>

                {/* Activity & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">About</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{employee.bio}</p>
                    </div>

                    {/* Recent Activity */}
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {employee.activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{activity.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{activity.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
