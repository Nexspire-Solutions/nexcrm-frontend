import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiEdit2, FiEye, FiFileText, FiPlus, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../../../api/axios';
import ProHeader from '../../../components/common/ProHeader';

function formatCurrency(amount, symbol = '₹') {
    return `${symbol}${(parseFloat(amount) || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function formatMoney(amount, symbol) {
    const safeSymbol = symbol || 'Rs. ';
    return `${safeSymbol}${(parseFloat(amount) || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function formatPercent(value) {
    return `${(Number(value) || 0).toFixed(1)}%`;
}

export default function ManufacturingInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/invoices/records', {
                params: {
                    invoice_context: 'manufacturing',
                    status: statusFilter || undefined
                }
            });
            setInvoices(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch manufacturing invoices:', error);
            toast.error('Failed to load invoices');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/invoices/records/stats', {
                params: { invoice_context: 'manufacturing' }
            });
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Failed to fetch invoice stats:', error);
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchStats();
    }, [statusFilter]);

    const markAsSent = async (invoiceId) => {
        try {
            await apiClient.put(`/invoices/records/${invoiceId}/status`, { status: 'sent' });
            toast.success('Invoice marked as sent');
            fetchInvoices();
            fetchStats();
        } catch (error) {
            console.error('Failed to update invoice status:', error);
            toast.error('Failed to update invoice');
        }
    };

    const recordPayment = async (invoice) => {
        const amount = window.prompt('Payment amount', invoice.balance_due || invoice.total || 0);
        if (amount === null) return;
        const paymentMethod = window.prompt('Payment method', 'bank_transfer');
        if (paymentMethod === null) return;
        const referenceNumber = window.prompt('Reference number', '') ?? '';
        const notes = window.prompt('Payment notes', '') ?? '';
        const paymentDate = window.prompt('Payment date (YYYY-MM-DD)', new Date().toISOString().split('T')[0]);
        if (paymentDate === null) return;

        try {
            await apiClient.post(`/invoices/records/${invoice.id}/payments`, {
                amount: Number(amount || 0),
                payment_date: paymentDate,
                payment_method: paymentMethod || 'bank_transfer',
                reference_number: referenceNumber,
                notes
            });
            toast.success('Payment recorded');
            fetchInvoices();
            fetchStats();
        } catch (error) {
            console.error('Failed to record payment:', error);
            toast.error(error.response?.data?.error || 'Failed to record payment');
        }
    };

    const statusClasses = {
        draft: 'bg-slate-100 text-slate-700',
        sent: 'bg-blue-100 text-blue-700',
        viewed: 'bg-indigo-100 text-indigo-700',
        partial: 'bg-amber-100 text-amber-700',
        paid: 'bg-emerald-100 text-emerald-700',
        overdue: 'bg-red-100 text-red-700',
        cancelled: 'bg-slate-100 text-slate-500'
    };

    const collectionRate = Number(stats.total_billed || 0) > 0
        ? (Number(stats.total_collected || 0) / Number(stats.total_billed || 0)) * 100
        : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Manufacturing Invoices"
                subtitle="Generate and track factory billing records"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Manufacturing' }, { label: 'Invoices' }]}
                actions={<Link to="/manufacturing-invoices/new" className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" /> New Invoice</Link>}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <p className="text-sm text-slate-500">Total Billed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatMoney(stats.total_billed)}</p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-slate-500">Outstanding</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatMoney(stats.total_outstanding)}</p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-slate-500">Paid</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.paid || 0}</p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-slate-500">Drafts</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.drafts || 0}</p>
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['', 'draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${statusFilter === status
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
                    </button>
                ))}
            </div>

            <div className="card p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Collected</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {formatMoney(stats.total_collected)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Collection Rate</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {formatPercent(collectionRate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Partial Invoices</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats.partial || 0}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Payment Entries</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats.payment_entries || 0}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card p-8">
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
                    </div>
                </div>
            ) : invoices.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiFileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 mb-4">No invoices found</p>
                    <Link to="/manufacturing-invoices/new" className="btn-primary inline-flex items-center gap-2">
                        <FiPlus className="w-4 h-4" />
                        Create Your First Invoice
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {invoices.map(invoice => (
                        <div key={invoice.id} className="card p-4 hover:border-indigo-300 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-slate-900 dark:text-white">{invoice.invoice_number}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusClasses[invoice.status] || statusClasses.draft}`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{invoice.client_name || invoice.billing_name}</p>
                                    {invoice.title && <p className="text-xs text-slate-400 mt-1">{invoice.title}</p>}
                                </div>

                                <div className="text-right">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatMoney(invoice.total, invoice.currency_symbol)}</p>
                                    <p className="text-xs text-slate-500">Due {new Date(invoice.due_date || invoice.invoice_date).toLocaleDateString('en-IN')}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link to={`/manufacturing-invoices/${invoice.id}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                        <FiEye className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                    </Link>
                                    <Link to={`/manufacturing-invoices/${invoice.id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                        <FiEdit2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                    </Link>
                                    {invoice.status === 'draft' && (
                                        <button onClick={() => markAsSent(invoice.id)} className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                            <FiSend className="w-4 h-4 text-indigo-600" />
                                        </button>
                                    )}
                                    {!['paid', 'cancelled'].includes(invoice.status) && (
                                        <button onClick={() => recordPayment(invoice)} className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                                            <FiDollarSign className="w-4 h-4 text-emerald-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
