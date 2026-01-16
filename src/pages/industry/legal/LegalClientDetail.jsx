/**
 * Legal Client Detail Page - CRM Frontend
 * 
 * Comprehensive view of a client's profile, cases, billing, and communications.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase,
    FiDollarSign, FiClock, FiFileText, FiMessageSquare,
    FiPlus, FiEdit, FiTrash2, FiChevronRight, FiAlertCircle
} from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

export default function LegalClientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [cases, setCases] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [communications, setCommunications] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('cases');

    useEffect(() => {
        fetchClientData();
    }, [id]);

    const fetchClientData = async () => {
        try {
            setLoading(true);
            const [clientRes, casesRes, invoicesRes, commsRes] = await Promise.all([
                apiClient.get(`/legal-clients/${id}`),
                apiClient.get(`/cases?client_id=${id}`),
                apiClient.get(`/legal-billing/invoices?client_id=${id}`),
                apiClient.get(`/legal-clients/${id}/communications`) // Assuming this endpoint exists or will be added
            ]);

            setClient(clientRes.data.data);
            setCases(casesRes.data.data || []);
            setInvoices(invoicesRes.data.data || []);
            setCommunications(commsRes.data.data || []);

            // Calculate local stats if backend doesn't provide them
            const totalOutstanding = invoicesRes.data.data?.reduce((sum, inv) => sum + parseFloat(inv.balance_due || 0), 0) || 0;
            const totalPaid = invoicesRes.data.data?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0) || 0;

            setStats({
                total_cases: casesRes.data.data?.length || 0,
                active_cases: casesRes.data.data?.filter(c => c.status !== 'closed' && c.status !== 'won' && c.status !== 'lost').length || 0,
                outstanding: totalOutstanding,
                collected: totalPaid
            });

        } catch (error) {
            console.error('Failed to fetch client details:', error);
            toast.error('Failed to load client information');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="p-12 text-center">
                <FiAlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Client Not Found</h2>
                <p className="text-slate-500 mt-2">The client you're looking for doesn't exist or has been removed.</p>
                <button onClick={() => navigate('/legal-clients')} className="btn-primary mt-6">Back to Clients</button>
            </div>
        );
    }

    const caseColumns = [
        { header: 'Case Name', accessor: 'title', className: 'font-medium' },
        { header: 'Case #', accessor: 'case_number' },
        { header: 'Type', accessor: 'case_type' },
        { header: 'Status', render: (row) => <StatusBadge status={row.status} variant={row.status === 'closed' ? 'success' : 'info'} /> },
        {
            header: 'Actions', align: 'right', render: (row) => (
                <Link to={`/cases/${row.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors inline-block">
                    <FiChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
            )
        }
    ];

    const invoiceColumns = [
        { header: 'Invoice #', accessor: 'invoice_number', className: 'font-medium' },
        { header: 'Date', render: (row) => new Date(row.invoice_date).toLocaleDateString() },
        { header: 'Total', render: (row) => formatCurrency(row.total) },
        {
            header: 'Balance', render: (row) => (
                <span className={parseFloat(row.balance_due) > 0 ? 'text-red-600 font-medium' : 'text-emerald-600'}>
                    {formatCurrency(row.balance_due)}
                </span>
            )
        },
        { header: 'Status', render: (row) => <StatusBadge status={row.status} variant={row.status === 'paid' ? 'success' : row.status === 'overdue' ? 'error' : 'warning'} /> }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title={client.name}
                subtitle={`Client ID: ${client.client_id || id}`}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Legal' },
                    { label: 'Clients', to: '/legal-clients' },
                    { label: 'Detail' }
                ]}
                actions={
                    <div className="flex gap-2">
                        <Link to={`/legal-clients/${id}/edit`} className="btn-secondary flex items-center gap-2">
                            <FiEdit className="w-4 h-4" /> Edit
                        </Link>
                        <Link to="/cases/new" className="btn-primary flex items-center gap-2">
                            <FiPlus className="w-4 h-4" /> New Case
                        </Link>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <ProCard>
                        <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FiUser className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{client.name}</h2>
                            <p className="text-sm text-slate-500 mt-1 capitalize">{client.client_type}</p>
                            <StatusBadge
                                status={client.status}
                                variant={client.status === 'active' ? 'success' : 'neutral'}
                                className="mt-2"
                            />
                        </div>

                        <div className="py-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <FiMail className="w-4 h-4 text-slate-400 mt-1" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p>
                                    <p className="text-sm text-slate-900 dark:text-white truncate">{client.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiPhone className="w-4 h-4 text-slate-400 mt-1" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phone</p>
                                    <p className="text-sm text-slate-900 dark:text-white">{client.phone || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiMapPin className="w-4 h-4 text-slate-400 mt-1" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Address</p>
                                    <p className="text-sm text-slate-900 dark:text-white leading-relaxed">
                                        {client.address_line1}
                                        {client.address_line2 && <><br />{client.address_line2}</>}
                                        <br />{client.city}, {client.state} {client.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {client.pan_number && (
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Identification</p>
                                <div className="flex justify-between items-center text-sm py-1">
                                    <span className="text-slate-500">PAN</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{client.pan_number}</span>
                                </div>
                                {client.gst_number && (
                                    <div className="flex justify-between items-center text-sm py-1">
                                        <span className="text-slate-500">GST</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{client.gst_number}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </ProCard>

                    {/* Financial Summary */}
                    <ProCard title="Financial Overview">
                        <div className="space-y-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                                <p className="text-xs text-emerald-600 font-medium mb-1">Total Collected</p>
                                <p className="text-xl font-bold text-emerald-700">{formatCurrency(stats.collected)}</p>
                            </div>
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl">
                                <p className="text-xs text-rose-600 font-medium mb-1">Outstanding Balance</p>
                                <p className="text-xl font-bold text-rose-700">{formatCurrency(stats.outstanding)}</p>
                            </div>
                        </div>
                    </ProCard>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    {/* Tiny Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="card p-4 bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                                <FiBriefcase className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.total_cases}</p>
                                    <p className="text-xs text-slate-500">Total Cases</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                                <FiClock className="w-5 h-5 text-amber-600" />
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.active_cases}</p>
                                    <p className="text-xs text-slate-500">Active</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                                <FiFileText className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{invoices.length}</p>
                                    <p className="text-xs text-slate-500">Invoices</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                                <FiMessageSquare className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{communications.length}</p>
                                    <p className="text-xs text-slate-500">Comms</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="card bg-white dark:bg-slate-800 overflow-hidden">
                        <div className="flex border-b border-slate-100 dark:border-slate-700">
                            {[
                                { id: 'cases', label: 'Cases', icon: FiBriefcase },
                                { id: 'billing', label: 'Billing & Invoices', icon: FiDollarSign },
                                { id: 'communications', label: 'Communications', icon: FiMessageSquare }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-0">
                            {activeTab === 'cases' && (
                                <ProTable
                                    columns={caseColumns}
                                    data={cases}
                                    isLoading={false}
                                    emptyMessage="No cases assigned to this client yet."
                                />
                            )}
                            {activeTab === 'billing' && (
                                <ProTable
                                    columns={invoiceColumns}
                                    data={invoices}
                                    isLoading={false}
                                    emptyMessage="No invoices found for this client."
                                />
                            )}
                            {activeTab === 'communications' && (
                                <div>
                                    {communications.length === 0 ? (
                                        <div className="py-20 text-center text-slate-500">
                                            <FiMessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                            <p>No communication logs found.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {communications.map(comm => (
                                                <div key={comm.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${comm.direction === 'inbound' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                                                }`}>
                                                                <FiMessageSquare className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-slate-900 dark:text-white">{comm.subject || 'No Subject'}</h4>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{comm.content}</p>
                                                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                                                                    <span className="capitalize">{comm.communication_type}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(comm.communicated_at).toLocaleString()}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${comm.direction === 'inbound' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                                                            }`}>
                                                            {comm.direction}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
