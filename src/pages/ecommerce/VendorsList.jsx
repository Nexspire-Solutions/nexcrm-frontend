import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/**
 * Vendors Management Page - Marketplace
 */
const VendorsList = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [status, setStatus] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(null);

    useEffect(() => {
        fetchVendors();
        fetchStats();
    }, [status]);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);

            const response = await apiClient.get(`/vendors?${params}`);
            setVendors(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/vendors/stats');
            setStats(response.data.stats || {});
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleStatusChange = async (vendorId, newStatus) => {
        try {
            await apiClient.patch(`/vendors/${vendorId}/status`, { status: newStatus });
            toast.success('Vendor status updated');
            fetchVendors();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Vendor Management</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage marketplace vendors</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Vendors</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Pending Approval</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.approved || 0}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Approved</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{(stats.total_sales || 0).toLocaleString()}</p>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Sales</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {/* Vendors Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Commission</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4">Sales</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="empty-state">
                                            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <h3 className="empty-state-title">No vendors yet</h3>
                                            <p className="empty-state-text">Vendors will appear here when they register</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                vendors.map(vendor => (
                                    <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                                                    {vendor.logo ? (
                                                        <img src={vendor.logo} alt="" className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
                                                            {vendor.company_name?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-900 dark:text-white">{vendor.company_name}</span>
                                                    {vendor.is_verified && (
                                                        <span className="ml-2 text-emerald-500">✓</span>
                                                    )}
                                                    <p className="text-xs text-slate-500">{vendor.city}, {vendor.state}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-900 dark:text-white">{vendor.email}</p>
                                            <p className="text-xs text-slate-500">{vendor.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-indigo-600">{vendor.commission_rate || 10}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{vendor.total_orders || 0}</td>
                                        <td className="px-6 py-4 font-semibold text-emerald-600">
                                            ₹{(vendor.total_sales || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vendor.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    vendor.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        vendor.status === 'suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                                                }`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedVendor(vendor)}
                                                    className="btn-ghost btn-sm text-indigo-600"
                                                >
                                                    View
                                                </button>
                                                {vendor.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(vendor.id, 'approved')}
                                                            className="btn-ghost btn-sm text-emerald-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(vendor.id, 'rejected')}
                                                            className="btn-ghost btn-sm text-red-600"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {vendor.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusChange(vendor.id, 'suspended')}
                                                        className="btn-ghost btn-sm text-red-600"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Vendor Detail Modal */}
            {selectedVendor && (
                <VendorDetailModal
                    vendor={selectedVendor}
                    onClose={() => setSelectedVendor(null)}
                />
            )}
        </div>
    );
};

/**
 * Vendor Detail Modal
 */
const VendorDetailModal = ({ vendor, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, [vendor.id]);

    const fetchDetails = async () => {
        try {
            const response = await apiClient.get(`/vendors/${vendor.id}`);
            setDetails(response.data.data);
        } catch (error) {
            toast.error('Failed to load vendor details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Vendor: ${vendor.company_name}`}>
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : details ? (
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500">Email:</span>
                            <span className="ml-2 text-slate-900 dark:text-white">{details.email}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Phone:</span>
                            <span className="ml-2 text-slate-900 dark:text-white">{details.phone}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">GST Number:</span>
                            <span className="ml-2 text-slate-900 dark:text-white">{details.gst_number || '-'}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">PAN Number:</span>
                            <span className="ml-2 text-slate-900 dark:text-white">{details.pan_number || '-'}</span>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Address</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {details.address}<br />
                            {details.city}, {details.state} - {details.pincode}
                        </p>
                    </div>

                    {/* Bank Details */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bank Details</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-slate-500">Bank:</span>
                                <span className="ml-2">{details.bank_name || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Account:</span>
                                <span className="ml-2">{details.bank_account || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">IFSC:</span>
                                <span className="ml-2">{details.bank_ifsc || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-indigo-600">{details.products_count || 0}</p>
                            <p className="text-xs text-slate-500">Products</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-emerald-600">{details.total_orders || 0}</p>
                            <p className="text-xs text-slate-500">Orders</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600">₹{(details.total_sales || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Sales</p>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-slate-500">No details available</p>
            )}
        </Modal>
    );
};

export default VendorsList;
