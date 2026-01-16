/**
 * Lawyers / Attorneys - CRM Frontend
 * 
 * Lawyer profiles and performance tracking
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiUser, FiPhone, FiMail, FiAward, FiBriefcase, FiClock, FiDollarSign, FiStar, FiTrendingUp } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';

export default function Lawyers() {
    const [lawyers, setLawyers] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    useEffect(() => {
        fetchLawyers();
        fetchStats();
        fetchLeaderboard();
    }, []);

    const fetchLawyers = async () => {
        try {
            setLoading(true);
            const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
            const response = await apiClient.get(`/lawyers${params}`);
            setLawyers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch lawyers');
            setLawyers([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/lawyers/stats');
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await apiClient.get('/lawyers/leaderboard?period=month');
            setLeaderboard(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard');
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    if (loading && lawyers.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Lawyers"
                subtitle="Manage attorneys and staff"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Legal' }, { label: 'Lawyers' }]}
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowLeaderboard(!showLeaderboard)}
                            className={`btn-secondary flex items-center gap-2 ${showLeaderboard ? 'bg-amber-50 text-amber-700' : ''}`}
                        >
                            <FiTrendingUp className="w-4 h-4" /> Leaderboard
                        </button>
                        <Link to="/lawyers/new" className="btn-primary flex items-center gap-2">
                            <FiPlus className="w-4 h-4" /> Add Lawyer
                        </Link>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                            <p className="text-sm text-slate-500">Total</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active || 0}</p>
                            <p className="text-sm text-slate-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <FiStar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.partners || 0}</p>
                            <p className="text-sm text-slate-500">Partners</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <FiAward className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_won || 0}</p>
                            <p className="text-sm text-slate-500">Cases Won</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            {showLeaderboard && leaderboard.length > 0 && (
                <div className="card p-5 mb-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiTrendingUp className="w-5 h-5 text-amber-600" />
                        This Month's Leaderboard
                    </h3>
                    <div className="space-y-3">
                        {leaderboard.slice(0, 5).map((lawyer, idx) => (
                            <div key={lawyer.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-amber-400 text-white' :
                                    idx === 1 ? 'bg-slate-400 text-white' :
                                        idx === 2 ? 'bg-amber-700 text-white' :
                                            'bg-slate-200 text-slate-600'
                                    }`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {lawyer.firstName} {lawyer.lastName}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {parseFloat(lawyer.billable_hours || 0).toFixed(1)} hrs billable
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-indigo-600">{formatCurrency(lawyer.billed_amount)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="card p-4 mb-6">
                <form onSubmit={(e) => { e.preventDefault(); fetchLawyers(); }} className="flex gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search lawyers..."
                            className="input pl-10 w-full"
                        />
                    </div>
                    <button type="submit" className="btn-primary">Search</button>
                </form>
            </div>

            {/* Lawyer Cards */}
            {lawyers.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiUser className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No lawyers found</p>
                    <Link to="/lawyers/new" className="btn-primary mt-4 inline-block">Add Your First Lawyer</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lawyers.map(lawyer => (
                        <Link key={lawyer.id} to={`/lawyers/${lawyer.id}`} className="card p-5 hover:border-indigo-300 transition-colors group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    {lawyer.profilePhoto ? (
                                        <img src={lawyer.profilePhoto} alt="" className="w-full h-full rounded-xl object-cover" />
                                    ) : (
                                        <FiUser className="w-7 h-7 text-indigo-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 truncate">
                                        {lawyer.firstName} {lawyer.lastName}
                                    </h3>
                                    <p className="text-sm text-slate-500">{lawyer.specialization || 'General Practice'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {lawyer.is_partner && (
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">Partner</span>
                                        )}
                                        {lawyer.is_senior && (
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">Senior</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-center border-t border-slate-100 dark:border-slate-700 pt-4">
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{lawyer.active_cases || 0}</p>
                                    <p className="text-xs text-slate-500">Active Cases</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-emerald-600">{lawyer.cases_won || 0}</p>
                                    <p className="text-xs text-slate-500">Won</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{lawyer.experience_years || 0}</p>
                                    <p className="text-xs text-slate-500">Yrs Exp</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="text-slate-500">
                                    <FiClock className="w-4 h-4 inline mr-1" />
                                    {formatCurrency(lawyer.hourly_rate)}/hr
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${lawyer.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                    lawyer.status === 'on_leave' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                    {lawyer.status}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
