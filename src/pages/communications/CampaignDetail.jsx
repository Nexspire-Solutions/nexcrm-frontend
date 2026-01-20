import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { campaignsAPI } from '../../api';

const statusColors = {
    pending: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    opened: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    clicked: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    bounced: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

export default function CampaignDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [campaignRes, analyticsRes] = await Promise.all([
                campaignsAPI.getById(id),
                campaignsAPI.getAnalytics(id)
            ]);
            setCampaign(campaignRes.data || campaignRes);
            setAnalytics(analyticsRes.data || analyticsRes);
        } catch (error) {
            console.error('Failed to load campaign:', error);
            toast.error('Failed to load campaign details');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = campaign?.logs?.filter(log =>
        filterStatus === 'all' || log.status === filterStatus
    ) || [];

    const statusCounts = campaign?.logs?.reduce((acc, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
    }, {}) || {};

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Campaign not found</p>
                <button onClick={() => navigate('/communications/campaigns')} className="btn-secondary mt-4">
                    Back to Campaigns
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/communications/campaigns')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{campaign.name}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {campaign.template_name && `Template: ${campaign.template_name}`}
                            {campaign.sent_at && ` • Sent ${new Date(campaign.sent_at).toLocaleDateString()}`}
                        </p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[campaign.status] || statusColors.pending}`}>
                    {campaign.status}
                </span>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-all"
                    onClick={() => setFilterStatus('sent')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.delivered || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Delivered</p>
                        </div>
                    </div>
                </div>
                <div
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-all"
                    onClick={() => setFilterStatus('opened')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.unique_opens || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Opened</p>
                        </div>
                    </div>
                </div>
                <div
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-purple-500 transition-all"
                    onClick={() => setFilterStatus('clicked')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.unique_clicks || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Clicked</p>
                        </div>
                    </div>
                </div>
                <div
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-all"
                    onClick={() => setFilterStatus('opened')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics?.open_rate || 0}%</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Open Rate</p>
                        </div>
                    </div>
                </div>
                <div
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-purple-500 transition-all"
                    onClick={() => setFilterStatus('clicked')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics?.click_rate || 0}%</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Click Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filter:</span>
                {['all', 'sent', 'opened', 'clicked', 'failed', 'bounced'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status !== 'all' && statusCounts[status] ? ` (${statusCounts[status]})` : status === 'all' ? ` (${campaign.logs?.length || 0})` : ''}
                    </button>
                ))}
            </div>

            {/* Recipients Table */}
            <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Recipients</h3>
                </div>
                {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400">No recipients {filterStatus !== 'all' ? `with status "${filterStatus}"` : ''}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Opens</th>
                                    <th>Clicks</th>
                                    <th>Sent At</th>
                                    <th>Opened At</th>
                                    <th>Clicked At</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="font-medium text-slate-900 dark:text-white">{log.recipient_email}</td>
                                        <td className="text-slate-600 dark:text-slate-400">{log.recipient_name || '-'}</td>
                                        <td>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[log.status]}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="text-slate-600 dark:text-slate-400">
                                            {log.open_count > 0 && (
                                                <span className="inline-flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {log.open_count}
                                                </span>
                                            )}
                                            {!log.open_count && '-'}
                                        </td>
                                        <td className="text-slate-600 dark:text-slate-400">
                                            {log.click_count > 0 && (
                                                <span className="inline-flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.414 1.415l.708-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                                                    </svg>
                                                    {log.click_count}
                                                </span>
                                            )}
                                            {!log.click_count && '-'}
                                        </td>
                                        <td className="text-sm text-slate-500 dark:text-slate-400">
                                            {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                                        </td>
                                        <td className="text-sm text-slate-500 dark:text-slate-400">
                                            {log.opened_at ? new Date(log.opened_at).toLocaleString() : '-'}
                                        </td>
                                        <td className="text-sm text-slate-500 dark:text-slate-400">
                                            {log.clicked_at ? new Date(log.clicked_at).toLocaleString() : '-'}
                                        </td>
                                        <td className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                            {log.open_ip && <div title="Open IP">O: {log.open_ip}</div>}
                                            {log.click_ip && <div title="Click IP">C: {log.click_ip}</div>}
                                            {!log.open_ip && !log.click_ip && '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
