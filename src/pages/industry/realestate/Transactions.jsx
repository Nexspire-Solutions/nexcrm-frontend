/**
 * Transactions / Deals Management
 * Deal pipeline and transaction lifecycle
 */

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiDollarSign, FiHome, FiUser, FiCalendar, FiCheck, FiX, FiChevronRight, FiMoreVertical } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Transactions = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'pipeline'
    const [pipeline, setPipeline] = useState({});
    const [filters, setFilters] = useState({
        status: '',
        transaction_type: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        property_id: '',
        transaction_type: 'sale',
        buyer_name: '',
        buyer_phone: '',
        buyer_email: '',
        listing_price: '',
        final_price: '',
        token_amount: '',
        payment_mode: 'full_payment'
    });
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchTransactions();
        fetchStats();
        if (viewMode === 'pipeline') {
            fetchPipeline();
        }
    }, [viewMode, filters]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(
                Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            );
            const response = await apiClient.get(`/transactions?${params}`);
            setTransactions(response.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/transactions/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const fetchPipeline = async () => {
        try {
            const response = await apiClient.get('/transactions/pipeline');
            setPipeline(response.data.data || {});
        } catch (error) {
            console.error('Failed to fetch pipeline');
        }
    };

    const fetchProperties = async () => {
        try {
            const response = await apiClient.get('/properties?status=available&limit=100');
            setProperties(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch properties');
        }
    };

    const handleOpenModal = () => {
        fetchProperties();
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/transactions', formData);
            toast.success('Transaction created successfully');
            setShowModal(false);
            setFormData({
                property_id: '', transaction_type: 'sale', buyer_name: '',
                buyer_phone: '', buyer_email: '', listing_price: '',
                final_price: '', token_amount: '', payment_mode: 'full_payment'
            });
            fetchTransactions();
            fetchStats();
            if (viewMode === 'pipeline') fetchPipeline();
        } catch (error) {
            toast.error('Failed to create transaction');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await apiClient.patch(`/transactions/${id}/status`, { status });
            toast.success('Status updated');
            fetchTransactions();
            fetchStats();
            if (viewMode === 'pipeline') fetchPipeline();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    const getStatusColor = (status) => {
        const colors = {
            'inquiry': 'bg-slate-100 text-slate-700',
            'negotiation': 'bg-blue-100 text-blue-700',
            'token_received': 'bg-indigo-100 text-indigo-700',
            'agreement_drafted': 'bg-purple-100 text-purple-700',
            'agreement_signed': 'bg-violet-100 text-violet-700',
            'loan_processing': 'bg-amber-100 text-amber-700',
            'registration_scheduled': 'bg-orange-100 text-orange-700',
            'registration_done': 'bg-teal-100 text-teal-700',
            'possession_given': 'bg-cyan-100 text-cyan-700',
            'completed': 'bg-emerald-100 text-emerald-700',
            'cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const pipelineStatuses = ['negotiation', 'token_received', 'agreement_signed', 'loan_processing', 'registration_scheduled', 'registration_done'];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your property deals</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 text-sm rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''
                                }`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={`px-4 py-2 text-sm rounded-md transition-all ${viewMode === 'pipeline' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''
                                }`}
                        >
                            Pipeline
                        </button>
                    </div>
                    <button onClick={handleOpenModal} className="btn-primary">
                        <FiPlus className="w-4 h-4" /> New Deal
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card p-4">
                        <p className="text-sm text-slate-500">Total Deals</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.overall?.total || 0}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-500">In Progress</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.overall?.in_progress || 0}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-500">Completed Value</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.overall?.total_value)}</p>
                    </div>
                    <div className="card p-4">
                        <p className="text-sm text-slate-500">Commission Earned</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats.overall?.total_commission)}</p>
                    </div>
                </div>
            )}

            {/* Pipeline View */}
            {viewMode === 'pipeline' && (
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max">
                        {pipelineStatuses.map((status) => (
                            <div key={status} className="w-72 flex-shrink-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-slate-900 dark:text-white capitalize">
                                        {status.replace(/_/g, ' ')}
                                    </h3>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        {pipeline[status]?.length || 0}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {(pipeline[status] || []).map((deal) => (
                                        <div
                                            key={deal.id}
                                            onClick={() => navigate(`/transactions/${deal.id}`)}
                                            className="card p-4 cursor-pointer hover:shadow-lg transition-all"
                                        >
                                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                                {deal.property_title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">{deal.city}</p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-sm font-semibold text-indigo-600">
                                                    {formatCurrency(deal.final_price)}
                                                </span>
                                                <span className="text-xs text-slate-500">{deal.buyer_name?.split(' ')[0]}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!pipeline[status] || pipeline[status].length === 0) && (
                                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center text-sm text-slate-400">
                                            No deals
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Buyer</th>
                                    <th>Type</th>
                                    <th>Deal Value</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8">
                                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-slate-500">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((txn) => (
                                        <tr key={txn.id} className="cursor-pointer" onClick={() => navigate(`/transactions/${txn.id}`)}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        <FiHome className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{txn.property_title}</p>
                                                        <p className="text-xs text-slate-500">{txn.transaction_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="text-sm">{txn.buyer_name}</p>
                                                <p className="text-xs text-slate-500">{txn.buyer_phone}</p>
                                            </td>
                                            <td>
                                                <span className="capitalize">{txn.transaction_type}</span>
                                            </td>
                                            <td className="font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(txn.final_price)}
                                            </td>
                                            <td className="text-emerald-600">
                                                {formatCurrency(txn.commission_amount)}
                                            </td>
                                            <td>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(txn.status)}`}>
                                                    {txn.status?.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="text-sm text-slate-500">
                                                {new Date(txn.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create New Deal</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label">Property *</label>
                                <select
                                    value={formData.property_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, property_id: e.target.value }))}
                                    className="select"
                                    required
                                >
                                    <option value="">Select Property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.title} - {p.city}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Transaction Type</label>
                                    <select
                                        value={formData.transaction_type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, transaction_type: e.target.value }))}
                                        className="select"
                                    >
                                        <option value="sale">Sale</option>
                                        <option value="rent">Rent</option>
                                        <option value="lease">Lease</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Payment Mode</label>
                                    <select
                                        value={formData.payment_mode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, payment_mode: e.target.value }))}
                                        className="select"
                                    >
                                        <option value="full_payment">Full Payment</option>
                                        <option value="home_loan">Home Loan</option>
                                        <option value="part_loan">Part Loan</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Buyer Name *</label>
                                    <input
                                        type="text"
                                        value={formData.buyer_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, buyer_name: e.target.value }))}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Buyer Phone *</label>
                                    <input
                                        type="tel"
                                        value={formData.buyer_phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, buyer_phone: e.target.value }))}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="label">Listing Price</label>
                                    <input
                                        type="number"
                                        value={formData.listing_price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, listing_price: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label">Final Price</label>
                                    <input
                                        type="number"
                                        value={formData.final_price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, final_price: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label">Token Amount</label>
                                    <input
                                        type="number"
                                        value={formData.token_amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, token_amount: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Deal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
