import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';

export default function Tracking() {
    const [shipments, setShipments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {
            const response = await apiClient.get('/shipments?status=in_transit');
            setShipments(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch shipments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-100 dark:bg-slate-700 rounded mb-4 animate-pulse"></div>
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
                        <span>Fleet</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Tracking</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Tracking</h1>
                </div>
            </div>

            {shipments.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No shipments in transit</h3>
                    <p className="text-slate-500 dark:text-slate-400">Active shipments will appear here for tracking.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {shipments.map((shipment) => (
                        <div key={shipment.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Shipment #{shipment.tracking_number}</h3>
                                    <p className="text-sm text-slate-500">{shipment.origin} → {shipment.destination}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium">
                                    In Transit
                                </span>
                            </div>
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div className="text-xs text-slate-500">Progress</div>
                                    <div className="text-xs text-slate-500">{shipment.progress || 50}%</div>
                                </div>
                                <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-200 dark:bg-slate-700">
                                    <div style={{ width: `${shipment.progress || 50}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
