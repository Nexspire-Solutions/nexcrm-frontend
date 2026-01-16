/**
 * Legal Invoices - CRM Frontend
 * 
 * Invoice listing and management
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFileText, FiDollarSign, FiSend, FiEye, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';

export default function LegalInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchInvoices();
        fetchStats();
    }, [filterStatus]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const params = filterStatus ? `?status=${filterStatus}` : '';
            const response = await apiClient.get(`/legal-billing/invoices${params}`);
            setInvoices(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch invoices');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/legal-billing/invoices/stats');
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleSend = async (id) => {
        try {
            await apiClient.put(`/legal-billing/invoices/${id}/status`, { status: 'sent' });
            toast.success('Invoice marked as sent');
            fetchInvoices();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update invoice');
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    const statusColors = {
        draft: 'bg-slate-100 text-slate-700',
        sent: 'bg-blue-100 text-blue-700',
        viewed: 'bg-indigo-100 text-indigo-700',
        paid: 'bg-emerald-100 text-emerald-700',
        partial: 'bg-amber-100 text-amber-700',
        overdue: 'bg-red-100 text-red-700',
        cancelled: 'bg-slate-100 text-slate-500'
    };

    const statusIcons = {
        draft: FiFileText,
        sent: FiSend,
        paid: FiCheckCircle,
        overdue: FiAlertCircle
    };

    if (loading && invoices.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Invoices"
                subtitle="Manage billing and invoices"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Legal' }, { label: 'Invoices' }]}
                actions={<Link to="/legal-invoices/new" className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" /> Create Invoice</Link>}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <FiFileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.total_billed)}</p>
                            <p className="text-sm text-slate-500">Total Billed</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.total_collected)}</p>
                            <p className="text-sm text-slate-500">Collected</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <FiClock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.total_outstanding)}</p>
                            <p className="text-sm text-slate-500">Outstanding</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <FiAlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.overdue_amount)}</p>
                            <p className="text-sm text-slate-500">Overdue</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['', 'draft', 'sent', 'partial', 'paid', 'overdue'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filterStatus === status
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                    >
                        {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        {status === 'draft' && stats.drafts > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">{stats.drafts}</span>
                        )}
                        {status === 'overdue' && stats.overdue > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">{stats.overdue}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Invoice List */}
            {invoices.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiFileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No invoices found</p>
                    <Link to="/legal-invoices/new" className="btn-primary mt-4 inline-block">Create Your First Invoice</Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {invoices.map(invoice => {
                        const StatusIcon = statusIcons[invoice.status] || FiFileText;
                        return (
                            <div key={invoice.id} className="card p-4 hover:border-indigo-300 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-xl ${statusColors[invoice.status]} flex items-center justify-center`}>
                                            <StatusIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900 dark:text-white">{invoice.invoice_number}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                                                    {invoice.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">{invoice.client_name}</p>
                                            {invoice.case_number && (
                                                <p className="text-xs text-slate-400">{invoice.case_number}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(invoice.total)}</p>
                                            {parseFloat(invoice.balance_due) > 0 && (
                                                <p className="text-sm text-red-600">Due: {formatCurrency(invoice.balance_due)}</p>
                                            )}
                                        </div>
                                        <div className="text-right text-sm text-slate-500">
                                            <p>{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                                            {invoice.due_date && (
                                                <p className="text-xs">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Link to={`/legal-invoices/${invoice.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                                <FiEye className="w-4 h-4 text-slate-600" />
                                            </Link>
                                            {invoice.status === 'draft' && (
                                                <button onClick={() => handleSend(invoice.id)} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                                                    <FiSend className="w-4 h-4 text-indigo-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
