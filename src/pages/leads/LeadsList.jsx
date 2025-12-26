import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { leadsAPI } from '../../api';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import LeadsKanban from './LeadsKanban';
import { useDashboardRefresh } from '../../contexts/DashboardRefreshContext';



const statusConfig = {
    new: { label: 'New', class: 'badge-primary' },
    qualified: { label: 'Qualified', class: 'badge-success' },
    negotiation: { label: 'Negotiation', class: 'badge-warning' },
    won: { label: 'Won', class: 'bg-emerald-600 text-white badge' },
    lost: { label: 'Lost', class: 'badge-danger' }
};

export default function LeadsList() {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        contactName: '',
        company: '',
        email: '',
        phone: '',
        estimatedValue: '',
        leadSource: 'Website',
        status: 'new'
    });
    const location = useLocation();
    const navigate = useNavigate();
    const { triggerRefresh } = useDashboardRefresh();

    useEffect(() => {
        if (location.state?.openModal) {
            resetForm();
            setEditingLead(null);
            setShowModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const resetForm = () => {
        setFormData({
            contactName: '',
            company: '',
            email: '',
            phone: '',
            estimatedValue: '',
            leadSource: 'Website',
            status: 'new'
        });
    };

    const handleSubmit = async () => {
        if (!formData.contactName.trim()) {
            toast.error('Contact name is required');
            return;
        }
        setSaving(true);
        try {
            if (editingLead) {
                // Update existing lead
                await leadsAPI.update(editingLead.id, formData);
                toast.success('Lead updated successfully');
            } else {
                // Create new lead
                await leadsAPI.create(formData);
                toast.success('Lead created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchLeads(); // Refresh the list
            triggerRefresh('leads'); // Notify dashboard to update
        } catch (error) {
            console.error('Failed to save lead:', error);
            toast.error(error.response?.data?.error || 'Failed to save lead');
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setEditingLead(null);
        setShowModal(true);
    };

    const openEditModal = (lead) => {
        setFormData({
            contactName: lead.contactName || '',
            company: lead.company || '',
            email: lead.email || '',
            phone: lead.phone || '',
            estimatedValue: lead.estimatedValue || '',
            leadSource: lead.leadSource || 'Website',
            status: lead.status || 'new'
        });
        setEditingLead(lead);
        setShowModal(true);
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await leadsAPI.getAll();
            setLeads(response.leads || []);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            setLeads([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = `${lead.contactName} ${lead.company} ${lead.email}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        won: leads.filter(l => l.status === 'won').length,
        totalValue: leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
    };

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId) {
            try {
                await leadsAPI.delete(deleteTargetId);
                setLeads(prev => prev.filter(l => l.id !== deleteTargetId));
                toast.success('Lead deleted successfully');
                triggerRefresh('leads'); // Notify dashboard
            } catch (error) {
                setLeads(prev => prev.filter(l => l.id !== deleteTargetId));
                toast.success('Lead deleted');
            }
            setDeleteTargetId(null);
        }
    };

    const handleUpdateStatus = async (leadId, newStatus) => {
        try {
            await leadsAPI.update(leadId, { status: newStatus });
            setLeads(prev => prev.map(l =>
                l.id === leadId ? { ...l, status: newStatus } : l
            ));
        } catch (error) {
            setLeads(prev => prev.map(l =>
                l.id === leadId ? { ...l, status: newStatus } : l
            ));
        }
    };

    const handleViewLead = (lead) => {
        navigate(`/leads/${lead.id}`);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (score >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400';
        return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400';
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6  rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">All Leads</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Manage and track your sales pipeline
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            title="List View"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            title="Kanban View"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                        </button>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Add Lead</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Leads</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.new}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">New Leads</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.qualified}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Qualified</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.won}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Won</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{(stats.totalValue / 1000).toFixed(0)}K</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Pipeline Value</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, company, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-full sm:w-48"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="qualified">Qualified</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                    </select>
                </div>
            </div>

            {/* Views */}
            {viewMode === 'kanban' ? (
                <LeadsKanban
                    leads={filteredLeads}
                    onUpdateStatus={handleUpdateStatus}
                    onViewLead={handleViewLead}
                />
            ) : (
                /* Table View */
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                                    {lead.contactName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{lead.contactName}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{lead.company}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{lead.leadSource}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">₹{(lead.estimatedValue || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${getScoreColor(lead.score)}`}>
                                                {lead.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={statusConfig[lead.status]?.class || 'badge-gray'}>
                                                {statusConfig[lead.status]?.label || lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/leads/${lead.id}`} className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                                                    View
                                                </Link>
                                                <button onClick={() => openEditModal(lead)} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(lead.id)} className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredLeads.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No leads found</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingLead ? 'Edit Lead' : 'Add New Lead'}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>Cancel</button>
                        <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (editingLead ? 'Update' : 'Create')}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Contact Name *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.contactName}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                            placeholder="Enter contact name"
                        />
                    </div>
                    <div>
                        <label className="label">Company</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.company}
                            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            placeholder="Enter company name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input
                                type="tel"
                                className="input"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+91 XXXXX XXXXX"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Estimated Value</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.estimatedValue}
                                onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                                placeholder="50000"
                            />
                        </div>
                        <div>
                            <label className="label">Lead Source</label>
                            <select
                                className="select"
                                value={formData.leadSource}
                                onChange={(e) => setFormData(prev => ({ ...prev, leadSource: e.target.value }))}
                            >
                                <option value="Website">Website</option>
                                <option value="Referral">Referral</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Cold Call">Cold Call</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select
                            className="select"
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="proposal">Proposal</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Lead"
                message="Are you sure you want to delete this lead? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
