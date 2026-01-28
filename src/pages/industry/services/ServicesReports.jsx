import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import apiClient from '../../../api/axios';

// Icons
const Icons = {
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    currency: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    trendUp: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    star: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    ),
    clock: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
};

export default function ServicesReports() {
    const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        newClients: 0,
        returningClients: 0,
        topServices: [],
        topStaff: [],
        bookingsByDay: [],
        revenueByMonth: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [dateRange]);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            // Get date range
            const endDate = new Date();
            let startDate = new Date();
            switch (dateRange) {
                case 'week':
                    startDate.setDate(endDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(endDate.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(endDate.getMonth() - 3);
                    break;
                case 'year':
                    startDate.setFullYear(endDate.getFullYear() - 1);
                    break;
            }

            const [appointmentsRes, statsRes] = await Promise.all([
                apiClient.get('/appointments', {
                    params: { limit: 1000 }
                }),
                apiClient.get('/appointments/stats').catch(() => ({ data: {} }))
            ]);

            const appointments = appointmentsRes.data?.data || [];
            const appointmentStats = statsRes.data?.stats || {};

            // Calculate stats
            const completed = appointments.filter(a => a.status === 'completed');
            const cancelled = appointments.filter(a => a.status === 'cancelled');
            const totalRevenue = completed.reduce((sum, a) => sum + parseFloat(a.total_amount || 0), 0);

            // Top services
            const serviceCount = {};
            appointments.forEach(a => {
                if (a.service_name) {
                    serviceCount[a.service_name] = (serviceCount[a.service_name] || 0) + 1;
                }
            });
            const topServices = Object.entries(serviceCount)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Top staff
            const staffCount = {};
            appointments.forEach(a => {
                const staffName = a.staff_first_name || a.staff_name || 'Unassigned';
                staffCount[staffName] = (staffCount[staffName] || 0) + 1;
            });
            const topStaff = Object.entries(staffCount)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Bookings by day of week
            const dayCount = [0, 0, 0, 0, 0, 0, 0];
            appointments.forEach(a => {
                if (a.appointment_date) {
                    const day = new Date(a.appointment_date).getDay();
                    dayCount[day]++;
                }
            });
            const bookingsByDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => ({
                day,
                count: dayCount[idx]
            }));

            setStats({
                totalBookings: appointments.length,
                completedBookings: completed.length,
                cancelledBookings: cancelled.length,
                totalRevenue,
                averageBookingValue: completed.length ? totalRevenue / completed.length : 0,
                newClients: appointmentStats.today || 0,
                returningClients: appointmentStats.completed || 0,
                topServices,
                topStaff,
                bookingsByDay,
                revenueByMonth: []
            });
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const endDate = new Date();
            let startDate = new Date();
            switch (dateRange) {
                case 'week': startDate.setDate(endDate.getDate() - 7); break;
                case 'month': startDate.setMonth(endDate.getMonth() - 1); break;
                case 'quarter': startDate.setMonth(endDate.getMonth() - 3); break;
                case 'year': startDate.setFullYear(endDate.getFullYear() - 1); break;
            }

            const params = {
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0]
            };

            const response = await apiClient.get('/appointments/report-export', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `service-report-${dateRange}-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report');
        }
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <ProCard className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 opacity-20 ${color}`}></div>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl ${color} text-white`}>
                    {icon}
                </div>
            </div>
        </ProCard>
    );

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Services Reports"
                subtitle="Analytics and performance metrics"
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Services' },
                    { label: 'Reports' }
                ]}
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                        </button>
                        <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            {['week', 'month', 'quarter', 'year'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`px-3 py-2 text-sm capitalize ${dateRange === range
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                }
            />

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings.toLocaleString()}
                    icon={Icons.calendar}
                    color="bg-indigo-500"
                    subtitle={`${stats.completedBookings} completed`}
                />
                <StatCard
                    title="Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={Icons.currency}
                    color="bg-green-500"
                    subtitle={`₹${stats.averageBookingValue.toFixed(0)} avg/booking`}
                />
                <StatCard
                    title="Completion Rate"
                    value={`${stats.totalBookings ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1) : 0}%`}
                    icon={Icons.trendUp}
                    color="bg-blue-500"
                    subtitle={`${stats.cancelledBookings} cancelled`}
                />
                <StatCard
                    title="Active Today"
                    value={stats.newClients}
                    icon={Icons.users}
                    color="bg-purple-500"
                    subtitle="appointments today"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Services */}
                <ProCard>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Top Services</h3>
                    {stats.topServices.length === 0 ? (
                        <p className="text-slate-500 text-sm">No data available</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.topServices.map((service, idx) => {
                                const maxCount = stats.topServices[0]?.count || 1;
                                const percentage = (service.count / maxCount) * 100;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-700 dark:text-slate-300">{service.name}</span>
                                            <span className="text-slate-500">{service.count} bookings</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ProCard>

                {/* Top Staff */}
                <ProCard>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Staff Performance</h3>
                    {stats.topStaff.length === 0 ? (
                        <p className="text-slate-500 text-sm">No data available</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.topStaff.map((member, idx) => {
                                const maxCount = stats.topStaff[0]?.count || 1;
                                const percentage = (member.count / maxCount) * 100;
                                return (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-700 dark:text-slate-300">{member.name}</span>
                                            <span className="text-slate-500">{member.count} appointments</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ProCard>
            </div>

            {/* Bookings by Day */}
            <ProCard>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Bookings by Day of Week</h3>
                <div className="flex items-end justify-between gap-2 h-48">
                    {stats.bookingsByDay.map((day, idx) => {
                        const maxCount = Math.max(...stats.bookingsByDay.map(d => d.count)) || 1;
                        const height = (day.count / maxCount) * 100;
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-indigo-500 rounded-t-lg transition-all duration-300 hover:bg-indigo-600"
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                ></div>
                                <div className="mt-2 text-xs text-slate-500">{day.day}</div>
                                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{day.count}</div>
                            </div>
                        );
                    })}
                </div>
            </ProCard>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <ProCard className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {stats.completedBookings}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">Completed Appointments</div>
                </ProCard>
                <ProCard className="text-center">
                    <div className="text-3xl font-bold text-red-500">
                        {stats.cancelledBookings}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">Cancelled Appointments</div>
                </ProCard>
                <ProCard className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {stats.totalBookings - stats.completedBookings - stats.cancelledBookings}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">Pending/Upcoming</div>
                </ProCard>
            </div>
        </div>
    );
}
