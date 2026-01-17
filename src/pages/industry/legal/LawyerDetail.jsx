/**
 * Lawyer Detail Page - CRM Frontend
 * 
 * Comprehensive view of a lawyer's profile including cases, time entries, and performance.
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    FiUser, FiMail, FiPhone, FiBriefcase, FiAward, FiClock, FiDollarSign,
    FiEdit, FiCalendar, FiBook, FiFileText, FiArrowLeft, FiAlertCircle
} from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';

export default function LawyerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lawyer, setLawyer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchLawyer();
    }, [id]);

    const fetchLawyer = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/lawyers/${id}`);
            setLawyer(response.data.data);
        } catch (error) {
            console.error('Failed to fetch lawyer:', error);
            toast.error('Failed to load lawyer profile');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    const parseJSON = (str) => {
        try {
            return typeof str === 'string' ? JSON.parse(str) : (str || []);
        } catch {
            return [];
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!lawyer) {
        return (
            <div className="p-12 text-center">
                <FiAlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lawyer Not Found</h2>
                <p className="text-slate-500 mt-2">The lawyer profile you're looking for doesn't exist.</p>
                <button onClick={() => navigate('/lawyers')} className="btn-primary mt-6">Back to Lawyers</button>
            </div>
        );
    }

    const education = parseJSON(lawyer.education);
    const certifications = parseJSON(lawyer.certifications);

    const caseColumns = [
        { header: 'Case #', accessor: 'case_number', className: 'font-medium' },
        { header: 'Title', accessor: 'title' },
        { header: 'Client', accessor: 'client_name' },
        {
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />
        }
    ];

    const timeColumns = [
        { header: 'Date', render: (row) => new Date(row.entry_date).toLocaleDateString() },
        { header: 'Hours', accessor: 'hours' },
        { header: 'Case', accessor: 'case_title' },
        { header: 'Amount', render: (row) => formatCurrency(row.hours * (row.hourly_rate || lawyer.hourly_rate)) }
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <ProHeader
                title={`${lawyer.firstName || ''} ${lawyer.lastName || ''}`}
                subtitle={lawyer.specialization || 'Attorney'}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Legal' },
                    { label: 'Lawyers', to: '/lawyers' },
                    { label: 'Profile' }
                ]}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/lawyers')} className="btn-secondary flex items-center gap-2">
                            <FiArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <Link to={`/lawyers/${id}/edit`} className="btn-primary flex items-center gap-2">
                            <FiEdit className="w-4 h-4" /> Edit Profile
                        </Link>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <ProCard>
                        <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                                {lawyer.profilePhoto ? (
                                    <img src={lawyer.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <FiUser className="w-12 h-12 text-indigo-600" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {lawyer.firstName} {lawyer.lastName}
                            </h2>
                            <p className="text-slate-500">{lawyer.designation?.replace('_', ' ') || 'Attorney'}</p>
                            <div className="flex justify-center gap-2 mt-3">
                                {lawyer.is_partner && (
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Partner</span>
                                )}
                                {lawyer.is_senior && (
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Senior Advocate</span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${lawyer.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                        lawyer.status === 'on_leave' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-700'
                                    }`}>
                                    {lawyer.status}
                                </span>
                            </div>
                        </div>

                        <div className="py-6 space-y-4">
                            {lawyer.email && (
                                <div className="flex items-center gap-3">
                                    <FiMail className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-300">{lawyer.email}</span>
                                </div>
                            )}
                            {lawyer.phone && (
                                <div className="flex items-center gap-3">
                                    <FiPhone className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-300">{lawyer.phone}</span>
                                </div>
                            )}
                            {lawyer.bar_number && (
                                <div className="flex items-center gap-3">
                                    <FiAward className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-slate-600 dark:text-slate-300">{lawyer.bar_number}</p>
                                        <p className="text-xs text-slate-500">{lawyer.bar_council}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ProCard>

                    {/* Stats */}
                    <ProCard title="Performance">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{lawyer.active_cases || 0}</p>
                                <p className="text-xs text-slate-500">Active Cases</p>
                            </div>
                            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-emerald-600">{lawyer.cases_won || 0}</p>
                                <p className="text-xs text-slate-500">Cases Won</p>
                            </div>
                            <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-indigo-600">{lawyer.experience_years || 0}</p>
                                <p className="text-xs text-slate-500">Years Exp</p>
                            </div>
                            <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <p className="text-2xl font-bold text-amber-600">{formatCurrency(lawyer.hourly_rate)}</p>
                                <p className="text-xs text-slate-500">Per Hour</p>
                            </div>
                        </div>
                    </ProCard>
                </div>

                {/* Right - Tabs */}
                <div className="lg:col-span-2">
                    <div className="card bg-white dark:bg-slate-800 overflow-hidden">
                        <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto">
                            {[
                                { id: 'overview', label: 'Overview', icon: FiUser },
                                { id: 'cases', label: 'Cases', icon: FiBriefcase },
                                { id: 'time', label: 'Time Entries', icon: FiClock },
                                { id: 'education', label: 'Education', icon: FiBook }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {lawyer.bio && (
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Biography</h3>
                                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{lawyer.bio}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-2">Specialization</h4>
                                            <p className="text-slate-900 dark:text-white">{lawyer.specialization || 'General Practice'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-2">Languages</h4>
                                            <p className="text-slate-900 dark:text-white">{lawyer.languages || '-'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-2">Courts Practiced</h4>
                                            <p className="text-slate-900 dark:text-white">{lawyer.courts_practiced || '-'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500 mb-2">Enrollment Date</h4>
                                            <p className="text-slate-900 dark:text-white">
                                                {lawyer.enrollment_date ? new Date(lawyer.enrollment_date).toLocaleDateString() : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'cases' && (
                                <ProTable
                                    columns={caseColumns}
                                    data={lawyer.cases || []}
                                    emptyMessage="No cases assigned to this lawyer."
                                />
                            )}

                            {activeTab === 'time' && (
                                <ProTable
                                    columns={timeColumns}
                                    data={lawyer.recentTimeEntries || []}
                                    emptyMessage="No time entries found."
                                />
                            )}

                            {activeTab === 'education' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Education</h3>
                                        {education.length === 0 ? (
                                            <p className="text-slate-500">No education records added.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {education.map((edu, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                        <p className="font-medium text-slate-900 dark:text-white">{edu.degree}</p>
                                                        <p className="text-sm text-slate-500">{edu.institution} • {edu.year}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Certifications</h3>
                                        {certifications.length === 0 ? (
                                            <p className="text-slate-500">No certifications added.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {certifications.map((cert, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-start gap-3">
                                                        <FiAward className="w-5 h-5 text-amber-500 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{cert.name}</p>
                                                            <p className="text-sm text-slate-500">{cert.issuer} • {cert.year}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
