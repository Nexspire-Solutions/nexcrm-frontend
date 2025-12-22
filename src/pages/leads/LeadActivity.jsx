import { useState } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const mockActivities = [
    { id: 1, type: 'call', contact: 'John Smith', company: 'TechCorp', title: 'Discovery call', date: '2024-12-23 14:30', user: 'Jane Admin', duration: '15 min', notes: 'Discussed initial requirements and budget constraints.' },
    { id: 2, type: 'email', contact: 'Sarah Johnson', company: 'DataFlow', title: 'Follow-up email sent', date: '2024-12-23 10:00', user: 'Mike Sales', duration: null, notes: 'Sent proposal v1.2 for review.' },
    { id: 3, type: 'meeting', contact: 'Emily Brown', company: 'DesignHub', title: 'Product demo', date: '2024-12-22 15:00', user: 'Jane Admin', duration: '45 min', notes: 'Demo went well, interested in premium plan.' },
    { id: 4, type: 'note', contact: 'David Lee', company: 'CloudSync', title: 'Updated requirements', date: '2024-12-22 11:30', user: 'Mike Sales', duration: null, notes: 'Client requested additional security features.' },
    { id: 5, type: 'call', contact: 'Mike Wilson', company: 'StartupXYZ', title: 'Pricing discussion', date: '2024-12-21 16:00', user: 'Jane Admin', duration: '20 min', notes: 'Negotiated annual contract terms.' },
];

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
    const [activities] = useState(mockActivities);
    const [filterType, setFilterType] = useState('all');

    // Group activities by date
    const groupedActivities = activities.reduce((groups, activity) => {
        const date = activity.date.split(' ')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(activity);
        return groups;
    }, {});

    const getDateLabel = (dateStr) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    const stats = {
        total: activities.length,
        calls: activities.filter(a => a.type === 'call').length,
        emails: activities.filter(a => a.type === 'email').length,
        meetings: activities.filter(a => a.type === 'meeting').length
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Timeline</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track and manage your interactions with leads
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <button className="btn-primary">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Log Activity
                    </button>
                </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-2">
                            <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
                    </div>

                    {[
                        { label: 'Calls', value: stats.calls, icon: activityIcons.call.icon, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                        { label: 'Emails', value: stats.emails, icon: activityIcons.email.icon, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                        { label: 'Meetings', value: stats.meetings, icon: activityIcons.meeting.icon, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className={`flex items-center gap-3 ${stat.color} mb-2`}>
                                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                    </svg>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                            </div>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Quick Log Action */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg flex flex-col justify-center">
                    <h3 className="font-bold text-lg mb-1">Quick Actions</h3>
                    <p className="text-indigo-100 text-sm mb-4">Log a new interaction instantly</p>
                    <div className="flex gap-2">
                        {[
                            { icon: activityIcons.call.icon, label: 'Call' },
                            { icon: activityIcons.email.icon, label: 'Email' },
                            { icon: activityIcons.note.icon, label: 'Note' }
                        ].map((action) => (
                            <button key={action.label} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                                </svg>
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
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
                    <div className="space-y-10">
                        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                            <div key={date} className="relative">
                                {/* Date Header */}
                                <div className="sticky top-0 z-10 flex items-center mb-6">
                                    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shadow-sm">
                                        {getDateLabel(date)}
                                    </div>
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 ml-4"></div>
                                </div>

                                <div className="space-y-8 pl-4 sm:pl-8 relative">
                                    {/* Vertical Line */}
                                    <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 -translate-x-1/2"></div>

                                    {dateActivities.filter(a => filterType === 'all' || a.type === filterType).map((activity) => (
                                        <div key={activity.id} className="relative flex gap-4 group">
                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ring-4 ring-white dark:ring-slate-800 ${activityIcons[activity.type].color} ${activityIcons[activity.type].ring} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activityIcons[activity.type].icon} />
                                                </svg>
                                            </div>

                                            {/* Card */}
                                            <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                                                            {activity.title}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            with <span className="font-medium text-slate-700 dark:text-slate-300">{activity.contact}</span>
                                                            <span className="mx-1">•</span>
                                                            {activity.company}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {activity.duration && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {activity.duration}
                                                            </span>
                                                        )}
                                                        <span className="text-xs font-medium text-slate-400">
                                                            {format(parseISO(activity.date), 'h:mm a')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {activity.notes && (
                                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 mt-3">
                                                        {activity.notes}
                                                    </div>
                                                )}

                                                <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                                                        {activity.user.charAt(0)}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        Logged by {activity.user}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {activities.length === 0 && (
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
    );
}
