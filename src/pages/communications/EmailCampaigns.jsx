import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const mockCampaigns = [
    { id: 1, name: 'Q4 Product Launch', status: 'active', sent: 1250, opened: 856, clicked: 234, startDate: '2024-12-15', endDate: '2024-12-31' },
    { id: 2, name: 'Holiday Promotion', status: 'completed', sent: 2500, opened: 1875, clicked: 520, startDate: '2024-12-01', endDate: '2024-12-20' },
    { id: 3, name: 'New Year Campaign', status: 'scheduled', sent: 0, opened: 0, clicked: 0, startDate: '2024-12-28', endDate: '2025-01-15' },
    { id: 4, name: 'Customer Feedback', status: 'draft', sent: 0, opened: 0, clicked: 0, startDate: null, endDate: null },
];

const statusStyles = {
    active: 'badge-success',
    completed: 'badge-gray',
    scheduled: 'badge-primary',
    draft: 'badge-warning'
};

export default function EmailCampaigns() {
    const [campaigns] = useState(mockCampaigns);
    const [showModal, setShowModal] = useState(false);

    const stats = {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        totalSent: campaigns.reduce((sum, c) => sum + c.sent, 0),
        avgOpenRate: Math.round(campaigns.reduce((sum, c) => sum + (c.sent > 0 ? (c.opened / c.sent * 100) : 0), 0) / campaigns.filter(c => c.sent > 0).length) || 0
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6  rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Email Campaigns</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Create and track email marketing campaigns
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Campaign
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Campaigns</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSent.toLocaleString()}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Emails Sent</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgOpenRate}%</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Avg Open Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="card overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Campaign</th>
                            <th>Status</th>
                            <th>Sent</th>
                            <th>Open Rate</th>
                            <th>Click Rate</th>
                            <th>Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((campaign) => {
                            const openRate = campaign.sent > 0 ? Math.round(campaign.opened / campaign.sent * 100) : 0;
                            const clickRate = campaign.sent > 0 ? Math.round(campaign.clicked / campaign.sent * 100) : 0;

                            return (
                                <tr key={campaign.id}>
                                    <td>
                                        <p className="font-medium text-slate-900 dark:text-white">{campaign.name}</p>
                                    </td>
                                    <td>
                                        <span className={statusStyles[campaign.status]}>{campaign.status}</span>
                                    </td>
                                    <td className="text-slate-600 dark:text-slate-400">{campaign.sent.toLocaleString()}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${openRate}%` }}></div>
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{openRate}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${clickRate}%` }}></div>
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{clickRate}%</span>
                                        </div>
                                    </td>
                                    <td className="text-sm text-slate-500 dark:text-slate-400">
                                        {campaign.startDate ? `${campaign.startDate} - ${campaign.endDate || 'Ongoing'}` : '-'}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <button className="btn-ghost btn-sm">View</button>
                                            <button className="btn-ghost btn-sm">Edit</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Campaign Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="New Campaign"
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                        <button onClick={() => { setShowModal(false); toast.success('Campaign created'); }} className="btn-primary">Create Campaign</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Campaign Name</label>
                        <input type="text" className="input" placeholder="e.g., Summer Sale 2024" />
                    </div>
                    <div>
                        <label className="label">Email Template</label>
                        <select className="select">
                            <option value="">Select template</option>
                            <option value="1">Welcome Email</option>
                            <option value="2">Follow-up Reminder</option>
                            <option value="3">Meeting Confirmation</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Start Date</label>
                            <input type="date" className="input" />
                        </div>
                        <div>
                            <label className="label">End Date</label>
                            <input type="date" className="input" />
                        </div>
                    </div>

                    {/* Schedule Options */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                        <label className="label">Launch Options</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="launch" value="now" defaultChecked className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Send Now</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="launch" value="schedule" className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Schedule for Later</span>
                            </label>
                        </div>
                    </div>

                    {/* Schedule Time Picker (shown when scheduling) */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">Schedule Send Time</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 block">Date</label>
                                <input type="date" className="input text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 block">Time</label>
                                <input type="time" className="input text-sm" defaultValue="09:00" />
                            </div>
                        </div>
                        <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                            Emails will be sent automatically at the scheduled time
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
