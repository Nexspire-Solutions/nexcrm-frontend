import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const mockNotifications = [
    { id: 1, title: 'New Feature Announcement', message: 'Check out our new dashboard features!', sentAt: '2024-12-21 10:00', recipients: 1250, clicked: 234 },
    { id: 2, title: 'Holiday Hours', message: 'Our offices will be closed...', sentAt: '2024-12-20 14:30', recipients: 3500, clicked: 567 },
    { id: 3, title: 'System Maintenance', message: 'Scheduled maintenance on Dec 25', sentAt: '2024-12-18 09:00', recipients: 3500, clicked: 890 },
];

export default function PushNotifications() {
    const [notifications] = useState(mockNotifications);
    const [showModal, setShowModal] = useState(false);
    const [settings, setSettings] = useState({
        enabled: true,
        leadUpdates: true,
        newInquiries: true,
        taskReminders: true,
        teamMessages: false
    });

    const stats = {
        total: notifications.length,
        totalSent: notifications.reduce((sum, n) => sum + n.recipients, 0),
        avgClickRate: Math.round(notifications.reduce((sum, n) => sum + (n.clicked / n.recipients * 100), 0) / notifications.length)
    };

    const handleSend = () => {
        setShowModal(false);
        toast.success('Notification scheduled');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Push Notifications</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage push notifications and subscriber settings
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Notification
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="stat-card-icon bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.total}</p>
                    <p className="stat-card-label">Notifications Sent</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.totalSent.toLocaleString()}</p>
                    <p className="stat-card-label">Total Delivered</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.avgClickRate}%</p>
                    <p className="stat-card-label">Avg Click Rate</p>
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
                                    onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key] }))}
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
                                    <td className="text-sm text-slate-500 dark:text-slate-400">{notification.sentAt}</td>
                                    <td>{notification.recipients.toLocaleString()}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.round(notification.clicked / notification.recipients * 100)}%` }}></div>
                                            </div>
                                            <span className="text-sm">{Math.round(notification.clicked / notification.recipients * 100)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notification Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="New Push Notification"
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                        <button onClick={handleSend} className="btn-primary">Send Notification</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Title</label>
                        <input type="text" className="input" placeholder="Notification title" />
                    </div>
                    <div>
                        <label className="label">Message</label>
                        <textarea className="input min-h-24" placeholder="Notification message..."></textarea>
                    </div>
                    <div>
                        <label className="label">Target Audience</label>
                        <select className="select">
                            <option value="all">All Subscribers</option>
                            <option value="leads">Leads Only</option>
                            <option value="customers">Customers Only</option>
                            <option value="team">Team Members</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Link (optional)</label>
                        <input type="url" className="input" placeholder="https://" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
