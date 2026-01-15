/**
 * Legal Clients - CRM Frontend
 * 
 * Client listing and management
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiUsers, FiPhone, FiMail, FiMoreVertical, FiEdit, FiTrash2, FiEye, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import apiClient from '../../../utils/apiClient';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';

export default function LegalClients() {
    const [clients, setClients] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        client_type: 'individual',
        name: '',
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        source: 'referral'
    });

    useEffect(() => {
        fetchClients();
        fetchStats();
    }, [filterStatus]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus) params.append('status', filterStatus);
            const response = await apiClient.get(`/legal-clients?${params.toString()}`);
            setClients(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch clients');
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/legal-clients/stats');
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchClients();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/legal-clients', formData);
            toast.success('Client added successfully');
            setShowModal(false);
            setFormData({ client_type: 'individual', name: '', company_name: '', contact_person: '', email: '', phone: '', address: '', source: 'referral' });
            fetchClients();
            fetchStats();
        } catch (error) {
            toast.error('Failed to add client');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this client?')) return;
        try {
            await apiClient.delete(`/legal-clients/${id}`);
            toast.success('Client deactivated');
            fetchClients();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete client');
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    if (loading && clients.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Clients"
                subtitle="Manage your legal clients"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Legal' }, { label: 'Clients' }]}
                actions={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" /> Add Client</button>}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <FiUsers className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                            <p className="text-sm text-slate-500">Total Clients</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FiUsers className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active || 0}</p>
                            <p className="text-sm text-slate-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <FiDollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.total_collected)}</p>
                            <p className="text-sm text-slate-500">Collected</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <FiDollarSign className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.total_outstanding)}</p>
                            <p className="text-sm text-slate-500">Outstanding</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search clients..."
                            className="input pl-10 w-full"
                        />
                    </form>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="select w-40"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Client List */}
            {clients.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiUsers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No clients found</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Add Your First Client</button>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Client</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Contact</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Cases</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Outstanding</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {clients.map(client => (
                                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                <FiUsers className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{client.name}</p>
                                                <p className="text-xs text-slate-500">{client.client_id} • {client.client_type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm">
                                            {client.email && <p className="flex items-center gap-1 text-slate-600"><FiMail className="w-3 h-3" /> {client.email}</p>}
                                            {client.phone && <p className="flex items-center gap-1 text-slate-500"><FiPhone className="w-3 h-3" /> {client.phone}</p>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FiBriefcase className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">{client.total_cases || 0}</span>
                                            <span className="text-sm text-slate-500">({client.active_cases || 0} active)</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`font-semibold ${parseFloat(client.outstanding_balance) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {formatCurrency(client.outstanding_balance)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link to={`/legal-clients/${client.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                                <FiEye className="w-4 h-4 text-slate-600" />
                                            </Link>
                                            <Link to={`/legal-clients/${client.id}/edit`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                                <FiEdit className="w-4 h-4 text-slate-600" />
                                            </Link>
                                            <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                                <FiTrash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Client Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add New Client</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Client Type</label>
                                    <select value={formData.client_type} onChange={(e) => setFormData({ ...formData, client_type: e.target.value })} className="select w-full">
                                        <option value="individual">Individual</option>
                                        <option value="company">Company</option>
                                        <option value="government">Government</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Source</label>
                                    <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="select w-full">
                                        <option value="referral">Referral</option>
                                        <option value="website">Website</option>
                                        <option value="advertisement">Advertisement</option>
                                        <option value="walk_in">Walk-in</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label">Name *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input w-full" required />
                            </div>
                            {formData.client_type === 'company' && (
                                <>
                                    <div>
                                        <label className="label">Company Name</label>
                                        <input type="text" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="input w-full" />
                                    </div>
                                    <div>
                                        <label className="label">Contact Person</label>
                                        <input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="input w-full" />
                                    </div>
                                </>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input w-full" />
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input w-full" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Address</label>
                                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input w-full" rows={2} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary">Add Client</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
