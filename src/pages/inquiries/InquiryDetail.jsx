import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import EmailComposer from '../../components/common/EmailComposer';

// Activity type configurations with SVG paths
const ACTIVITY_TYPES = {
    note: {
        label: 'Note',
        icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
        color: 'bg-blue-500'
    },
    call: {
        label: 'Call',
        icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
        color: 'bg-emerald-500'
    },
    email: {
        label: 'Email',
        icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        color: 'bg-purple-500'
    },
    meeting: {
        label: 'Meeting',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        color: 'bg-amber-500'
    },
    status_change: {
        label: 'Status Change',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        color: 'bg-slate-500'
    },
};

// SVG Icon component
const ActivityIcon = ({ path, className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
);

const STATUS_COLORS = {
    new: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
    contacted: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
    resolved: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
    converted: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export default function InquiryDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inquiry, setInquiry] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('timeline');

    // Activity form
    const [newNote, setNewNote] = useState('');
    const [activityType, setActivityType] = useState('note');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEmailComposer, setShowEmailComposer] = useState(false);

    useEffect(() => {
        fetchInquiry();
        fetchActivities();
    }, [id]);

    const fetchInquiry = async () => {
        try {
            const res = await apiClient.get(`/inquiries/${id}`);
            setInquiry(res.data.data || res.data);
        } catch (error) {
            console.error('Failed to fetch inquiry:', error);
            toast.error('Failed to load inquiry details');
            navigate('/inquiries');
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            const res = await apiClient.get(`/activities/inquiry/${id}`);
            if (res.data.success) {
                setActivities(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        }
    };

    const handleAddActivity = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setIsSubmitting(true);
        try {
            await apiClient.post(`/activities`, {
                entityType: 'inquiry',
                entityId: id,
                type: activityType,
                summary: `${ACTIVITY_TYPES[activityType].label} logged`,
                details: newNote
            });

            toast.success('Activity added');
            setNewNote('');
            fetchActivities();
        } catch (error) {
            toast.error('Failed to add activity');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await apiClient.patch(`/inquiries/${id}/status`, { status: newStatus });
            toast.success('Status updated');
            fetchInquiry();
            fetchActivities();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleConvertToLead = async () => {
        if (!confirm('Convert this inquiry to a lead?')) return;

        try {
            const res = await apiClient.post(`/inquiries/${id}/convert-to-lead`);
            toast.success('Converted to lead!');
            navigate(`/leads/${res.data.lead?.id || ''}`);
        } catch (error) {
            toast.error('Failed to convert to lead');
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!inquiry) return null;

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <Link to="/inquiries" className="hover:text-brand-600">Inquiries</Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-white font-medium">{inquiry.name}</span>
            </div>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{inquiry.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{inquiry.company || 'No company'}</p>
                        <div className="flex items-center gap-3 mt-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[inquiry.status] || 'bg-slate-100 text-slate-700'}`}>
                                {inquiry.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {inquiry.status !== 'converted' && (
                            <button
                                onClick={handleConvertToLead}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
                            >
                                Convert to Lead
                            </button>
                        )}
                        <button
                            onClick={() => setShowEmailComposer(true)}
                            className="px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send Email
                        </button>
                        <button
                            onClick={() => navigate('/inquiries')}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Info & Actions */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
                        <div className="space-y-3">
                            {inquiry.email && (
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <a href={`mailto:${inquiry.email}`} className="text-brand-600 hover:underline">{inquiry.email}</a>
                                </div>
                            )}
                            {inquiry.phone && (
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <a href={`tel:${inquiry.phone}`} className="text-brand-600 hover:underline">{inquiry.phone}</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Update Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['new', 'contacted', 'resolved'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={inquiry.status === 'converted'}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${inquiry.status === status
                                        ? 'bg-brand-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assigned To */}
                    {inquiry.assignedFirstName && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Assigned To</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center font-semibold">
                                    {inquiry.assignedFirstName[0]}{inquiry.assignedLastName?.[0] || ''}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{inquiry.assignedFirstName} {inquiry.assignedLastName}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    {inquiry.message && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Original Message</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{inquiry.message}</p>
                        </div>
                    )}

                    {/* Meta */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Received</span>
                                <span className="text-slate-900 dark:text-white">{formatDate(inquiry.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Timeline */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'timeline'
                                    ? 'text-brand-600 border-b-2 border-brand-600'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                Timeline ({activities.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'add'
                                    ? 'text-brand-600 border-b-2 border-brand-600'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                + Add Activity
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'add' && (
                                <form onSubmit={handleAddActivity} className="space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                        {Object.entries(ACTIVITY_TYPES).filter(([key]) => key !== 'status_change').map(([key, val]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setActivityType(key)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activityType === key
                                                    ? 'bg-brand-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                <ActivityIcon path={val.icon} className="w-4 h-4 inline mr-1" /> {val.label}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Add details about this activity..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none resize-none h-32 placeholder:text-slate-400"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !newNote.trim()}
                                        className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add Activity'}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="space-y-0">
                                    {activities.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400">No activities yet</p>
                                            <button
                                                onClick={() => setActiveTab('add')}
                                                className="mt-4 text-brand-600 font-medium hover:underline"
                                            >
                                                Add the first activity
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            {/* Timeline line */}
                                            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-600"></div>

                                            {activities.map((activity, index) => {
                                                const config = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.note;
                                                return (
                                                    <div key={activity.id} className="relative pl-14 pb-6">
                                                        {/* Timeline dot */}
                                                        <div className={`absolute left-3 w-8 h-8 rounded-full ${config.color} flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-800`}>
                                                            <ActivityIcon path={config.icon} className="w-4 h-4" />
                                                        </div>

                                                        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <span className="font-medium text-slate-900 dark:text-white">{activity.description || activity.summary}</span>
                                                                <span className="text-xs text-slate-400">{getRelativeTime(activity.createdAt)}</span>
                                                            </div>
                                                            {activity.details && (
                                                                <p className="text-sm text-slate-600 dark:text-slate-300">{activity.details}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Composer Modal */}
            <EmailComposer
                isOpen={showEmailComposer}
                onClose={() => setShowEmailComposer(false)}
                recipient={{ name: inquiry.name, email: inquiry.email, company: inquiry.company }}
                entityType="inquiry"
                entityId={id}
                onEmailSent={() => fetchActivities()}
            />
        </div>
    );
}
