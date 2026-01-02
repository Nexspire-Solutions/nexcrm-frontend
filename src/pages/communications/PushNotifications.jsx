import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { notificationsAPI } from '../../api';

export default function PushNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        audience: 'all',
        link: ''
    });
    const [settings, setSettings] = useState({
        enabled: true,
        leadUpdates: true,
        newInquiries: true,
        taskReminders: true,
        teamMessages: false
    });
    const [stats, setStats] = useState({
        total: 0,
        totalDelivered: 0,
        avgClickRate: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch notifications list
            const notifResponse = await notificationsAPI.getAll();
            setNotifications(notifResponse.notifications || []);
            setStats(notifResponse.stats || { total: 0, totalDelivered: 0, avgClickRate: 0 });

            // Fetch settings
            const settingsResponse = await notificationsAPI.getSettings();
            if (settingsResponse) {
                setSettings(settingsResponse);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            toast.error('Failed to load notifications data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error('Title and message are required');
            return;
        }
        setSaving(true);
        try {
            const result = await notificationsAPI.send({
                title: formData.title,
                message: formData.message,
                audience: formData.audience,
                link: formData.link || undefined
            });

            if (result.success) {
                toast.success(`Notification sent to ${result.sentCount || 0} devices`);
                setShowModal(false);
                setFormData({ title: '', message: '', audience: 'all', link: '' });
                fetchData();
            } else {
                toast.error(result.error || 'Failed to send notification');
            }
        } catch (error) {
            toast.error('Failed to send notification');
        } finally {
            setSaving(false);
        }
    };

    const handleSettingToggle = async (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);

        try {
            await notificationsAPI.updateSettings(newSettings);
        } catch (error) {
            console.error('Failed to update setting:', error);
            // Revert on error
            setSettings(settings);
            toast.error('Failed to update setting');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
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
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Push Notifications</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Manage push notifications and subscriber settings
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Notification
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Notifications Sent</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalDelivered.toLocaleString()}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Delivered</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgClickRate}%</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Avg Click Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Notification Settings */}
                <div className="card p-6 space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Notification Settings</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Configure which notifications to send</p>

                    <div className="space-y-3 pt-2">
                        {Object.entries({
                            leadUpdates: 'Lead status updates',
                            newInquiries: 'New inquiry alerts',
                            taskReminders: 'Task reminders',
                            teamMessages: 'Team messages'
                        }).map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between py-2">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                                <button
                                    onClick={() => handleSettingToggle(key)}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${settings[key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings[key] ? 'left-5' : 'left-0.5'}`}></span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Notifications */}
                <div className="lg:col-span-2 card overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Recent Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-slate-500 dark:text-slate-400">No notifications sent yet</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create your first notification above</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Notification</th>
                                    <th>Sent At</th>
                                    <th>Recipients</th>
                                    <th>Click Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.map(notification => (
                                    <tr key={notification.id}>
                                        <td>
                                            <p className="font-medium text-slate-900 dark:text-white">{notification.title}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{notification.message}</p>
                                        </td>
                                        <td className="text-sm text-slate-500 dark:text-slate-400">
                                            {notification.sent_at ? new Date(notification.sent_at).toLocaleDateString() : 'Pending'}
                                        </td>
                                        <td>{(notification.delivered_count || 0).toLocaleString()}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${Math.round((notification.clicked_count || 0) / (notification.delivered_count || 1) * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm">{Math.round((notification.clicked_count || 0) / (notification.delivered_count || 1) * 100)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Notification Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="New Push Notification"
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>Cancel</button>
                        <button onClick={handleSend} className="btn-primary" disabled={saving}>
                            {saving ? 'Sending...' : 'Send Notification'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Title *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Notification title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="label">Message *</label>
                        <textarea
                            className="input min-h-24"
                            placeholder="Notification message..."
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        ></textarea>
                    </div>
                    <div>
                        <label className="label">Target Audience</label>
                        <select
                            className="select"
                            value={formData.audience}
                            onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                        >
                            <option value="all">All Subscribers</option>
                            <option value="leads">Leads Only</option>
                            <option value="customers">Customers Only</option>
                            <option value="team">Team Members</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Link (optional)</label>
                        <input
                            type="url"
                            className="input"
                            placeholder="https:// or /internal-route"
                            value={formData.link}
                            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
