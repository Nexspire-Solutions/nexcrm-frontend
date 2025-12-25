import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';

export default function Classes() {
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await apiClient.get('/classes');
            setClasses(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDayColor = (day) => {
        const colors = {
            monday: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            tuesday: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            wednesday: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            thursday: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            friday: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
            saturday: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
            sunday: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[day?.toLowerCase()] || colors.monday;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <nav className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span>Gym</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Classes</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gym Classes</h1>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Class
                </button>
            </div>

            {classes.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No classes scheduled</h3>
                    <p className="text-slate-500 dark:text-slate-400">Create fitness classes for your members.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                        <div key={cls.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-slate-900 dark:text-white">{cls.name}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getDayColor(cls.day_of_week)}`}>
                                    {cls.day_of_week}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{cls.description || 'No description'}</p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-300">
                                    {cls.start_time} • {cls.duration_minutes || 60} min
                                </span>
                                <span className="text-slate-500">{cls.room || 'TBD'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
