import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';

export default function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [guests, setGuests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [editingRes, setEditingRes] = useState(null);
    const [formData, setFormData] = useState({
        guestId: '',
        roomId: '',
        check_in_date: '',
        check_out_date: '',
        adults: 1,
        children: 0,
        total_amount: '',
        special_requests: ''
    });
    const [newGuest, setNewGuest] = useState({
        name: '',
        email: '',
        phone: '',
        id_type: 'aadhar',
        id_number: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resResponse, roomsResponse, guestsResponse] = await Promise.all([
                apiClient.get('/reservations').catch(() => ({ data: { data: [] } })),
                apiClient.get('/rooms').catch(() => ({ data: { data: [] } })),
                apiClient.get('/guests').catch(() => apiClient.get('/clients').catch(() => ({ data: { data: [] } })))
            ]);
            setReservations(resResponse.data?.data || []);
            setRooms(roomsResponse.data?.data || []);
            setGuests(guestsResponse.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (res = null) => {
        if (res) {
            setEditingRes(res);
            setFormData({
                guestId: res.guestId || '',
                roomId: res.roomId || '',
                check_in_date: res.check_in_date?.split('T')[0] || '',
                check_out_date: res.check_out_date?.split('T')[0] || '',
                adults: res.adults || 1,
                children: res.children || 0,
                total_amount: res.total_amount || '',
                special_requests: res.special_requests || ''
            });
        } else {
            setEditingRes(null);
            setFormData({
                guestId: '',
                roomId: '',
                check_in_date: '',
                check_out_date: '',
                adults: 1,
                children: 0,
                total_amount: '',
                special_requests: ''
            });
        }
        setShowGuestForm(false);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRes(null);
        setShowGuestForm(false);
    };

    const createGuest = async () => {
        if (!newGuest.name) {
            alert('Guest name is required');
            return null;
        }
        try {
            const response = await apiClient.post('/guests', newGuest);
            const createdGuest = response.data?.data;
            setGuests([...guests, createdGuest]);
            setNewGuest({ name: '', email: '', phone: '', id_type: 'aadhar', id_number: '' });
            setShowGuestForm(false);
            return createdGuest.id;
        } catch (error) {
            console.error('Failed to create guest:', error);
            alert(error.response?.data?.error || 'Failed to create guest');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let guestId = formData.guestId;

            // If creating new guest, do that first
            if (showGuestForm && newGuest.name) {
                guestId = await createGuest();
                if (!guestId) return; // Guest creation failed
            }

            const payload = { ...formData, guestId };

            if (editingRes) {
                await apiClient.put(`/reservations/${editingRes.id}`, payload);
            } else {
                await apiClient.post('/reservations', payload);
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Failed to save reservation:', error);
            alert(error.response?.data?.error || 'Failed to save reservation');
        }
    };

    const handleCheckIn = async (id) => {
        try {
            await apiClient.post(`/reservations/${id}/check-in`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to check in');
        }
    };

    const handleCheckOut = async (id) => {
        try {
            await apiClient.post(`/reservations/${id}/check-out`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to check out');
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;
        try {
            await apiClient.post(`/reservations/${id}/cancel`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to cancel reservation');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            checked_in: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            checked_out: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return styles[status] || styles.pending;
    };

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded mb-4 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <nav className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span>Hospitality</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Reservations</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reservations</h1>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Reservation
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {reservations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No reservations found</h3>
                        <button onClick={() => handleOpenModal()} className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Create your first reservation
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Guest</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Room</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Check-in</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Check-out</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {reservations.map((res) => (
                                    <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                                            {res.guest_name || `Guest #${res.guestId || 'N/A'}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {res.room_name || res.room_number || `Room #${res.roomId || 'Unassigned'}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {res.check_in_date?.split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {res.check_out_date?.split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(res.status)}`}>
                                                {res.status?.replace('_', ' ') || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                            ₹{(res.total_amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                {res.status === 'confirmed' && (
                                                    <button onClick={() => handleCheckIn(res.id)} className="text-green-600 hover:text-green-700 font-medium">Check In</button>
                                                )}
                                                {res.status === 'checked_in' && (
                                                    <button onClick={() => handleCheckOut(res.id)} className="text-blue-600 hover:text-blue-700 font-medium">Check Out</button>
                                                )}
                                                {(res.status === 'pending' || res.status === 'confirmed') && (
                                                    <button onClick={() => handleCancel(res.id)} className="text-red-600 hover:text-red-700 font-medium">Cancel</button>
                                                )}
                                                <button onClick={() => handleOpenModal(res)} className="text-indigo-600 hover:text-indigo-700 font-medium">Edit</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reservation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingRes ? 'Edit Reservation' : 'New Reservation'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Guest Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Guest</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowGuestForm(!showGuestForm)}
                                        className="text-sm text-indigo-600 hover:text-indigo-700"
                                    >
                                        {showGuestForm ? 'Select Existing' : '+ Add New Guest'}
                                    </button>
                                </div>

                                {!showGuestForm ? (
                                    <select
                                        value={formData.guestId}
                                        onChange={e => setFormData({ ...formData, guestId: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    >
                                        <option value="">Select Guest</option>
                                        {guests.map(g => (
                                            <option key={g.id} value={g.id}>{g.name || g.first_name} {g.last_name || ''} {g.phone ? `(${g.phone})` : ''}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name *</label>
                                                <input
                                                    type="text"
                                                    value={newGuest.name}
                                                    onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                                    placeholder="John Doe"
                                                    required={showGuestForm}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={newGuest.phone}
                                                    onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    value={newGuest.email}
                                                    onChange={e => setNewGuest({ ...newGuest, email: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                                    placeholder="guest@email.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">ID Number</label>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={newGuest.id_type}
                                                        onChange={e => setNewGuest({ ...newGuest, id_type: e.target.value })}
                                                        className="w-24 px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                                    >
                                                        <option value="aadhar">Aadhar</option>
                                                        <option value="passport">Passport</option>
                                                        <option value="driving">DL</option>
                                                        <option value="voter">Voter ID</option>
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={newGuest.id_number}
                                                        onChange={e => setNewGuest({ ...newGuest, id_number: e.target.value })}
                                                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                                        placeholder="ID Number"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Room Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room</label>
                                <select
                                    value={formData.roomId}
                                    onChange={e => setFormData({ ...formData, roomId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select Room</option>
                                    {rooms.filter(r => r.status === 'available' || r.id == formData.roomId).map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.room_number || r.name || `Room ${r.id}`} - {r.roomType || 'Standard'} (₹{r.price || 0}/night)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Check-in Date</label>
                                    <input
                                        type="date"
                                        value={formData.check_in_date}
                                        onChange={e => setFormData({ ...formData, check_in_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Check-out Date</label>
                                    <input
                                        type="date"
                                        value={formData.check_out_date}
                                        onChange={e => setFormData({ ...formData, check_out_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Guest count and amount */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adults</label>
                                    <input
                                        type="number"
                                        value={formData.adults}
                                        onChange={e => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Children</label>
                                    <input
                                        type="number"
                                        value={formData.children}
                                        onChange={e => setFormData({ ...formData, children: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.total_amount}
                                        onChange={e => setFormData({ ...formData, total_amount: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Special Requests */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Special Requests</label>
                                <textarea
                                    value={formData.special_requests}
                                    onChange={e => setFormData({ ...formData, special_requests: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    rows="2"
                                    placeholder="Any special requests or notes..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                                    {editingRes ? 'Update Reservation' : 'Create Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
