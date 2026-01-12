import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { leadsAPI, activitiesAPI } from '../../api';

const activityIcons = {
    call: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    ),
    email: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    meeting: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    note: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    status: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
};

export default function LeadDetail() {
    const { id } = useParams();
    const [lead, setLead] = useState(null);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [newNote, setNewNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [showQuickActionModal, setShowQuickActionModal] = useState(false);
    const [quickActionType, setQuickActionType] = useState('');
    const [quickActionNote, setQuickActionNote] = useState('');

    const handleEdit = () => {
        setEditForm({ ...lead });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editForm.contactName || !editForm.contactName.trim()) {
            toast.error('Contact name is required');
            return;
        }

        if (!editForm.email && !editForm.phone) {
            toast.error('Please provide either an email or phone number');
            return;
        }

        if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (editForm.estimatedValue && parseFloat(editForm.estimatedValue) < 0) {
            toast.error('Estimated value cannot be negative');
            return;
        }

        try {
            await leadsAPI.update(id, editForm);
            toast.success('Lead updated');
            setShowEditModal(false);
            fetchLead();
        } catch (error) {
            toast.error('Failed to update lead');
        }
    };

    const handleConvert = async () => {
        if (!window.confirm(`Are you sure you want to convert "${lead.contactName}" to a Client? This will mark the lead as Won.`)) return;
        try {
            await leadsAPI.convertToClient(id);
            toast.success('Converted to Client successfully');
            fetchLead();
        } catch (error) {
            console.error(error);
            toast.error('Failed to convert lead');
        }
    };

    const handleQuickAction = (type) => {
        setQuickActionType(type);
        setQuickActionNote('');
        setShowQuickActionModal(true);
    };

    const handleSaveQuickAction = async () => {
        if (!quickActionNote.trim()) {
            toast.error('Please enter a note');
            return;
        }

        try {
            await activitiesAPI.create({
                entityType: 'lead',
                entityId: id,
                type: quickActionType,
                summary: `${quickActionType.charAt(0).toUpperCase() + quickActionType.slice(1)} logged`,
                details: quickActionNote
            });
            toast.success('Activity logged');
            setShowQuickActionModal(false);
            fetchLead();
        } catch (error) {
            toast.error('Failed to log activity');
        }
    };

    useEffect(() => {
        fetchLead();
    }, [id]);

    const fetchLead = async () => {
        try {
            const [leadRes, activitiesRes] = await Promise.all([
                leadsAPI.getById(id),
                activitiesAPI.getByEntity('lead', id).catch(() => ({ data: [] }))
            ]);
            setLead(leadRes.lead || leadRes.data || leadRes);
            setActivities(activitiesRes.data || []);
        } catch (error) {
            console.error('Failed to load lead:', error);
            toast.error('Failed to load lead details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setSaving(true);
        try {
            await activitiesAPI.create({
                type: 'note',
                summary: 'Note added',
                details: newNote.trim(),
                entityType: 'lead',
                entityId: id
            });
            toast.success('Note added');
            setNewNote('');
            fetchLead(); // Refresh activities
        } catch (error) {
            toast.error('Failed to add note');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">Lead not found</h3>
                <Link to="/leads" className="btn-primary mt-4">Back to Leads</Link>
            </div>
        );
    }

    const statusColors = {
        new: 'badge-primary',
        contacted: 'badge-warning',
        qualified: 'badge-success',
        negotiation: 'badge-warning',
        won: 'bg-emerald-600 text-white badge',
        lost: 'badge-danger'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/leads" className="btn-ghost p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="page-title">{lead.contactName}</h1>
                        <span className={statusColors[lead.status] || 'badge-gray'}>{lead.status}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{lead.company}</p>
                </div>
                <button onClick={handleEdit} className="btn-secondary">Edit Lead</button>
                {lead.status === 'won' || lead.customerId ? (
                    <button disabled className="btn-secondary cursor-not-allowed opacity-60" title="Lead already converted">
                        Already Converted
                    </button>
                ) : (
                    <button onClick={handleConvert} className="btn-primary">Convert to Client</button>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'tab-active' : 'tab'}>Overview</button>
                <button onClick={() => setActiveTab('activity')} className={activeTab === 'activity' ? 'tab-active' : 'tab'}>Activity</button>
                <button onClick={() => setActiveTab('notes')} className={activeTab === 'notes' ? 'tab-active' : 'tab'}>Notes</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            {/* Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="stat-card">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Estimated Value</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        Rs.{(lead.estimatedValue || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="stat-card">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Lead Score</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{lead.score || 0}</p>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lead.score || 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="card p-6">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {activities.length === 0 ? (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">No activities yet</p>
                                    ) : (
                                        activities.slice(0, 3).map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0">
                                                    {activityIcons[activity.type] || activityIcons.note}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.type}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{activity.description}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                        {new Date(activity.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'activity' && (
                        <div className="card p-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Activity Timeline</h3>
                            <div className="space-y-0">
                                {activities.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No activities recorded</p>
                                ) : (
                                    activities.map((activity, idx) => (
                                        <div key={activity.id} className="relative flex gap-3 pb-4">
                                            {idx < activities.length - 1 && (
                                                <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                                            )}
                                            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 relative z-10 mt-0.5">
                                                {/* Scale down imported icons */}
                                                <div className="transform scale-75">
                                                    {activityIcons[activity.type] || activityIcons.note}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize leading-none">{activity.type}</p>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        {new Date(activity.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{activity.description}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="card p-6 space-y-4">
                            <div>
                                <label className="label">Add Note</label>
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="input min-h-24"
                                    placeholder="Enter note..."
                                ></textarea>
                                <button onClick={handleAddNote} className="btn-primary mt-2" disabled={saving}>
                                    {saving ? 'Adding...' : 'Add Note'}
                                </button>
                            </div>
                            <div className="mt-6 space-y-2">
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Note History</h4>
                                {activities.filter(a => a.type === 'note').length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No notes yet</p>
                                ) : (
                                    activities.filter(a => a.type === 'note').map(note => (
                                        <div key={note.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    {note.firstName ? `by ${note.firstName} ${note.lastName}` : 'Note'}
                                                </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                                    {new Date(note.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-snug">{note.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Contact Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{lead.email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{lead.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{lead.company || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{lead.leadSource || lead.source || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button onClick={() => handleQuickAction('call')} className="btn-secondary w-full justify-start">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Log Call
                            </button>
                            <button onClick={() => handleQuickAction('email')} className="btn-secondary w-full justify-start">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Send Email
                            </button>
                            <button onClick={() => handleQuickAction('meeting')} className="btn-secondary w-full justify-start">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Schedule Meeting
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Edit Lead</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Contact Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editForm.contactName || ''}
                                    onChange={e => setEditForm({ ...editForm, contactName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Company</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editForm.company || ''}
                                    onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={editForm.email || ''}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        value={editForm.phone || ''}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Status</label>
                                    <select
                                        className="input"
                                        value={editForm.status || 'new'}
                                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="negotiation">Negotiation</option>
                                        <option value="won">Won</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Estimated Value</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={editForm.estimatedValue || ''}
                                        onChange={e => setEditForm({ ...editForm, estimatedValue: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Lead Source</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editForm.leadSource || ''}
                                    onChange={e => setEditForm({ ...editForm, leadSource: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowEditModal(false)} className="btn-ghost">Cancel</button>
                            <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Quick Action Modal */}
            {showQuickActionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 capitalize">
                            {quickActionType === 'call' ? 'Log Call' :
                                quickActionType === 'email' ? 'Send Email' :
                                    'Schedule Meeting'}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">
                                    {quickActionType === 'call' ? 'Call Summary' :
                                        quickActionType === 'email' ? 'Email Content' :
                                            'Meeting Details'}
                                </label>
                                <textarea
                                    className="input min-h-32"
                                    value={quickActionNote}
                                    onChange={e => setQuickActionNote(e.target.value)}
                                    placeholder="Enter details..."
                                    autoFocus
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowQuickActionModal(false)} className="btn-ghost">Cancel</button>
                            <button onClick={handleSaveQuickAction} className="btn-primary">Save Activity</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
