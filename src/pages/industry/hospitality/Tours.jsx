import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

export default function Tours() {
    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const [destinations, setDestinations] = useState([]);
    const [filters, setFilters] = useState({ status: '', tour_type: '' });

    useEffect(() => {
        fetchTours();
        fetchDestinations();
    }, [filters]);

    const fetchTours = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.tour_type) params.append('tour_type', filters.tour_type);

            const response = await apiClient.get(`/tours?${params}`);
            setTours(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch tours:', error);
            toast.error('Failed to load tours');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDestinations = async () => {
        try {
            const response = await apiClient.get('/destinations');
            setDestinations(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch destinations:', error);
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingTour) {
                await apiClient.put(`/tours/${editingTour.id}`, formData);
                toast.success('Tour updated successfully');
            } else {
                await apiClient.post('/tours', formData);
                toast.success('Tour created successfully');
            }
            setShowModal(false);
            setEditingTour(null);
            fetchTours();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save tour');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to archive this tour?')) return;
        try {
            await apiClient.delete(`/tours/${id}`);
            toast.success('Tour archived');
            fetchTours();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to archive tour');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await apiClient.patch(`/tours/${id}/status`, { status });
            toast.success(`Tour ${status}`);
            fetchTours();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
            published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        return styles[status] || styles.draft;
    };

    const getTourTypeBadge = (type) => {
        const colors = {
            group: 'bg-blue-100 text-blue-700',
            private: 'bg-purple-100 text-purple-700',
            adventure: 'bg-orange-100 text-orange-700',
            cultural: 'bg-amber-100 text-amber-700',
            honeymoon: 'bg-pink-100 text-pink-700',
            family: 'bg-cyan-100 text-cyan-700'
        };
        return colors[type] || 'bg-slate-100 text-slate-700';
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <nav className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="/hospitality-dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Tours</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tour Packages</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your tour packages and itineraries</p>
                </div>
                <button
                    onClick={() => { setEditingTour(null); setShowModal(true); }}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Tour
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                </select>
                <select
                    value={filters.tour_type}
                    onChange={(e) => setFilters({ ...filters, tour_type: e.target.value })}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                    <option value="">All Types</option>
                    <option value="group">Group</option>
                    <option value="private">Private</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                    <option value="honeymoon">Honeymoon</option>
                    <option value="family">Family</option>
                </select>
            </div>

            {/* Tours Grid */}
            {tours.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tours found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Create your first tour package to start selling</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Create Tour
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tours.map((tour) => (
                        <div
                            key={tour.id}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Image */}
                            <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative">
                                {tour.featured_image ? (
                                    <img
                                        src={tour.featured_image}
                                        alt={tour.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(tour.status)}`}>
                                        {tour.status}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{tour.name}</h3>
                                        {tour.destination_name && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{tour.destination_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTourTypeBadge(tour.tour_type)}`}>
                                        {tour.tour_type}
                                    </span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        {tour.duration_days}D/{tour.duration_nights}N
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <div>
                                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                            Rs. {parseFloat(tour.price).toLocaleString()}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400"> /{tour.price_type?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setEditingTour(tour); setShowModal(true); }}
                                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        {tour.status === 'draft' && (
                                            <button
                                                onClick={() => handleStatusChange(tour.id, 'published')}
                                                className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"
                                                title="Publish"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(tour.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                            title="Archive"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tour Modal */}
            {showModal && (
                <TourModal
                    tour={editingTour}
                    destinations={destinations}
                    onClose={() => { setShowModal(false); setEditingTour(null); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

// Tour Modal Component
function TourModal({ tour, destinations, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: tour?.name || '',
        tour_code: tour?.tour_code || '',
        destination_id: tour?.destination_id || '',
        tour_type: tour?.tour_type || 'group',
        duration_days: tour?.duration_days || 3,
        duration_nights: tour?.duration_nights || 2,
        price: tour?.price || '',
        compare_price: tour?.compare_price || '',
        price_type: tour?.price_type || 'per_person',
        min_group_size: tour?.min_group_size || 1,
        max_group_size: tour?.max_group_size || 50,
        difficulty_level: tour?.difficulty_level || 'easy',
        description: tour?.description || '',
        short_description: tour?.short_description || '',
        status: tour?.status || 'draft'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {tour ? 'Edit Tour' : 'Create New Tour'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Tour Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                placeholder="Amazing Kerala Tour"
                            />
                        </div>

                        {/* Tour Code */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Tour Code
                            </label>
                            <input
                                type="text"
                                name="tour_code"
                                value={formData.tour_code}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                placeholder="KRL-001"
                            />
                        </div>

                        {/* Destination */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Destination
                            </label>
                            <select
                                name="destination_id"
                                value={formData.destination_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="">Select Destination</option>
                                {destinations.map(dest => (
                                    <option key={dest.id} value={dest.id}>{dest.name}, {dest.country}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tour Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Tour Type *
                            </label>
                            <select
                                name="tour_type"
                                value={formData.tour_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="group">Group Tour</option>
                                <option value="private">Private Tour</option>
                                <option value="adventure">Adventure</option>
                                <option value="cultural">Cultural</option>
                                <option value="religious">Religious</option>
                                <option value="honeymoon">Honeymoon</option>
                                <option value="family">Family</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Duration (Days/Nights) *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="duration_days"
                                    value={formData.duration_days}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="Days"
                                />
                                <input
                                    type="number"
                                    name="duration_nights"
                                    value={formData.duration_nights}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="Nights"
                                />
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Price (Rs.) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                step="0.01"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                placeholder="15000"
                            />
                        </div>

                        {/* Price Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Price Type
                            </label>
                            <select
                                name="price_type"
                                value={formData.price_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="per_person">Per Person</option>
                                <option value="per_couple">Per Couple</option>
                                <option value="per_group">Per Group</option>
                            </select>
                        </div>

                        {/* Group Size */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Group Size (Min - Max)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="min_group_size"
                                    value={formData.min_group_size}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                                <input
                                    type="number"
                                    name="max_group_size"
                                    value={formData.max_group_size}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Short Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Short Description
                            </label>
                            <textarea
                                name="short_description"
                                value={formData.short_description}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                placeholder="Brief description for listings..."
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Full Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                placeholder="Detailed tour description..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {tour ? 'Update Tour' : 'Create Tour'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
