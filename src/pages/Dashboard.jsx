import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api';

// Professional SVG Icons
const Icons = {
    revenue: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    projects: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    leads: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    tasks: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    phone: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    mail: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    arrow: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
    plus: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    clock: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export default function Dashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    // All dashboard data from API
    const [dashboardData, setDashboardData] = useState({
        stats: { revenue: 0, totalLeads: 0, newLeads: 0, totalClients: 0, pendingTasks: 0 },
        leadsPipeline: {},
        monthlyRevenue: [],
        teamPerformance: [],
        weeklyActivity: [],
        upcomingTasks: [],
        recentLeads: [],
        thisMonth: { revenue: 0, dealsClosed: 0 },
        communication: { calls: 0, emails: 0 }
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await dashboardAPI.getCRMStats();
                if (response.success && response.data) {
                    setDashboardData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
    const formatShortCurrency = (amt) => {
        if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
        if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`;
        return `₹${amt}`;
    };

    if (isLoading) {
        return (
            <div className="space-y-5 animate-pulse">
                <div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>)}</div>
                <div className="grid grid-cols-3 gap-5"><div className="col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div><div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div></div>
            </div>
        );
    }

    // Extract data from API response
    const { stats, leadsPipeline, monthlyRevenue, teamPerformance, weeklyActivity, upcomingTasks, recentLeads, thisMonth, communication } = dashboardData;

    // Calculate max for charts
    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);
    const totalLeads = Object.values(leadsPipeline).reduce((a, b) => a + b, 0) || 1;

    return (
        <div className="space-y-5">
            {/* Header Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.firstName || 'Admin'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                        {Icons.calendar}
                        <span>Last 30 days</span>
                    </button>
                    <Link to="/leads" state={{ openModal: true }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
                        {Icons.plus}
                        <span>Add Lead</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards - Dynamic */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: formatCurrency(stats.revenue), change: '', icon: Icons.revenue, color: 'emerald' },
                    { label: 'Total Clients', value: stats.totalClients, change: '', icon: Icons.projects, color: 'blue' },
                    { label: 'Total Leads', value: stats.totalLeads, change: `${stats.newLeads} new`, icon: Icons.leads, color: 'violet' },
                    { label: 'Pending Tasks', value: stats.pendingTasks, change: '', icon: Icons.tasks, color: 'amber' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center`}>{stat.icon}</div>
                            {stat.change && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">{stat.change}</span>}
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Grid - Mixed Layout */}
            <div className="grid grid-cols-12 gap-5">
                {/* Revenue Chart - Dynamic */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">{Icons.chart}</div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Revenue Overview</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Monthly performance (last 12 months)</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-48 flex items-end gap-2 pt-4">
                        {monthlyRevenue.length > 0 ? monthlyRevenue.map((item, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                                <div className="relative w-full">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-600 opacity-0 group-hover:opacity-100 transition bg-slate-800 text-white px-2 py-1 rounded">₹{item.revenue}k</div>
                                    <div className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition cursor-pointer" style={{ height: `${Math.max((item.revenue / maxRevenue) * 160, 4)}px` }}></div>
                                </div>
                                <span className="text-xs text-slate-400 mt-2">{item.month}</span>
                            </div>
                        )) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400">No data</div>
                        )}
                    </div>
                </div>

                {/* Quick Stats - Dynamic */}
                <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
                        <p className="text-sm text-indigo-100 mb-1">This Month</p>
                        <p className="text-3xl font-bold">{formatShortCurrency(thisMonth.revenue)}</p>
                        <p className="text-sm text-indigo-200 mt-2">{thisMonth.dealsClosed} deals closed</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">{Icons.phone}</div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{communication.calls}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Calls this week</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">{Icons.mail}</div>
                            <div>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{communication.emails}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Emails sent</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leads Pipeline - Dynamic */}
                <div className="col-span-12 lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">{Icons.leads}</div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Leads Pipeline</h3>
                        </div>
                        <Link to="/leads" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:text-indigo-700 dark:hover:text-indigo-300">View all {Icons.arrow}</Link>
                    </div>
                    <div className="space-y-2.5">
                        {Object.keys(leadsPipeline).length > 0 ? Object.entries(leadsPipeline).map(([stage, count]) => {
                            const colors = { new: 'bg-blue-500', contacted: 'bg-cyan-500', qualified: 'bg-emerald-500', proposal: 'bg-amber-500', negotiation: 'bg-orange-500', won: 'bg-green-600', lost: 'bg-red-500' };
                            return (
                                <div key={stage} className="flex items-center gap-3">
                                    <span className="w-20 text-xs text-slate-600 dark:text-slate-400 capitalize font-medium">{stage}</span>
                                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
                                        <div className={`h-full ${colors[stage] || 'bg-slate-500'} transition-all flex items-center justify-end pr-2`} style={{ width: `${Math.max((count / totalLeads) * 100, 5)}%` }}>
                                            <span className="text-[10px] font-bold text-white">{count}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-slate-400">No leads data</p>
                        )}
                    </div>
                </div>

                {/* Recent Leads Table - Dynamic */}
                <div className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Recent Leads</h3>
                        <Link to="/leads" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">View all</Link>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400 uppercase">
                            <tr>
                                <th className="text-left px-4 py-2 font-medium">Lead</th>
                                <th className="text-left px-4 py-2 font-medium">Value</th>
                                <th className="text-left px-4 py-2 font-medium">Status</th>
                                <th className="text-left px-4 py-2 font-medium">Added</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {recentLeads.length > 0 ? recentLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">{lead.name?.charAt(0) || '?'}</div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{lead.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(lead.value || 0)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${lead.status === 'new' ? 'text-blue-600 dark:text-blue-400' : lead.status === 'qualified' ? 'text-emerald-600 dark:text-emerald-400' : lead.status === 'won' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${lead.status === 'new' ? 'bg-blue-500' : lead.status === 'qualified' ? 'bg-emerald-500' : lead.status === 'won' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{lead.createdAt}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No leads found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Team Performance - Dynamic */}
                <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">{Icons.users}</div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Team Status</h3>
                        </div>
                        <Link to="/users" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {teamPerformance.length > 0 ? teamPerformance.map((member, i) => {
                            const progress = member.tasks > 0 ? (member.completed / member.tasks) * 100 : 0;
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold">
                                        {member.name?.split(' ').map(n => n[0]).join('') || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{member.name}</p>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{member.completed}/{member.tasks}</span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${progress >= 80 ? 'bg-emerald-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-slate-400">No team data</p>
                        )}
                    </div>
                </div>

                {/* Weekly Activity - Dynamic */}
                <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">{Icons.chart}</div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Weekly Activity</h3>
                    </div>
                    <div className="flex items-center gap-4 mb-3 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>Calls</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>Emails</span>
                    </div>
                    <div className="h-32 flex items-end gap-3">
                        {weeklyActivity.map((day, i) => {
                            const maxCalls = Math.max(...weeklyActivity.map(d => d.calls || 0), 1);
                            const maxEmails = Math.max(...weeklyActivity.map(d => d.emails || 0), 1);
                            return (
                                <div key={i} className="flex-1">
                                    <div className="flex gap-1 h-24 items-end">
                                        <div className="flex-1 bg-indigo-500 rounded-t" style={{ height: `${Math.max((day.calls / maxCalls) * 100, 4)}%` }}></div>
                                        <div className="flex-1 bg-emerald-500 rounded-t" style={{ height: `${Math.max((day.emails / maxEmails) * 100, 4)}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-400 text-center mt-2">{day.day?.substring(0, 3)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Tasks - Dynamic */}
                <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">{Icons.tasks}</div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Upcoming Tasks</h3>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {upcomingTasks.length > 0 ? upcomingTasks.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer">
                                <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center ${item.priority === 'high' ? 'border-red-400' : item.priority === 'medium' ? 'border-amber-400' : 'border-slate-300 dark:border-slate-600'}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.task}</p>
                                    <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        {Icons.clock}
                                        <span>{item.due}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-400 text-center py-4">No upcoming tasks</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
