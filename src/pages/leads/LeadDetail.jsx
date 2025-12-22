import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const mockLead = {
    id: 1,
    contactName: 'John Smith',
    company: 'TechCorp',
    email: 'john@techcorp.com',
    phone: '+1 234 567 890',
    status: 'qualified',
    leadSource: 'Website',
    estimatedValue: 25000,
    score: 85,
    notes: 'Interested in enterprise package. Follow up next week.',
    created_at: '2024-12-20',
    activities: [
        { id: 1, type: 'call', title: 'Initial discovery call', description: 'Discussed requirements and timeline', date: '2024-12-20 14:30', user: 'Jane Admin' },
        { id: 2, type: 'email', title: 'Sent proposal document', description: 'Proposal for enterprise package', date: '2024-12-19 10:00', user: 'Jane Admin' },
        { id: 3, type: 'note', title: 'Updated lead score', description: 'Score increased from 70 to 85', date: '2024-12-18 16:45', user: 'System' },
        { id: 4, type: 'meeting', title: 'Demo scheduled', description: 'Product demo with full team', date: '2024-12-17 11:00', user: 'Mike Sales' },
    ]
};

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
    )
};

export default function LeadDetail() {
    const { id } = useParams();
    const [lead, setLead] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        setTimeout(() => {
            setLead(mockLead);
            setIsLoading(false);
        }, 300);
    }, [id]);

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        toast.success('Note added');
        setNewNote('');
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
                        <span className={statusColors[lead.status]}>{lead.status}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{lead.company}</p>
                </div>
                <button className="btn-secondary">Edit Lead</button>
                <button className="btn-primary">Convert to Customer</button>
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
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Rs.{lead.estimatedValue.toLocaleString()}</p>
                                </div>
                                <div className="stat-card">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Lead Score</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{lead.score}</p>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lead.score}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="card p-6">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {lead.activities.slice(0, 3).map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0">
                                                {activityIcons[activity.type]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{activity.description}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{activity.date} by {activity.user}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'activity' && (
                        <div className="card p-6">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Activity Timeline</h3>
                            <div className="space-y-6">
                                {lead.activities.map((activity, idx) => (
                                    <div key={activity.id} className="relative flex gap-4">
                                        {idx < lead.activities.length - 1 && (
                                            <div className="absolute left-4 top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700"></div>
                                        )}
                                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0 relative z-10">
                                            {activityIcons[activity.type]}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{activity.description}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{activity.date} by {activity.user}</p>
                                        </div>
                                    </div>
                                ))}
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
                                <button onClick={handleAddNote} className="btn-primary mt-2">Add Note</button>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">{lead.notes}</p>
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
                                <span className="text-sm text-slate-700 dark:text-slate-300">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{lead.company}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{lead.leadSource}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="btn-secondary w-full justify-start">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Log Call
                            </button>
                            <button className="btn-secondary w-full justify-start">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Send Email
                            </button>
                            <button className="btn-secondary w-full justify-start">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Schedule Meeting
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
