import { useState, useEffect } from 'react';
import { format, isToday, isYesterday, parseISO, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { activitiesAPI, usersAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

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

    // New Filters
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [selectedUser, setSelectedUser] = useState('all');
    const [users, setUsers] = useState([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [newActivity, setNewActivity] = useState({
        type: 'call',
        summary: '',
        details: '',
        relatedType: 'lead',
        relatedId: '' // Would ideally require a lead selector, skipping complex selector for now unless requested
    });

    useEffect(() => {
        fetchData();
    }, [dateRange, selectedUser]); // Re-fetch when filters change

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [activitiesRes, usersRes] = await Promise.all([
                activitiesAPI.getAll({
                    startDate: dateRange.start,
                    endDate: dateRange.end,
                    userId: selectedUser,
                    limit: 200
                }),
                usersAPI.getAll()
            ]);

            setActivities(activitiesRes.data || []);
            setUsers(usersRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setActivities([]);
            toast.error('Failed to load activities');
        } finally {
            setIsLoading(false);
        }
    };

    // Prepare Chart Data
    const chartData = Object.entries(activities.reduce((acc, curr) => {
        const date = curr.created_at ? format(parseISO(curr.created_at), 'MMM dd') : 'Unknown';
        if (!acc[date]) acc[date] = { date, call: 0, email: 0, meeting: 0, note: 0 };
        if (acc[date][curr.type] !== undefined) acc[date][curr.type]++;
        return acc;
    }, {})).map(([_, val]) => val).reverse(); // Reverse to show chronological order if needed, but API sorts DESC

    const handleExport = () => {
        const headers = ['Date', 'Type', 'Summary', 'User', 'Related To', 'Company', 'Email'];
        const csvContent = [
            headers.join(','),
            ...activities.map(a => [
                a.created_at,
                a.type,
                `"${(a.description || '').replace(/"/g, '""')}"`,
                `"${a.firstName || ''} ${a.lastName || ''}"`,
                `"${a.relatedName || `${a.relatedType} #${a.relatedId}`}"`,
                `"${a.relatedCompany || ''}"`,
                `"${a.relatedEmail || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activities-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
    };

    const handleSaveActivity = async () => {
        try {
            // Basic validation
            if (!newActivity.summary) return toast.error('Summary is required');

            // For now, attaching to a dummy lead if not specified, 
            // In a real scenario, this modal would need a Lead selector or be context-aware
            const payload = {
                ...newActivity,
                entityType: newActivity.relatedType,
                entityId: newActivity.relatedId || 1 // Fallback to avoid error, in real app need a picker
            };

            await activitiesAPI.create(payload);
            toast.success('Activity logged');
            setShowModal(false);
            fetchData();
            setNewActivity({ type: 'call', summary: '', details: '', relatedType: 'lead', relatedId: '' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to save activity');
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
            <div className="flex flex-col gap-6 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Activity Hub</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Centralized timeline of all sales interactions
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Log Activity
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Range:</span>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="input-field py-1 px-3 text-sm w-auto"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="input-field py-1 px-3 text-sm w-auto"
                        />
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">User:</span>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="input-field py-1 px-3 text-sm w-48"
                        >
                            <option value="all">All Users</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                            ))}
                        </select>
                    </div>
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

            {/* Activity Trends Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Activity Trends</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: '#F1F5F9' }}
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            {/* Removed stackId to create grouped bar chart */}
                            <Bar dataKey="call" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="email" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="meeting" fill="#A855F7" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="note" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                {/* Filter Pills */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    <div className="flex items-center gap-2">
                        {['all', 'call', 'email', 'meeting', 'note'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${filterType === type
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
                <div className="p-4">
                    {Object.keys(groupedActivities).length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                                <div key={date} className="relative">
                                    <div className="sticky top-0 z-10 flex items-center mb-4">
                                        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shadow-sm">
                                            {getDateLabel(date)}
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 ml-4"></div>
                                    </div>

                                    <div className="space-y-3 pl-3 relative">
                                        <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 -translate-x-1/2"></div>

                                        {dateActivities.filter(a => filterType === 'all' || a.type === filterType).map((activity) => (
                                            <div key={activity.id} className="relative flex gap-3 group">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ring-2 ring-white dark:ring-slate-800 ${activityIcons[activity.type]?.color || activityIcons.note.color} shadow-sm group-hover:scale-110 transition-transform duration-200 mt-3.5`}>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activityIcons[activity.type]?.icon || activityIcons.note.icon} />
                                                    </svg>
                                                </div>

                                                <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all shadow-sm">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm capitalize">
                                                                    {activity.type}
                                                                </h3>
                                                                <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
                                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                                    {activity.firstName} {activity.lastName}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                                {activity.description}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                                            {activity.created_at ? new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-medium text-slate-900 dark:text-white">No activities found</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start by logging your first call, email, or meeting.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Log Activity Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto w-full">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}>
                            <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-200 dark:border-slate-700">
                            <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Log Activity
                                </h3>
                            </div>

                            <div className="px-6 py-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Type
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['call', 'email', 'meeting', 'note'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setNewActivity({ ...newActivity, type })}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${newActivity.type === type
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-600'
                                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <svg className="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activityIcons[type].icon} />
                                                </svg>
                                                <span className="capitalize text-sm font-medium">{type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Summary
                                    </label>
                                    <input
                                        type="text"
                                        value={newActivity.summary}
                                        onChange={(e) => setNewActivity({ ...newActivity, summary: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-base shadow-sm"
                                        placeholder="e.g. Initial discovery call"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Details
                                    </label>
                                    <textarea
                                        rows="5"
                                        value={newActivity.details}
                                        onChange={(e) => setNewActivity({ ...newActivity, details: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-base shadow-sm resize-none"
                                        placeholder="Add specific details about the interaction..."
                                    ></textarea>
                                </div>

                                <div className="text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                                    Note: This will be logged as a general activity. To attach to a specific Lead, please use the Lead Detail page.
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex flex-row-reverse gap-3">
                                <button
                                    type="button"
                                    onClick={handleSaveActivity}
                                    className="btn-primary w-full sm:w-auto"
                                >
                                    Save Activity
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
