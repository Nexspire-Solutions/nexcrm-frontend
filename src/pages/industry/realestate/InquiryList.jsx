/**
 * Property Inquiries / Leads Management
 * Comprehensive lead management for real estate
 */

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus, FiPhone, FiMail, FiCalendar, FiUser, FiHome, FiMoreVertical, FiX, FiChevronDown } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const InquiryList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [inquiries, setInquiries] = useState([]);
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        priority: '',
        source: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        source: 'website',
        priority: 'warm',
        budget_min: '',
        budget_max: '',
        property_type_interest: [],
        bedrooms_interest: [],
        timeline: 'within_3_months',
        financing: 'undecided'
    });

    useEffect(() => {
        fetchInquiries();
        fetchStats();
    }, [pagination.page, filters]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            });
            const response = await apiClient.get(`/property-inquiries?${params}`);
            setInquiries(response.data.data || []);
            setPagination(prev => ({ ...prev, ...response.data.pagination }));
        } catch (error) {
            toast.error('Failed to fetch inquiries');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/property-inquiries/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/property-inquiries', formData);
            toast.success('Inquiry created successfully');
            setShowModal(false);
            setFormData({
                name: '', email: '', phone: '', message: '', source: 'website',
                priority: 'warm', budget_min: '', budget_max: '',
                property_type_interest: [], bedrooms_interest: [],
                timeline: 'within_3_months', financing: 'undecided'
            });
            fetchInquiries();
            fetchStats();
        } catch (error) {
            toast.error('Failed to create inquiry');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await apiClient.patch(`/property-inquiries/${id}/status`, { status });
            toast.success('Status updated');
            fetchInquiries();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'hot': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'warm': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'cold': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'new': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'contacted': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
            'qualified': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            'site_visit_scheduled': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            'site_visit_done': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
            'negotiation': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            'booked': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            'lost': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'not_interested': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const statuses = ['new', 'contacted', 'qualified', 'site_visit_scheduled', 'site_visit_done', 'negotiation', 'booked', 'lost', 'not_interested'];
    const sources = ['website', '99acres', 'magicbricks', 'housing', 'referral', 'walk_in', 'call', 'whatsapp', 'facebook', 'google'];
    const priorities = ['hot', 'warm', 'cold'];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Property Inquiries</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage and track your leads</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <FiPlus className="w-4 h-4" /> Add Inquiry
                </button>
            </div>

            {/* Stats Pills */}
            {stats && (
                <div className="flex flex-wrap gap-3">
                    {stats.by_status?.map((stat) => (
                        <button
                            key={stat.status}
                            onClick={() => setFilters(prev => ({ ...prev, status: stat.status === filters.status ? '' : stat.status }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.status === stat.status
                                ? 'bg-indigo-600 text-white'
                                : getStatusColor(stat.status)
                                }`}
                        >
                            {stat.status?.replace(/_/g, ' ')} ({stat.count})
                        </button>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-64">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="input pl-10"
                        />
                    </div>

                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        className="select w-auto"
                    >
                        <option value="">All Priorities</option>
                        {priorities.map(p => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                    </select>

                    <select
                        value={filters.source}
                        onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                        className="select w-auto"
                    >
                        <option value="">All Sources</option>
                        {sources.map(s => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                    </select>

                    {(filters.search || filters.status || filters.priority || filters.source) && (
                        <button
                            onClick={() => setFilters({ search: '', status: '', priority: '', source: '' })}
                            className="btn-ghost text-red-600"
                        >
                            <FiX className="w-4 h-4" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Contact</th>
                                <th>Property Interest</th>
                                <th>Source</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8">
                                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : inquiries.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-slate-500">
                                        No inquiries found
                                    </td>
                                </tr>
                            ) : (
                                inquiries.map((inquiry) => (
                                    <tr key={inquiry.id} className="cursor-pointer" onClick={() => navigate(`/property-inquiries/${inquiry.id}`)}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                    {inquiry.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{inquiry.name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <FiPhone className="w-3 h-3" /> {inquiry.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {inquiry.property_title ? (
                                                <div className="flex items-center gap-2">
                                                    <FiHome className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm">{inquiry.property_title}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-500">{inquiry.preferred_locations || 'General'}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-sm capitalize">{inquiry.source?.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(inquiry.priority)}`}>
                                                {inquiry.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <select
                                                value={inquiry.status}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateStatus(inquiry.id, e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(inquiry.status)}`}
                                            >
                                                {statuses.map(s => (
                                                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <span className="text-sm text-slate-500">
                                                {new Date(inquiry.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a href={`tel:${inquiry.phone}`} onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                                    <FiPhone className="w-4 h-4 text-emerald-600" />
                                                </a>
                                                {inquiry.email && (
                                                    <a href={`mailto:${inquiry.email}`} onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                                        <FiMail className="w-4 h-4 text-blue-600" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="btn-secondary btn-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="btn-secondary btn-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Inquiry Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add New Inquiry</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Phone *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label">Source</label>
                                    <select
                                        value={formData.source}
                                        onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                                        className="select"
                                    >
                                        {sources.map(s => (
                                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                        className="select"
                                    >
                                        {priorities.map(p => (
                                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Timeline</label>
                                    <select
                                        value={formData.timeline}
                                        onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                                        className="select"
                                    >
                                        <option value="immediate">Immediate</option>
                                        <option value="within_1_month">Within 1 Month</option>
                                        <option value="within_3_months">Within 3 Months</option>
                                        <option value="within_6_months">Within 6 Months</option>
                                        <option value="within_1_year">Within 1 Year</option>
                                        <option value="just_exploring">Just Exploring</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Min Budget</label>
                                    <input
                                        type="number"
                                        value={formData.budget_min}
                                        onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
                                        className="input"
                                        placeholder="e.g., 5000000"
                                    />
                                </div>
                                <div>
                                    <label className="label">Max Budget</label>
                                    <input
                                        type="number"
                                        value={formData.budget_max}
                                        onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value }))}
                                        className="input"
                                        placeholder="e.g., 10000000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Message / Notes</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                    className="input"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Inquiry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InquiryList;
