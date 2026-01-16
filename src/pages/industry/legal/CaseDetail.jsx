/**
 * Legal Case Detail Page - CRM Frontend
 * 
 * Comprehensive view of a specific case, including hearings, documents, and billing.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FiBriefcase, FiUser, FiClock, FiFileText,
    FiPlus, FiEdit, FiTrash2, FiMapPin, FiCalendar,
    FiMessageSquare, FiDollarSign, FiChevronRight, FiAlertCircle
} from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

export default function CaseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchCaseData();
    }, [id]);

    const fetchCaseData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/cases/${id}`);
            setCaseData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch case details:', error);
            toast.error('Failed to load case information');
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

    if (!caseData) {
        return (
            <div className="p-12 text-center">
                <FiAlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Case Not Found</h2>
                <p className="text-slate-500 mt-2">The case you're looking for doesn't exist or has been removed.</p>
                <button onClick={() => navigate('/cases')} className="btn-primary mt-6">Back to Cases</button>
            </div>
        );
    }

    const hearingColumns = [
        { header: 'Date', render: (row) => new Date(row.hearing_date).toLocaleDateString() },
        { header: 'Time', accessor: 'hearing_time' },
        { header: 'Type', accessor: 'hearing_type' },
        { header: 'Purpose', accessor: 'purpose' },
        { header: 'Court/Room', render: (row) => `${row.court_name || '-'} / ${row.court_room || '-'}` }
    ];

    const documentColumns = [
        { header: 'File Name', accessor: 'file_name', className: 'font-medium' },
        { header: 'Type', accessor: 'document_type' },
        { header: 'Uploaded', render: (row) => new Date(row.created_at).toLocaleDateString() },
        {
            header: 'Actions', align: 'right', render: (row) => (
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <FiFileText className="w-4 h-4 text-slate-400" />
                </button>
            )
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title={caseData.title}
                subtitle={`Case #: ${caseData.case_number}`}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Legal' },
                    { label: 'Cases', to: '/cases' },
                    { label: 'Detail' }
                ]}
                actions={
                    <div className="flex gap-2">
                        <Link to={`/cases/${id}/edit`} className="btn-secondary flex items-center gap-2">
                            <FiEdit className="w-4 h-4" /> Edit
                        </Link>
                        <button className="btn-primary flex items-center gap-2">
                            <FiPlus className="w-4 h-4" /> Log Activity
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar - Case Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <ProCard>
                        <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                    <FiBriefcase className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <StatusBadge status={caseData.status} variant={caseData.status === 'closed' ? 'success' : 'info'} />
                                    <p className="text-xs text-slate-500 mt-1 capitalize">{caseData.case_type}</p>
                                </div>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{caseData.title}</h2>
                        </div>

                        <div className="py-6 space-y-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Client</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <FiUser className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <Link to={`/legal-clients/${caseData.client_id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 truncate block">
                                            {caseData.client_name || 'Select Client'}
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Court Info</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <FiMapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="text-slate-900 dark:text-white font-medium">{caseData.court_name || 'N/A'}</p>
                                            <p className="text-slate-500 text-xs">Court Case #: {caseData.court_case_number || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <FiCalendar className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-500">Filed:</span>
                                        <span className="text-slate-900 dark:text-white font-medium">
                                            {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Opposing Info</p>
                                <div className="text-sm space-y-1">
                                    <p className="text-slate-900 dark:text-white"><span className="text-slate-500">Party:</span> {caseData.opposing_party || '-'}</p>
                                    <p className="text-slate-900 dark:text-white"><span className="text-slate-500">Counsel:</span> {caseData.opposing_counsel || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </ProCard>

                    {/* Financial Summary */}
                    <ProCard title="Billing Summary">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm py-1">
                                <span className="text-slate-500">Fee Type</span>
                                <span className="font-medium text-slate-900 dark:text-white capitalize">{caseData.fee_type || 'fixed'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <span className="text-slate-500">Estimated Fee</span>
                                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(caseData.estimated_fee)}</span>
                            </div>
                            <div className="pt-2">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                                    <p className="text-xs text-indigo-600 font-medium mb-1">Total Billed</p>
                                    <p className="text-xl font-bold text-indigo-700">{formatCurrency(caseData.total_billed || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </ProCard>
                </div>

                {/* Right Content Area - Tabs */}
                <div className="lg:col-span-3">
                    <div className="card bg-white dark:bg-slate-800 overflow-hidden">
                        <div className="flex border-b border-slate-100 dark:border-slate-700">
                            {[
                                { id: 'overview', label: 'Case Overview', icon: FiBriefcase },
                                { id: 'hearings', label: 'Hearings', icon: FiCalendar },
                                { id: 'documents', label: 'Documents', icon: FiFileText },
                                { id: 'billing', label: 'Billing', icon: FiDollarSign }
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
                            {activeTab === 'overview' && (
                                <div className="p-6">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Case Description</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                        {caseData.description || 'No description provided for this case.'}
                                    </p>

                                    <div className="mt-8">
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Case Team</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                                                    {caseData.lawyer_name?.charAt(0) || 'L'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{caseData.lawyer_name || 'Assigned Lawyer'}</p>
                                                    <p className="text-xs text-slate-500">Lead Counsel</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'hearings' && (
                                <ProTable
                                    columns={hearingColumns}
                                    data={caseData.hearings || []}
                                    emptyMessage="No hearings scheduled yet."
                                />
                            )}

                            {activeTab === 'documents' && (
                                <ProTable
                                    columns={documentColumns}
                                    data={caseData.documents || []}
                                    emptyMessage="No documents uploaded to this case."
                                />
                            )}

                            {activeTab === 'billing' && (
                                <div className="py-20 text-center text-slate-500">
                                    <FiDollarSign className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p>Billing history feature coming soon.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
