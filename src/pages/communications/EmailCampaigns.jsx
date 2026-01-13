import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { templatesAPI, campaignsAPI, smtpAPI } from '../../api';

const statusStyles = {
    active: 'badge-success',
    completed: 'badge-gray',
    scheduled: 'badge-primary',
    draft: 'badge-warning',
    paused: 'badge-warning',
    failed: 'badge-error'
};

export default function EmailCampaigns() {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSmtpModal, setShowSmtpModal] = useState(false);
    const [smtpConfigured, setSmtpConfigured] = useState(true);
    const [smtpAccount, setSmtpAccount] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        templateId: '',
        startDate: '',
        endDate: '',
        launchOption: 'now',
        scheduleDate: '',
        scheduleTime: '09:00'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Check SMTP status first
            try {
                const smtpRes = await smtpAPI.getStatus();
                setSmtpConfigured(smtpRes.configured);
                setSmtpAccount(smtpRes.account || null);
            } catch (e) {
                setSmtpConfigured(false);
            }

            // Fetch templates for the dropdown
            const templatesRes = await templatesAPI.getAll().catch(() => ({ data: [] }));
            setTemplates(templatesRes.data || []);

            // Fetch campaigns
            const campaignsRes = await campaignsAPI.getAll().catch(() => ({ data: [] }));
            setCampaigns(campaignsRes.data || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = {
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        totalSent: campaigns.reduce((sum, c) => sum + (c.total_sent || 0), 0),
        avgOpenRate: campaigns.filter(c => c.total_sent > 0).length > 0
            ? Math.round(campaigns.reduce((sum, c) => sum + (c.total_sent > 0 ? ((c.total_opened || 0) / c.total_sent * 100) : 0), 0) / campaigns.filter(c => c.total_sent > 0).length)
            : 0
    };

    const handleSendCampaign = async (id) => {
        // Check SMTP before sending
        if (!smtpConfigured) {
            setShowSmtpModal(true);
            return;
        }

        try {
            const res = await campaignsAPI.send(id);
            toast.success(res.message || 'Campaign started!');
            fetchData();
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to send campaign';
            if (errorMsg.includes('SMTP') || errorMsg.includes('Email service')) {
                setShowSmtpModal(true);
            } else {
                toast.error(errorMsg);
            }
        }
    };

    const handleDeleteCampaign = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            await campaignsAPI.delete(id);
            toast.success('Campaign deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error('Campaign name is required');
            return;
        }
        setSaving(true);
        try {
            await campaignsAPI.create({
                name: formData.name,
                template_id: formData.templateId || null,
                status: formData.launchOption === 'now' ? 'active' : 'scheduled',
                scheduled_at: formData.launchOption === 'schedule'
                    ? `${formData.scheduleDate} ${formData.scheduleTime}:00`
                    : null
            });
            toast.success('Campaign created');
            setShowModal(false);
            setFormData({
                name: '',
                templateId: '',
                startDate: '',
                endDate: '',
                launchOption: 'now',
                scheduleDate: '',
                scheduleTime: '09:00'
            });
            fetchData();
        } catch (error) {
            toast.error('Failed to create campaign');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
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
                {campaigns.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No campaigns created yet</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Create your first email campaign above</p>
                    </div>
                ) : (
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
                                const openRate = campaign.total_sent > 0 ? Math.round((campaign.total_opened || 0) / campaign.total_sent * 100) : 0;
                                const clickRate = campaign.total_sent > 0 ? Math.round((campaign.total_clicked || 0) / campaign.total_sent * 100) : 0;

                                return (
                                    <tr key={campaign.id}>
                                        <td>
                                            <p className="font-medium text-slate-900 dark:text-white">{campaign.name}</p>
                                            {campaign.template_name && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Template: {campaign.template_name}</p>
                                            )}
                                        </td>
                                        <td>
                                            <span className={statusStyles[campaign.status] || 'badge-gray'}>{campaign.status}</span>
                                        </td>
                                        <td className="text-slate-600 dark:text-slate-400">
                                            {(campaign.total_sent || 0).toLocaleString()}
                                            {campaign.total_recipients > 0 && campaign.total_sent !== campaign.total_recipients && (
                                                <span className="text-xs text-slate-400"> / {campaign.total_recipients}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(openRate, 100)}%` }}></div>
                                                </div>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{openRate}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(clickRate, 100)}%` }}></div>
                                                </div>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{clickRate}%</span>
                                            </div>
                                        </td>
                                        <td className="text-sm text-slate-500 dark:text-slate-400">
                                            {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : campaign.scheduled_at ? `Scheduled: ${new Date(campaign.scheduled_at).toLocaleDateString()}` : '-'}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                {campaign.status === 'draft' && (
                                                    <button
                                                        onClick={() => handleSendCampaign(campaign.id)}
                                                        className="btn-primary btn-sm"
                                                        title="Send Campaign"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                        Send
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                                    className="btn-ghost btn-sm text-red-500 hover:text-red-600"
                                                    title="Delete Campaign"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Campaign Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="New Campaign"
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>Cancel</button>
                        <button onClick={handleCreate} className="btn-primary" disabled={saving}>
                            {saving ? 'Creating...' : 'Create Campaign'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Campaign Name *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Summer Sale 2024"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="label">Email Template</label>
                        <select
                            className="select"
                            value={formData.templateId}
                            onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                        >
                            <option value="">Select template</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Start Date</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">End Date</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.endDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Schedule Options */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                        <label className="label">Launch Options</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="launch"
                                    value="now"
                                    checked={formData.launchOption === 'now'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, launchOption: e.target.value }))}
                                    className="w-4 h-4 text-indigo-600"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Send Now</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="launch"
                                    value="schedule"
                                    checked={formData.launchOption === 'schedule'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, launchOption: e.target.value }))}
                                    className="w-4 h-4 text-indigo-600"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Schedule for Later</span>
                            </label>
                        </div>
                    </div>

                    {/* Schedule Time Picker (shown when scheduling) */}
                    {formData.launchOption === 'schedule' && (
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
                                    <input
                                        type="date"
                                        className="input text-sm"
                                        value={formData.scheduleDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 block">Time</label>
                                    <input
                                        type="time"
                                        className="input text-sm"
                                        value={formData.scheduleTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, scheduleTime: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                                Emails will be sent automatically at the scheduled time
                            </p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* SMTP Not Configured Modal */}
            <Modal
                isOpen={showSmtpModal}
                onClose={() => setShowSmtpModal(false)}
                title="Email Setup Required"
                size="md"
                footer={
                    <>
                        <button onClick={() => setShowSmtpModal(false)} className="btn-secondary">Cancel</button>
                        <button onClick={() => navigate('/settings/smtp')} className="btn-primary">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Go to SMTP Settings
                        </button>
                    </>
                }
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Email Account Configured</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        To send email campaigns, you need to configure your SMTP settings first.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-left">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quick Setup:</p>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Go to Settings &gt; SMTP
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Add your email provider details
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Test the connection
                            </li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
