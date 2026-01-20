import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

const ROOM_TYPES = [
    { id: 'standard', name: 'Standard' },
    { id: 'deluxe', name: 'Deluxe' },
    { id: 'suite', name: 'Suite' },
    { id: 'family', name: 'Family' },
    { id: 'presidential', name: 'Presidential' },
    { id: 'penthouse', name: 'Penthouse' }
];

export default function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        room_number: '',
        roomType: 'standard',
        price: '',
        capacity: 2,
        floor: 1,
        bed_type: '',
        description: '',
        status: 'available'
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await apiClient.get('/rooms');
            setRooms(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                // Handle different possible field names
                name: room.name || room.room_name || '',
                room_number: room.room_number || room.roomNumber || '',
                roomType: room.roomType || room.room_type || room.type || 'standard',
                price: room.price || room.base_price || room.rate || room.price_per_night || '',
                capacity: room.capacity || room.max_guests || 2,
                floor: room.floor || room.floor_number || 1,
                bed_type: room.bed_type || room.bedType || '',
                description: room.description || room.notes || '',
                status: room.status || 'available'
            });
        } else {

            setEditingRoom(null);
            setFormData({
                name: '',
                room_number: '',
                roomType: 'standard',
                price: '',
                capacity: 2,
                floor: 1,
                bed_type: '',
                description: '',
                status: 'available'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRoom(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await apiClient.put(`/rooms/${editingRoom.id}`, formData);
            } else {
                await apiClient.post('/rooms', formData);
            }
            handleCloseModal();
            fetchRooms();
        } catch (error) {
            console.error('Failed to save room:', error);
            alert('Failed to save room. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this room?')) return;
        try {
            await apiClient.delete(`/rooms/${id}`);
            fetchRooms();
        } catch (error) {
            console.error('Failed to delete room:', error);
            alert(error.response?.data?.error || 'Failed to delete room');
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
                actions={
                    <button onClick={() => handleOpenModal()} className="btn-primary">
                        Add Room
                    </button>
                }
            />

            {rooms.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No rooms found</p>
                        <button onClick={() => handleOpenModal()} className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
                            Add your first room
                        </button>
                    </div>
                </ProCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map(room => (
                        <ProCard key={room.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleOpenModal(room)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                                    <span className="text-xl font-bold text-indigo-600">{room.room_number || room.roomNumber || '#'}</span>
                                </div>
                                <StatusBadge
                                    status={room.status || 'available'}
                                    variant={room.status === 'available' ? 'success' : room.status === 'occupied' ? 'error' : 'warning'}
                                />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{room.name || room.room_name || room.roomType || room.room_type || 'Room'}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {ROOM_TYPES.find(t => t.id === (room.roomType || room.room_type))?.name || room.roomType || room.room_type || 'Standard'} - Floor {room.floor || room.floor_number || 1}
                            </p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <span className="text-sm text-slate-500">{room.capacity || room.max_guests || 2} Guests</span>
                                <span className="font-bold text-indigo-600">₹{(room.price || room.base_price || room.rate || room.price_per_night || 0).toLocaleString()}/night</span>
                            </div>
                        </ProCard>

                    ))}
                </div>
            )}

            {/* Room Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingRoom ? 'Edit Room' : 'Add New Room'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Deluxe Ocean View"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
                                    <input
                                        type="text"
                                        value={formData.room_number}
                                        onChange={e => setFormData({ ...formData, room_number: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="101"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Type</label>
                                    <select
                                        value={formData.roomType}
                                        onChange={e => setFormData({ ...formData, roomType: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        {ROOM_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price per Night (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="5000"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Floor</label>
                                    <input
                                        type="number"
                                        value={formData.floor}
                                        onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="available">Available</option>
                                        <option value="occupied">Occupied</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="reserved">Reserved</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bed Type</label>
                                <input
                                    type="text"
                                    value={formData.bed_type}
                                    onChange={e => setFormData({ ...formData, bed_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="King Size, Twin, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    rows="3"
                                    placeholder="Room description and amenities..."
                                />
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                                {editingRoom && (
                                    <button
                                        type="button"
                                        onClick={() => { handleCloseModal(); handleDelete(editingRoom.id); }}
                                        className="text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Delete Room
                                    </button>
                                )}
                                <div className="flex gap-3 ml-auto">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        {editingRoom ? 'Update Room' : 'Add Room'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
