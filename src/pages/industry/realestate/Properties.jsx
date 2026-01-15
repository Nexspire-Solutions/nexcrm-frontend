/**
 * Properties List - Real Estate Module
 * Enhanced property listing with filters, views, and actions
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiGrid, FiList, FiMoreVertical, FiEdit, FiTrash2, FiEye, FiMapPin, FiHome, FiStar, FiTrendingUp } from 'react-icons/fi';
import apiClient from '../../../utils/apiClient';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';

export default function Properties() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [stats, setStats] = useState({ total: 0, available: 0, sold: 0, rented: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        propertyType: '',
        priceType: '',
        city: ''
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0 });

    useEffect(() => {
        fetchProperties();
        fetchStats();
    }, [filters, pagination.page]);

    const fetchProperties = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            params.append('page', pagination.page);
            params.append('limit', pagination.limit);
            if (searchTerm) params.append('search', searchTerm);
            if (filters.status) params.append('status', filters.status);
            if (filters.propertyType) params.append('property_type', filters.propertyType);
            if (filters.priceType) params.append('price_type', filters.priceType);
            if (filters.city) params.append('city', filters.city);

            const response = await apiClient.get(`/properties?${params.toString()}`);
            setProperties(response.data.data || []);
            if (response.data.pagination) {
                setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
            }
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            setProperties([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/properties/stats');
            setStats(response.data.data || { total: 0, available: 0, sold: 0, rented: 0 });
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;
        try {
            await apiClient.delete(`/properties/${id}`);
            toast.success('Property deleted');
            fetchProperties();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete property');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProperties();
    };

    const formatPrice = (price) => {
        if (!price) return 'Price on Request';
        if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
        if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
        return `₹${price.toLocaleString()}`;
    };

    const statusColors = {
        available: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        sold: 'bg-blue-100 text-blue-700',
        rented: 'bg-purple-100 text-purple-700',
        draft: 'bg-slate-100 text-slate-700'
    };

    const propertyTypes = [
        { value: '', label: 'All Types' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'house', label: 'House' },
        { value: 'villa', label: 'Villa' },
        { value: 'plot', label: 'Plot' },
        { value: 'commercial', label: 'Commercial' }
    ];

    if (isLoading && properties.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Properties"
                subtitle="Manage your real estate inventory"
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Real Estate' },
                    { label: 'Properties' }
                ]}
                actions={
                    <Link to="/properties/new" className="btn-primary flex items-center gap-2">
                        <FiPlus className="w-4 h-4" /> Add Property
                    </Link>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <FiHome className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-sm text-slate-500">Total Properties</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FiStar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.available}</p>
                            <p className="text-sm text-slate-500">Available</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FiTrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.sold}</p>
                            <p className="text-sm text-slate-500">Sold</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <FiHome className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.rented}</p>
                            <p className="text-sm text-slate-500">Rented</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by title, location..."
                            className="input pl-10 w-full"
                        />
                    </form>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-indigo-50 text-indigo-600' : ''}`}
                        >
                            <FiFilter className="w-4 h-4" /> Filters
                        </button>
                        <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800'}`}
                            >
                                <FiGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800'}`}
                            >
                                <FiList className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="select"
                        >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                            <option value="rented">Rented</option>
                            <option value="draft">Draft</option>
                        </select>
                        <select
                            value={filters.propertyType}
                            onChange={(e) => setFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                            className="select"
                        >
                            {propertyTypes.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.priceType}
                            onChange={(e) => setFilters(prev => ({ ...prev, priceType: e.target.value }))}
                            className="select"
                        >
                            <option value="">All Listings</option>
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                            <option value="lease">For Lease</option>
                        </select>
                        <button
                            onClick={() => setFilters({ status: '', propertyType: '', priceType: '', city: '' })}
                            className="text-indigo-600 hover:underline text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Properties */}
            {properties.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiHome className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No properties found</p>
                    <p className="text-sm text-slate-400 mt-1">Add your first property to get started</p>
                    <Link to="/properties/new" className="btn-primary mt-4 inline-flex items-center gap-2">
                        <FiPlus className="w-4 h-4" /> Add Property
                    </Link>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {properties.map(property => (
                        <div key={property.id} className="card overflow-hidden group">
                            <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-700">
                                {property.images && JSON.parse(property.images || '[]')[0] ? (
                                    <img
                                        src={JSON.parse(property.images)[0]}
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FiHome className="w-12 h-12 text-slate-300" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status] || statusColors.draft}`}>
                                        {property.status}
                                    </span>
                                    {property.featured && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                            Featured
                                        </span>
                                    )}
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-1">
                                        <Link
                                            to={`/properties/${property.id}`}
                                            className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50"
                                        >
                                            <FiEye className="w-4 h-4 text-slate-600" />
                                        </Link>
                                        <Link
                                            to={`/properties/${property.id}/edit`}
                                            className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50"
                                        >
                                            <FiEdit className="w-4 h-4 text-slate-600" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                    {formatPrice(property.price)}
                                    {property.priceType === 'rent' && <span className="text-sm font-normal text-slate-500">/mo</span>}
                                </h3>
                                <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{property.title}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                    <FiMapPin className="w-4 h-4" />
                                    {property.locality || property.city || property.address}
                                </p>
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <span className="text-indigo-600">{property.bedrooms || 0}</span> Beds
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="text-indigo-600">{property.bathrooms || 0}</span> Baths
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="text-indigo-600">{property.area || 0}</span> sqft
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Property</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Location</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Price</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Details</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {properties.map(property => (
                                <tr key={property.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                                {property.images && JSON.parse(property.images || '[]')[0] ? (
                                                    <img
                                                        src={JSON.parse(property.images)[0]}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FiHome className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{property.title}</p>
                                                <p className="text-sm text-slate-500 capitalize">{property.propertyType}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-slate-600 dark:text-slate-400">{property.locality || property.city}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(property.price)}</p>
                                        <p className="text-xs text-slate-500 capitalize">{property.priceType}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status] || statusColors.draft}`}>
                                            {property.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {property.bedrooms} Beds / {property.bathrooms} Baths / {property.area} sqft
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link
                                                to={`/properties/${property.id}`}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                            >
                                                <FiEye className="w-4 h-4 text-slate-600" />
                                            </Link>
                                            <Link
                                                to={`/properties/${property.id}/edit`}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                            >
                                                <FiEdit className="w-4 h-4 text-slate-600" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(property.id)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <FiTrash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-slate-600">
                        Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
