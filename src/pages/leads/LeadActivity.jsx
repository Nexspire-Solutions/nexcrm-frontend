import { useState } from 'react';

const mockActivities = [
    { id: 1, type: 'call', contact: 'John Smith', company: 'TechCorp', title: 'Discovery call', date: '2024-12-21 14:30', user: 'Jane Admin', duration: '15 min' },
    { id: 2, type: 'email', contact: 'Sarah Johnson', company: 'DataFlow', title: 'Follow-up email sent', date: '2024-12-21 10:00', user: 'Mike Sales', duration: null },
    { id: 3, type: 'meeting', contact: 'Emily Brown', company: 'DesignHub', title: 'Product demo', date: '2024-12-20 15:00', user: 'Jane Admin', duration: '45 min' },
    { id: 4, type: 'note', contact: 'David Lee', company: 'CloudSync', title: 'Updated requirements', date: '2024-12-20 11:30', user: 'Mike Sales', duration: null },
    { id: 5, type: 'call', contact: 'Mike Wilson', company: 'StartupXYZ', title: 'Pricing discussion', date: '2024-12-19 16:00', user: 'Jane Admin', duration: '20 min' },
];

const activityIcons = {
    call: { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' },
    email: { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' },
    meeting: { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' },
    note: { icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' }
};

export default function LeadActivity() {
    const [activities] = useState(mockActivities);
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState('all');

    const filteredActivities = activities.filter(a => {
        return filterType === 'all' || a.type === filterType;
    });

    const stats = {
        total: activities.length,
        calls: activities.filter(a => a.type === 'call').length,
        emails: activities.filter(a => a.type === 'email').length,
        meetings: activities.filter(a => a.type === 'meeting').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Activity & History</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Track all lead interactions and activities
                    </p>
                </div>
                <button className="btn-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Log Activity
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="stat-card-icon bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.total}</p>
                    <p className="stat-card-label">Total Activities</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activityIcons.call.icon} />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.calls}</p>
                    <p className="stat-card-label">Calls</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activityIcons.email.icon} />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.emails}</p>
                    <p className="stat-card-label">Emails</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activityIcons.meeting.icon} />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.meetings}</p>
                    <p className="stat-card-label">Meetings</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="select w-full sm:w-40">
                        <option value="all">All Types</option>
                        <option value="call">Calls</option>
                        <option value="email">Emails</option>
                        <option value="meeting">Meetings</option>
                        <option value="note">Notes</option>
                    </select>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="select w-full sm:w-40">
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="card p-6">
                <div className="space-y-6">
                    {filteredActivities.map((activity, idx) => (
                        <div key={activity.id} className="relative flex gap-4">
                            {idx < filteredActivities.length - 1 && (
                                <div className="absolute left-4 top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                            )}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${activityIcons[activity.type].color}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activityIcons[activity.type].icon} />
                                </svg>
                            </div>
                            <div className="flex-1 pb-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{activity.contact} - {activity.company}</p>
                                    </div>
                                    {activity.duration && (
                                        <span className="badge-gray">{activity.duration}</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{activity.date} by {activity.user}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredActivities.length === 0 && (
                    <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="empty-state-title">No activities found</h3>
                        <p className="empty-state-text">Start by logging a call, email, or meeting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
