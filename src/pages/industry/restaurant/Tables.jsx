import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';

export default function Tables() {
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const response = await apiClient.get('/tables');
            setTables(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch tables:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            available: 'bg-green-500',
            occupied: 'bg-red-500',
            reserved: 'bg-yellow-500'
        };
        return colors[status] || colors.available;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-24 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
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
                        <span>Kitchen</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Tables</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Restaurant Tables</h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Reserved</span>
                    </div>
                </div>
            </div>

            {tables.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tables configured</h3>
                    <p className="text-slate-500 dark:text-slate-400">Add tables to manage reservations.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {tables.map((table) => (
                        <div key={table.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 text-center cursor-pointer hover:shadow-lg transition-shadow">
                            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${getStatusColor(table.status)}`}></div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Table {table.table_number}</h3>
                            <p className="text-sm text-slate-500">{table.capacity} seats</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
