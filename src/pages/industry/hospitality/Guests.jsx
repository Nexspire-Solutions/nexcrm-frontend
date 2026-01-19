import { useState, useEffect } from 'react';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

export default function Guests() {
    const [guests, setGuests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGuests();
    }, [searchTerm]);

    const fetchGuests = async () => {
        try {
            const params = searchTerm ? `?search=${searchTerm}` : '';
            const response = await apiClient.get(`/clients${params}`);
            setGuests(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch guests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guests</h1>
                <p className="text-slate-500">Manage hotel guests and tour travelers</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                    type="text"
                    placeholder="Search guests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-72 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {guests.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No guests found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {guests.map((guest) => (
                                <tr key={guest.id}>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{guest.name}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{guest.email}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{guest.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                                            {guest.customer_type || 'Guest'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${guest.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {guest.status || 'active'}
                                        </span>
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
