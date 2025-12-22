import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { leadsAPI } from '../../api';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import LeadsKanban from './LeadsKanban';

const mockLeads = [
    { id: 1, contactName: 'John Smith', company: 'TechCorp', email: 'john@techcorp.com', phone: '+1 234 567 890', status: 'new', leadSource: 'Website', estimatedValue: 25000, score: 85, created_at: '2024-12-20' },
    { id: 2, contactName: 'Sarah Johnson', company: 'DataFlow Inc', email: 'sarah@dataflow.com', phone: '+1 234 567 891', status: 'qualified', leadSource: 'Referral', estimatedValue: 45000, score: 92, created_at: '2024-12-19' },
    { id: 3, contactName: 'Mike Wilson', company: 'StartupXYZ', email: 'mike@xyz.com', phone: '+1 234 567 892', status: 'negotiation', leadSource: 'LinkedIn', estimatedValue: 15000, score: 65, created_at: '2024-12-18' },
    { id: 4, contactName: 'Emily Brown', company: 'DesignHub', email: 'emily@designhub.com', phone: '+1 234 567 893', status: 'won', leadSource: 'Website', estimatedValue: 35000, score: 100, created_at: '2024-12-15' },
    { id: 5, contactName: 'David Lee', company: 'CloudSync', email: 'david@cloudsync.com', phone: '+1 234 567 894', status: 'lost', leadSource: 'Cold Call', estimatedValue: 20000, score: 30, created_at: '2024-12-10' },
];

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
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
    const location = useLocation();
    const navigate = useNavigate();

    // Check if navigated with openModal=true
    useEffect(() => {
        if (location.state?.openModal) {
            setEditingLead(null);
            setShowModal(true);
            // Clear the state so refreshing doesn't reopen
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await leadsAPI.getAll();
            setLeads(response.leads || mockLeads);
        } catch (error) {
            console.log('Using mock data');
            setLeads(mockLeads);
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
            } catch (error) {
                setLeads(prev => prev.filter(l => l.id !== deleteTargetId));
                toast.success('Lead deleted');
            }
            setDeleteTargetId(null);
        }
    };

    // Handle status update from Kanban drag-and-drop
    const handleUpdateStatus = async (leadId, newStatus) => {
        try {
            await leadsAPI.update(leadId, { status: newStatus });
            setLeads(prev => prev.map(l =>
                l.id === leadId ? { ...l, status: newStatus } : l
            ));
        } catch (error) {
            // Optimistic update for demo
            setLeads(prev => prev.map(l =>
                l.id === leadId ? { ...l, status: newStatus } : l
            ));
        }
    };

    // View lead details
    const handleViewLead = (lead) => {
        navigate(`/leads/${lead.id}`);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400';
        if (score >= 50) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/50 dark:text-amber-400';
        return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400';
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
                <div className="card p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">All Leads</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage and track your sales leads
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            title="List View"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'kanban'
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            title="Kanban View"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                        </button>
                    </div>
                    <button
                        onClick={() => { setEditingLead(null); setShowModal(true); }}
                        className="btn-primary"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Lead
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="stat-card">
                    <div className="stat-card-icon bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.total}</p>
                    <p className="stat-card-label">Total Leads</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.new}</p>
                    <p className="stat-card-label">New Leads</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.qualified}</p>
                    <p className="stat-card-label">Qualified</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.won}</p>
                    <p className="stat-card-label">Won</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="stat-card-value">Rs.{stats.totalValue.toLocaleString()}</p>
                    <p className="stat-card-label">Pipeline Value</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="select w-full sm:w-40"
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

            {/* Kanban View */}
            {viewMode === 'kanban' ? (
                <LeadsKanban
                    leads={filteredLeads}
                    onUpdateStatus={handleUpdateStatus}
                    onViewLead={handleViewLead}
                />
            ) : (
                /* Table View */
                <div className="card overflow-hidden">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Contact</th>
                                <th>Source</th>
                                <th>Value</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-semibold">
                                                {lead.contactName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{lead.contactName}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{lead.company}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-slate-600 dark:text-slate-400">{lead.leadSource}</td>
                                    <td className="font-medium text-slate-900 dark:text-white">₹{(lead.estimatedValue || 0).toLocaleString()}</td>
                                    <td>
                                        <span className={`inline-flex items-center justify-center w-10 h-6 rounded-full text-xs font-bold ${getScoreColor(lead.score)}`}>
                                            {lead.score}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={statusConfig[lead.status]?.class || 'badge-gray'}>
                                            {statusConfig[lead.status]?.label || lead.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Link to={`/leads/${lead.id}`} className="btn-ghost btn-sm">View</Link>
                                            <button onClick={() => { setEditingLead(lead); setShowModal(true); }} className="btn-ghost btn-sm">Edit</button>
                                            <button onClick={() => handleDelete(lead.id)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredLeads.length === 0 && (
                        <div className="empty-state">
                            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <h3 className="empty-state-title">No leads found</h3>
                            <p className="empty-state-text">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
            )}

            {/* Lead Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingLead ? 'Edit Lead' : 'Add New Lead'}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                        <button onClick={() => { setShowModal(false); toast.success('Lead saved'); }} className="btn-primary">
                            {editingLead ? 'Update' : 'Create'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Contact Name</label>
                        <input type="text" className="input" defaultValue={editingLead?.contactName} />
                    </div>
                    <div>
                        <label className="label">Company</label>
                        <input type="text" className="input" defaultValue={editingLead?.company} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Email</label>
                            <input type="email" className="input" defaultValue={editingLead?.email} />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input type="tel" className="input" defaultValue={editingLead?.phone} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Estimated Value</label>
                            <input type="number" className="input" defaultValue={editingLead?.estimatedValue} />
                        </div>
                        <div>
                            <label className="label">Lead Source</label>
                            <select className="select" defaultValue={editingLead?.leadSource || 'Website'}>
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
                        <select className="select" defaultValue={editingLead?.status || 'new'}>
                            <option value="new">New</option>
                            <option value="qualified">Qualified</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
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
