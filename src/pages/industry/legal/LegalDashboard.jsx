/**
 * Legal Dashboard - CRM Frontend
 * 
 * Main dashboard for legal practice management
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiUsers, FiClock, FiDollarSign, FiCalendar, FiAlertCircle, FiTrendingUp, FiChevronRight, FiPlus, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import ProHeader from '../../../components/common/ProHeader';

export default function LegalDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await apiClient.get('/legal-reports/dashboard');
            setData(response.data.data);
        } catch (error) {
            console.error('Dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Active Cases',
            value: data?.cases?.active_cases || 0,
            total: data?.cases?.total_cases || 0,
            icon: FiBriefcase,
            color: 'indigo',
            link: '/cases'
        },
        {
            label: 'Active Clients',
            value: data?.clients?.total_clients || 0,
            subtext: formatCurrency(data?.clients?.total_outstanding) + ' outstanding',
            icon: FiUsers,
            color: 'emerald',
            link: '/legal-clients'
        },
        {
            label: 'Billed This Month',
            value: formatCurrency(data?.revenue?.billed_this_month),
            subtext: formatCurrency(data?.revenue?.collected_this_month) + ' collected',
            icon: FiDollarSign,
            color: 'amber',
            link: '/legal-invoices'
        },
        {
            label: 'Hours This Month',
            value: parseFloat(data?.time?.hours_this_month || 0).toFixed(1),
            subtext: `${parseFloat(data?.time?.billable_hours || 0).toFixed(1)} billable`,
            icon: FiClock,
            color: 'purple',
            link: '/time-tracking'
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Legal Dashboard"
                subtitle="Practice overview and key metrics"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Legal' }]}
                actions={
                    <div className="flex gap-2">
                        <Link to="/cases/new" className="btn-primary flex items-center gap-2">
                            <FiPlus className="w-4 h-4" /> New Case
                        </Link>
                    </div>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, idx) => (
                    <Link key={idx} to={stat.link} className="card p-5 hover:border-indigo-300 transition-colors group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stat.value}
                                    {stat.total && <span className="text-sm font-normal text-slate-400"> / {stat.total}</span>}
                                </p>
                                {stat.subtext && (
                                    <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
                                )}
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Win Rate Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="card p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiTrendingUp className="w-5 h-5 text-emerald-600" />
                        Case Outcomes
                    </h3>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-emerald-600">{data?.cases?.won || 0}</p>
                                <p className="text-xs text-slate-500">Won</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-red-500">{data?.cases?.lost || 0}</p>
                                <p className="text-xs text-slate-500">Lost</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold text-indigo-600">
                                {data?.cases?.won && data?.cases?.total_cases
                                    ? Math.round((data.cases.won / (data.cases.won + data.cases.lost)) * 100)
                                    : 0}%
                            </p>
                            <p className="text-xs text-slate-500">Win Rate</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiCalendar className="w-5 h-5 text-indigo-600" />
                            Upcoming Hearings
                        </h3>
                        <Link to="/court-calendar" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                            View All <FiChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {data?.upcoming_hearings?.length > 0 ? (
                        <div className="space-y-3">
                            {data.upcoming_hearings.map((hearing, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex flex-col items-center justify-center">
                                        <span className="text-xs text-indigo-600 font-medium">
                                            {new Date(hearing.hearing_date).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                        <span className="text-lg font-bold text-indigo-600">
                                            {new Date(hearing.hearing_date).getDate()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">
                                            {hearing.case_title}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {hearing.case_number} • {hearing.court_name || 'Court TBD'}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium text-indigo-600">
                                        {hearing.hearing_time || '10:00 AM'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No upcoming hearings</p>
                    )}
                </div>
            </div>

            {/* Overdue Tasks & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overdue Tasks */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiAlertCircle className="w-5 h-5 text-red-500" />
                            Overdue Tasks
                        </h3>
                        <Link to="/legal-tasks" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                            View All <FiChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {data?.overdue_tasks?.length > 0 ? (
                        <div className="space-y-2">
                            {data.overdue_tasks.map((task, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                        <FiClock className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{task.title}</p>
                                        <p className="text-xs text-slate-500">
                                            {task.case_number} • Due {new Date(task.due_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                        task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                        {task.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                            <p className="text-slate-500">No overdue tasks</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiFileText className="w-5 h-5 text-indigo-600" />
                            Recent Activity
                        </h3>
                    </div>
                    {data?.recent_activities?.length > 0 ? (
                        <div className="space-y-3">
                            {data.recent_activities.slice(0, 5).map((activity, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiFileText className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-900 dark:text-white">
                                            <span className="font-medium">{activity.firstName} {activity.lastName}</span>
                                            {' '}{activity.description || activity.activity_type}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {activity.case_number} • {new Date(activity.performed_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No recent activity</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 card p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link to="/cases/new" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <FiBriefcase className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">New Case</span>
                    </Link>
                    <Link to="/legal-clients/new" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <FiUsers className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">Add Client</span>
                    </Link>
                    <Link to="/time-tracking" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <FiClock className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">Log Time</span>
                    </Link>
                    <Link to="/legal-invoices/new" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                            <FiDollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">Create Invoice</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
