/**
 * Quality Control Page - Manufacturing Module
 */
import { useState, useEffect } from 'react';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

export default function QualityControl() {
    const [checks, setChecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchChecks();
        fetchStats();
    }, [statusFilter]);

    const fetchChecks = async () => {
        try {
            const response = await apiClient.get('/quality', { params: { status: statusFilter || undefined } });
            setChecks(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch quality checks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/quality/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await apiClient.put(`/quality/${id}`, { status });
            toast.success(`Check marked as ${status}`);
            fetchChecks();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        return styles[status] || styles.pending;
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quality Control</h1>
                    <p className="text-slate-500 text-sm">Monitor and manage quality checks</p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Total Checks</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.pending || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Passed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.passed || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{stats.failed || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Pass Rate</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.pass_rate || 0}%</p>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="mb-4 flex gap-2">
                {['', 'pending', 'passed', 'failed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : checks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No quality checks found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Production Order</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Check Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Inspector</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {checks.map((check) => (
                                <tr key={check.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{check.production_order || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{check.product_name || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500 capitalize">{check.check_type || 'Visual'}</td>
                                    <td className="px-4 py-3 text-slate-500">{check.firstName ? `${check.firstName} ${check.lastName}` : '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadge(check.status)}`}>
                                            {check.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {check.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateStatus(check.id, 'passed')}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                                                >
                                                    Pass
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(check.id, 'failed')}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                                                >
                                                    Fail
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
