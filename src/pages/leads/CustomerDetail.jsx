import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clientsAPI, activitiesAPI } from '../../api';

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
    sms: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ),
    notification: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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

export default function CustomerDetail() {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [activities, setActivities] = useState([]);
    const [orders, setOrders] = useState([]);
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
        setEditForm({ ...customer });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editForm.name || !editForm.name.trim()) {
            toast.error('Customer name is required');
            return;
        }

        if (!editForm.email && !editForm.phone) {
            toast.error('Please provide either an email or phone number');
            return;
        }

        try {
            await clientsAPI.update(id, editForm);
            toast.success('Customer updated');
            setShowEditModal(false);
            fetchCustomer();
        } catch (error) {
            toast.error('Failed to update customer');
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
                entityType: 'customer',
                entityId: id,
                type: quickActionType,
                summary: `${quickActionType.charAt(0).toUpperCase() + quickActionType.slice(1)} logged`,
                details: quickActionNote
            });
            toast.success('Activity logged');
            setShowQuickActionModal(false);
            fetchCustomer();
        } catch (error) {
            toast.error('Failed to log activity');
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    const fetchCustomer = async () => {
        try {
            const [customerRes, activitiesRes] = await Promise.all([
                clientsAPI.getById(id),
                activitiesAPI.getByEntity('customer', id).catch(() => ({ data: [] }))
            ]);
            setCustomer(customerRes.data || customerRes); // Adjust based on API structure
            setOrders((customerRes.data || customerRes)?.orders || []);
            setActivities(activitiesRes.data || []);
        } catch (error) {
            console.error('Failed to load customer:', error);
            toast.error('Failed to load customer details');
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
                entityType: 'customer',
                entityId: id
            });
            toast.success('Note added');
            setNewNote('');
            fetchCustomer(); // Refresh activities
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

    if (!customer) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">Customer not found</h3>
                <Link to="/leads/customers" className="btn-primary mt-4">Back to Customers</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/leads/customers" className="btn-ghost p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="page-title">{customer.name || customer.contactName}</h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${customer.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                            }`}>
                            {customer.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{customer.company}</p>
                </div>
                <button onClick={handleEdit} className="btn-secondary">Edit Customer</button>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'tab-active' : 'tab'}>Overview</button>
                <button onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? 'tab-active' : 'tab'}>Orders ({orders.length})</button>
                <button onClick={() => setActiveTab('activity')} className={activeTab === 'activity' ? 'tab-active' : 'tab'}>Activity</button>
                <button onClick={() => setActiveTab('notes')} className={activeTab === 'notes' ? 'tab-active' : 'tab'}>Notes</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            {/* Info Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="stat-card">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Value</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        ₹{(parseFloat(customer.totalValue) || parseFloat(customer.total_value) || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="stat-card">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Orders</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        {parseInt(customer.ordersCount) || parseInt(customer.orders_count) || orders.length || 0}
                                    </p>
                                </div>
                                <div className="stat-card">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Projects</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        {parseInt(customer.projectsCount) || parseInt(customer.projects_count) || 0}
                                    </p>
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

                    {activeTab === 'orders' && (
                        <div className="card p-6">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Order History</h3>
                            {orders.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No orders yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="pb-3 font-medium">Order #</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                <th className="pb-3 font-medium text-right">Total</th>
                                                <th className="pb-3 font-medium text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {orders.map(order => (
                                                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                                                        {order.order_number || `#${order.id}`}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'completed' || order.status === 'delivered'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : order.status === 'pending'
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                                : order.status === 'cancelled'
                                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right font-medium text-slate-900 dark:text-white">
                                                        ₹{(parseFloat(order.total) || 0).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 text-right text-slate-500 dark:text-slate-400">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
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
                                <span className="text-sm text-slate-700 dark:text-slate-300">{customer.email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{customer.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{customer.company || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{customer.industry || '-'}</span>
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
                        <h3 className="text-lg font-bold mb-4">Edit Customer</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Customer Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editForm.name || editForm.contactName || ''}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
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
                                        value={editForm.status || 'active'}
                                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Industry</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={editForm.industry || ''}
                                        onChange={e => setEditForm({ ...editForm, industry: e.target.value })}
                                    />
                                </div>
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
