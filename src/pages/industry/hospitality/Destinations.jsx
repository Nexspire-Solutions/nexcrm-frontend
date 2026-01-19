import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

export default function Destinations() {
    const [destinations, setDestinations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDest, setEditingDest] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDestinations();
    }, [searchTerm]);

    const fetchDestinations = async () => {
        try {
            const params = searchTerm ? `?search=${searchTerm}` : '';
            const response = await apiClient.get(`/destinations${params}`);
            setDestinations(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch destinations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingDest) {
                await apiClient.put(`/destinations/${editingDest.id}`, formData);
                toast.success('Destination updated');
            } else {
                await apiClient.post('/destinations', formData);
                toast.success('Destination created');
            }
            setShowModal(false);
            setEditingDest(null);
            fetchDestinations();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deactivate this destination?')) return;
        try {
            await apiClient.delete(`/destinations/${id}`);
            toast.success('Destination deactivated');
            fetchDestinations();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to deactivate');
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Destinations</h1>
                    <p className="text-slate-500">Manage travel destinations</p>
                </div>
                <button
                    onClick={() => { setEditingDest(null); setShowModal(true); }}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Destination
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-72 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                />
            </div>

            {destinations.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500">No destinations found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {destinations.map((dest) => (
                        <div key={dest.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="aspect-video bg-slate-100 dark:bg-slate-700">
                                {dest.featured_image ? (
                                    <img src={dest.featured_image} alt={dest.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-slate-900 dark:text-white">{dest.name}</h3>
                                <p className="text-sm text-slate-500">{dest.city}, {dest.country}</p>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <span className="text-sm text-indigo-600">{dest.tour_count || 0} tours</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditingDest(dest); setShowModal(true); }} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(dest.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <DestinationModal
                    destination={editingDest}
                    onClose={() => { setShowModal(false); setEditingDest(null); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

function DestinationModal({ destination, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: destination?.name || '',
        country: destination?.country || '',
        state_region: destination?.state_region || '',
        city: destination?.city || '',
        description: destination?.description || '',
        short_description: destination?.short_description || '',
        best_time_to_visit: destination?.best_time_to_visit || '',
        is_featured: destination?.is_featured || false
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await onSave(formData); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {destination ? 'Edit Destination' : 'Add Destination'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Best Time to Visit</label>
                        <input type="text" name="best_time_to_visit" value={formData.best_time_to_visit} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" placeholder="Oct - Mar" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="rounded" />
                        <label className="text-sm text-slate-700 dark:text-slate-300">Featured Destination</label>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Saving...' : destination ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
