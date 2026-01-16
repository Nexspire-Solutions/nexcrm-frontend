/**
 * Real Estate Dashboard
 * Main analytics dashboard for real estate CRM
 */

import { useState, useEffect } from 'react';
import { FiHome, FiUsers, FiCalendar, FiDollarSign, FiTrendingUp, FiAlertCircle, FiEye, FiPhone, FiClock, FiArrowRight } from 'react-icons/fi';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const RealEstateDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        properties: {},
        inquiries: {},
        transactions: {},
        today_viewings: 0,
        follow_ups_due: 0
    });
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [todayViewings, setTodayViewings] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [overview, inquiries, viewings] = await Promise.all([
                apiClient.get('/realestate-reports/overview'),
                apiClient.get('/property-inquiries?limit=5'),
                apiClient.get('/viewings/today')
            ]);

            setData(overview.data.data);
            setRecentInquiries(inquiries.data.data || []);
            setTodayViewings(viewings.data.data || []);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, subtitle, linkTo }) => (
        <Link to={linkTo || '#'} className="card p-5 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </Link>
    );

    const formatCurrency = (amount) => {
        if (!amount) return '0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'hot': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'warm': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'cold': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'contacted': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'qualified': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'site_visit_scheduled': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'site_visit_done': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
            case 'negotiation': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'booked': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Real Estate Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400">Overview of your properties, leads, and deals</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/properties/new" className="btn-primary">
                        <FiHome className="w-4 h-4" />
                        Add Property
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <StatCard
                    title="Total Properties"
                    value={data.properties?.total || 0}
                    icon={FiHome}
                    color="bg-gradient-to-br from-indigo-500 to-purple-600"
                    subtitle={`${data.properties?.available || 0} available`}
                    linkTo="/properties"
                />
                <StatCard
                    title="Active Leads"
                    value={data.inquiries?.total - (data.inquiries?.converted || 0)}
                    icon={FiUsers}
                    color="bg-gradient-to-br from-blue-500 to-cyan-600"
                    subtitle={`${data.inquiries?.today || 0} new today`}
                    linkTo="/property-inquiries"
                />
                <StatCard
                    title="Today's Viewings"
                    value={data.today_viewings || 0}
                    icon={FiCalendar}
                    color="bg-gradient-to-br from-emerald-500 to-teal-600"
                    linkTo="/viewings"
                />
                <StatCard
                    title="Deals Value"
                    value={formatCurrency(data.transactions?.total_value)}
                    icon={FiDollarSign}
                    color="bg-gradient-to-br from-amber-500 to-orange-600"
                    subtitle={`${data.transactions?.completed || 0} completed`}
                    linkTo="/transactions"
                />
                <StatCard
                    title="Follow-ups Due"
                    value={data.follow_ups_due || 0}
                    icon={FiAlertCircle}
                    color={data.follow_ups_due > 0 ? "bg-gradient-to-br from-red-500 to-pink-600" : "bg-gradient-to-br from-slate-400 to-slate-500"}
                    linkTo="/property-inquiries?filter=follow_up"
                />
            </div>

            {/* Property Status Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.properties?.available || 0}</p>
                        <p className="text-xs text-slate-500">Available</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.properties?.pending || 0}</p>
                        <p className="text-xs text-slate-500">Pending</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.properties?.sold || 0}</p>
                        <p className="text-xs text-slate-500">Sold</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{data.properties?.rented || 0}</p>
                        <p className="text-xs text-slate-500">Rented</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Inquiries */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Recent Inquiries</h3>
                        <Link to="/property-inquiries" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            View All <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentInquiries.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No recent inquiries
                            </div>
                        ) : (
                            recentInquiries.map((inquiry) => (
                                <Link key={inquiry.id} to={`/property-inquiries/${inquiry.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                        {inquiry.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{inquiry.name}</p>
                                        <p className="text-sm text-slate-500 truncate">{inquiry.property_title || inquiry.preferred_locations || 'General inquiry'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(inquiry.priority)}`}>
                                            {inquiry.priority}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(inquiry.status)}`}>
                                            {inquiry.status?.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Today's Viewings */}
                <div className="card">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Today's Viewings</h3>
                        <Link to="/viewings" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            View Calendar <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {todayViewings.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <FiCalendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                No viewings scheduled for today
                            </div>
                        ) : (
                            todayViewings.map((viewing) => (
                                <div key={viewing.id} className="flex items-center gap-4 p-4">
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <FiClock className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{viewing.property_title}</p>
                                        <p className="text-sm text-slate-500">{viewing.visitor_name} - {viewing.city}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-slate-900 dark:text-white">{viewing.scheduled_time}</p>
                                        <p className="text-xs text-slate-500">{viewing.viewing_type}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link to="/properties/new" className="btn-secondary">
                        <FiHome className="w-4 h-4" /> Add Property
                    </Link>
                    <Link to="/property-inquiries/new" className="btn-secondary">
                        <FiUsers className="w-4 h-4" /> Add Lead
                    </Link>
                    <Link to="/viewings/new" className="btn-secondary">
                        <FiCalendar className="w-4 h-4" /> Schedule Viewing
                    </Link>
                    <Link to="/transactions/new" className="btn-secondary">
                        <FiDollarSign className="w-4 h-4" /> Create Deal
                    </Link>
                    <Link to="/realestate-reports" className="btn-secondary">
                        <FiTrendingUp className="w-4 h-4" /> View Reports
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RealEstateDashboard;
