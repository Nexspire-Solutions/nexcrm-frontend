import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';

const mockRooms = [
    { id: '101', type: 'Deluxe Suite', status: 'available', price: '$250/night', capacity: 2, amenities: 'WiFi, AC, TV' },
    { id: '102', type: 'Standard Room', status: 'occupied', price: '$150/night', capacity: 2, amenities: 'WiFi, AC' },
    { id: '201', type: 'Presidential Suite', status: 'available', price: '$500/night', capacity: 4, amenities: 'WiFi, AC, TV, Mini Bar' },
    { id: '202', type: 'Standard Room', status: 'maintenance', price: '$150/night', capacity: 2, amenities: 'WiFi, AC' },
    { id: '301', type: 'Deluxe Room', status: 'occupied', price: '$200/night', capacity: 2, amenities: 'WiFi, AC, TV' },
];

export default function Rooms() {
    const [rooms] = useState(mockRooms);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Rooms"
                subtitle="Manage your hotel room inventory"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Hospitality' }, { label: 'Rooms' }]}
                actions={<button className="btn-primary">Add Room</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rooms.map(room => (
                    <ProCard key={room.id} className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-2xl text-slate-900 dark:text-white">Room {room.id}</h3>
                                <p className="text-sm text-slate-500 mt-1">{room.type}</p>
                            </div>
                            <StatusBadge
                                status={room.status}
                                variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'error' : 'warning'}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-700">
                                <span className="text-sm text-slate-500">Price</span>
                                <span className="font-bold text-indigo-600">{room.price}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Capacity</span>
                                <span className="font-medium text-slate-900 dark:text-white">{room.capacity} guests</span>
                            </div>
                            <div className="pt-2">
                                <span className="text-xs text-slate-500">Amenities:</span>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{room.amenities}</p>
                            </div>
                        </div>

                        <button className="mt-4 w-full btn-secondary text-sm">
                            {room.status === 'available' ? 'Book Room' : 'View Details'}
                        </button>
                    </ProCard>
                ))}
            </div>
        </div>
    );
}
