import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

export default function TourBookings() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '' });

    useEffect(() => {
        fetchBookings();
    }, [filters]);

    const fetchBookings = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            const response = await apiClient.get(`/tour-bookings?${params}`);
            setBookings(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await apiClient.patch(`/tour-bookings/${id}/status`, { status });
            toast.success(`Booking ${status}`);
            fetchBookings();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-purple-100 text-purple-700',
            completed: 'bg-emerald-100 text-emerald-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return styles[status] || styles.pending;
    };

    if (isLoading) {
        return <div className="animate-pulse h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tour Bookings</h1>
                    <p className="text-slate-500">Manage customer tour bookings</p>
                </div>
            </div>

            <div className="flex gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {bookings.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No bookings found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Booking</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tour</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Guest</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Departure</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="px-6 py-4 font-medium text-indigo-600">{booking.booking_code}</td>
                                    <td className="px-6 py-4 text-slate-900 dark:text-white">{booking.tour_name}</td>
                                    <td className="px-6 py-4">{booking.guest_name || 'N/A'}</td>
                                    <td className="px-6 py-4">{new Date(booking.departure_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">Rs. {parseFloat(booking.final_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                                            {booking.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {booking.status === 'pending' && (
                                            <button onClick={() => handleStatusChange(booking.id, 'confirmed')} className="text-blue-600 hover:underline text-sm">Confirm</button>
                                        )}
                                        {booking.status === 'confirmed' && (
                                            <button onClick={() => handleStatusChange(booking.id, 'in_progress')} className="text-purple-600 hover:underline text-sm">Start</button>
                                        )}
                                        {booking.status === 'in_progress' && (
                                            <button onClick={() => handleStatusChange(booking.id, 'completed')} className="text-emerald-600 hover:underline text-sm">Complete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
