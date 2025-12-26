import { useState, useEffect } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { activitiesAPI } from '../../api';

const activityIcons = {
    call: {
        icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        ring: 'ring-emerald-50 dark:ring-emerald-900/20'
    },
    email: {
        icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        ring: 'ring-blue-50 dark:ring-blue-900/20'
    },
    meeting: {
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        ring: 'ring-purple-50 dark:ring-purple-900/20'
    },
    note: {
        icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
        color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        ring: 'ring-amber-50 dark:ring-amber-900/20'
    }
};

export default function LeadActivity() {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await activitiesAPI.getAll();
            setActivities(response.data || []);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            setActivities([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Group activities by date
    const groupedActivities = activities.reduce((groups, activity) => {
        const dateStr = activity.created_at || activity.date;
        const date = dateStr ? dateStr.split('T')[0].split(' ')[0] : 'Unknown';
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(activity);
        return groups;
    }, {});

    const getDateLabel = (dateStr) => {
        try {
            const date = parseISO(dateStr);
            if (isToday(date)) return 'Today';
            if (isYesterday(date)) return 'Yesterday';
            return format(date, 'MMMM d, yyyy');
        } catch {
            return dateStr;
        }
    };

    const stats = {
        total: activities.length,
        calls: activities.filter(a => a.type === 'call').length,
        emails: activities.filter(a => a.type === 'email').length,
        meetings: activities.filter(a => a.type === 'meeting').length
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6  rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Activity Timeline</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Track and manage your interactions with leads
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <button className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Log Activity
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total</p>
                        </div>
                    </div>
                </div>

                {[
                    { label: 'Calls', value: stats.calls, icon: activityIcons.call.icon, gradient: 'from-emerald-500 to-emerald-600' },
                    { label: 'Emails', value: stats.emails, icon: activityIcons.email.icon, gradient: 'from-blue-500 to-blue-600' },
                    { label: 'Meetings', value: stats.meetings, icon: activityIcons.meeting.icon, gradient: 'from-purple-500 to-purple-600' }
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center`}>
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                {/* Filter Pills */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    <div className="flex items-center gap-2">
                        {['all', 'call', 'email', 'meeting', 'note'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterType === type
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="p-6">
                    {Object.keys(groupedActivities).length > 0 ? (
                        <div className="space-y-10">
                            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                                <div key={date} className="relative">
                                    <div className="sticky top-0 z-10 flex items-center mb-6">
                                        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shadow-sm">
                                            {getDateLabel(date)}
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 ml-4"></div>
                                    </div>

                                    <div className="space-y-8 pl-4 sm:pl-8 relative">
                                        <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 -translate-x-1/2"></div>

                                        {dateActivities.filter(a => filterType === 'all' || a.type === filterType).map((activity) => (
                                            <div key={activity.id} className="relative flex gap-4 group">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ring-4 ring-white dark:ring-slate-800 ${activityIcons[activity.type]?.color || activityIcons.note.color} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activityIcons[activity.type]?.icon || activityIcons.note.icon} />
                                                    </svg>
                                                </div>

                                                <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-slate-900 dark:text-white text-base capitalize">
                                                                {activity.type}
                                                            </h3>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {activity.description}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-400">
                                                            {activity.created_at ? new Date(activity.created_at).toLocaleTimeString() : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No activities found</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Start by logging your first call, email, or meeting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
