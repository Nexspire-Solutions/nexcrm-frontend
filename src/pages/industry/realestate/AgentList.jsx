/**
 * Agent Management
 * Manage real estate agents/brokers
 */

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiStar, FiPhone, FiMail, FiMapPin, FiCalendar, FiTrendingUp, FiAward, FiEdit, FiX } from 'react-icons/fi';
import apiClient from '../../../utils/apiClient';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AgentList = () => {
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        user_id: '',
        rera_number: '',
        experience_years: '',
        commission_rate: '2',
        target_monthly: '',
        bio: ''
    });

    useEffect(() => {
        fetchAgents();
        fetchLeaderboard();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/agents');
            setAgents(response.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch agents');
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await apiClient.get('/agents/leaderboard?period=month');
            setLeaderboard(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get('/users?limit=100');
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch users');
        }
    };

    const handleOpenModal = () => {
        fetchUsers();
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/agents', formData);
            toast.success('Agent profile created');
            setShowModal(false);
            setFormData({
                user_id: '', rera_number: '', experience_years: '',
                commission_rate: '2', target_monthly: '', bio: ''
            });
            fetchAgents();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create agent');
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agents</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your real estate team</p>
                </div>
                <button onClick={handleOpenModal} className="btn-primary">
                    <FiPlus className="w-4 h-4" /> Add Agent
                </button>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div className="card p-5">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiAward className="w-5 h-5 text-amber-500" />
                        This Month's Top Performers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {leaderboard.slice(0, 3).map((agent, index) => (
                            <div key={agent.id} className={`p-4 rounded-xl ${index === 0 ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800' :
                                    index === 1 ? 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border border-slate-200 dark:border-slate-700' :
                                        'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${index === 0 ? 'bg-amber-500 text-white' :
                                            index === 1 ? 'bg-slate-400 text-white' :
                                                'bg-orange-400 text-white'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{agent.firstName} {agent.lastName}</p>
                                        <p className="text-sm text-slate-500">{agent.deals_count} deals</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white mt-3">
                                    {formatCurrency(agent.total_value)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Agent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : agents.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No agents found. Add your first agent!
                    </div>
                ) : (
                    agents.map((agent) => (
                        <Link key={agent.id} to={`/agents/${agent.id}`} className="card hover:shadow-lg transition-all overflow-hidden">
                            <div className="h-16 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                            <div className="p-5 -mt-8">
                                <div className="flex items-end gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-2xl font-bold text-indigo-600">
                                        {agent.firstName?.charAt(0)}{agent.lastName?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0 pb-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                            {agent.firstName} {agent.lastName}
                                        </h3>
                                        <p className="text-xs text-slate-500">{agent.agent_code}</p>
                                    </div>
                                    {agent.rating > 0 && (
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <FiStar className="w-4 h-4 fill-current" />
                                            <span className="font-medium">{agent.rating}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{agent.properties_sold || 0}</p>
                                        <p className="text-xs text-slate-500">Sold</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{agent.active_listings || 0}</p>
                                        <p className="text-xs text-slate-500">Active</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{agent.pending_leads || 0}</p>
                                        <p className="text-xs text-slate-500">Leads</p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <FiPhone className="w-4 h-4" />
                                        <span>{agent.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <FiMail className="w-4 h-4" />
                                        <span className="truncate">{agent.email}</span>
                                    </div>
                                    {agent.experience_years && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <FiCalendar className="w-4 h-4" />
                                            <span>{agent.experience_years} years exp.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <span className={`px-2 py-1 rounded-full text-xs ${agent.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                        {agent.status}
                                    </span>
                                    <span className="text-sm font-medium text-indigo-600">
                                        {formatCurrency(agent.total_deals_value)} lifetime
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Add Agent Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create Agent Profile</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Select User *</label>
                                <select
                                    value={formData.user_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                                    className="select"
                                    required
                                >
                                    <option value="">Select a user</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName} - {u.email}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">RERA Number</label>
                                    <input
                                        type="text"
                                        value={formData.rera_number}
                                        onChange={(e) => setFormData(prev => ({ ...prev, rera_number: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label">Experience (years)</label>
                                    <input
                                        type="number"
                                        value={formData.experience_years}
                                        onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Commission Rate (%)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        value={formData.commission_rate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label">Monthly Target (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.target_monthly}
                                        onChange={(e) => setFormData(prev => ({ ...prev, target_monthly: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    className="input"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentList;
