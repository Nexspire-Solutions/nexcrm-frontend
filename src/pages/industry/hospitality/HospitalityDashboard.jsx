import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';

export default function HospitalityDashboard() {
    const [stats, setStats] = useState({ rooms: null, tours: null });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [roomsRes, toursRes] = await Promise.allSettled([
                apiClient.get('/rooms/stats'),
                apiClient.get('/tours/stats')
            ]);
            setStats({
                rooms: roomsRes.status === 'fulfilled' ? roomsRes.value.data?.stats : null,
                tours: toursRes.status === 'fulfilled' ? toursRes.value.data?.stats : null
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hospitality Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400">Overview of your hotel and tour operations</p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                    { name: 'Rooms', path: '/rooms', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'indigo' },
                    { name: 'Reservations', path: '/reservations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'blue' },
                    { name: 'Tours', path: '/tours', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald' },
                    { name: 'Tour Bookings', path: '/tour-bookings', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'purple' },
                    { name: 'Destinations', path: '/destinations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', color: 'orange' },
                    { name: 'Guests', path: '/guests', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'cyan' }
                ].map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-${item.color}-300 dark:hover:border-${item.color}-600 transition-colors`}
                    >
                        <div className={`w-10 h-10 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-lg flex items-center justify-center mb-2`}>
                            <svg className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</span>
                    </Link>
                ))}
            </div>

            {/* Hotel Stats */}
            {stats.rooms && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Hotel Status</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.rooms.total || 0}</div>
                            <div className="text-xs text-slate-500">Total Rooms</div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-emerald-600">{stats.rooms.available || 0}</div>
                            <div className="text-xs text-slate-500">Available</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.rooms.occupied || 0}</div>
                            <div className="text-xs text-slate-500">Occupied</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{stats.rooms.check_ins_today || 0}</div>
                            <div className="text-xs text-slate-500">Check-ins Today</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{stats.rooms.check_outs_today || 0}</div>
                            <div className="text-xs text-slate-500">Check-outs Today</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tour Stats */}
            {stats.tours && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tours & Travel</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.tours.total_tours || 0}</div>
                            <div className="text-xs text-slate-500">Total Tours</div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-emerald-600">{stats.tours.published || 0}</div>
                            <div className="text-xs text-slate-500">Published</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.tours.total_bookings || 0}</div>
                            <div className="text-xs text-slate-500">Bookings</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{stats.tours.upcoming_departures || 0}</div>
                            <div className="text-xs text-slate-500">Upcoming Departures</div>
                        </div>
                        <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">Rs. {parseFloat(stats.tours.collected_amount || 0).toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Revenue</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
