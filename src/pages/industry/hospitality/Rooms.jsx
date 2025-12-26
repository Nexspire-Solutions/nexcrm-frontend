import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await apiClient.get('/rooms');
            setRooms(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Rooms"
                subtitle="Manage hotel rooms and availability"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Hospitality' }, { label: 'Rooms' }]}
                actions={<button className="btn-primary">Add Room</button>}
            />

            {rooms.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No rooms found</p>
                        <p className="text-sm text-slate-400 mt-1">Add your first room to get started</p>
                    </div>
                </ProCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <ProCard key={room.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                                    <span className="text-xl font-bold text-indigo-600">{room.number || '#'}</span>
                                </div>
                                <StatusBadge
                                    status={room.status || 'available'}
                                    variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'error' : 'warning'}
                                />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{room.type || 'Standard Room'}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Floor {room.floor || 1}</p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <span className="text-sm text-slate-500">{room.capacity || 2} Guests</span>
                                <span className="font-bold text-indigo-600">₹{(room.price || 0).toLocaleString()}/night</span>
                            </div>
                        </ProCard>
                    ))}
                </div>
            )}
        </div>
    );
}
