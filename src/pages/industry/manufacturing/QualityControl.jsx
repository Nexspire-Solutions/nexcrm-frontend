/**
 * Quality Control Page - Manufacturing Module
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

const initialFormData = {
    production_order_id: '',
    sample_size: '',
    passed_quantity: '',
    failed_quantity: '',
    defect_type: '',
    status: 'pending',
    notes: ''
};

export default function QualityControl() {
    const [checks, setChecks] = useState([]);
    const [productionOrders, setProductionOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCheck, setEditingCheck] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        Promise.all([fetchChecks(), fetchStats(), fetchProductionOrders()]);
    }, [statusFilter]);

    const fetchChecks = async () => {
        try {
            const response = await apiClient.get('/quality', { params: { status: statusFilter || undefined } });
            setChecks(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch quality checks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/quality/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchProductionOrders = async () => {
        try {
            const response = await apiClient.get('/production');
            setProductionOrders(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch production orders:', error);
        }
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingCheck(null);
        setFormData(initialFormData);
    };

    const updateStatus = async (id, status) => {
        try {
            await apiClient.put(`/quality/${id}`, { status });
            toast.success(`Check marked as ${status}`);
            fetchChecks();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const openCreateModal = () => {
        setEditingCheck(null);
        setFormData(initialFormData);
        setShowModal(true);
    };

    const openEditModal = (check) => {
        setEditingCheck(check);
        setFormData({
            production_order_id: String(check.production_order_id || ''),
            sample_size: check.sample_size ?? '',
            passed_quantity: check.passed_quantity ?? '',
            failed_quantity: check.failed_quantity ?? '',
            defect_type: check.defect_type || '',
            status: check.status || 'pending',
            notes: check.notes || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const payload = {
                ...formData,
                production_order_id: Number(formData.production_order_id),
                sample_size: formData.sample_size === '' ? null : Number(formData.sample_size),
                passed_quantity: Number(formData.passed_quantity || 0),
                failed_quantity: Number(formData.failed_quantity || 0)
            };

            if (editingCheck) {
                await apiClient.put(`/quality/${editingCheck.id}`, payload);
                toast.success('Quality check updated');
            } else {
                await apiClient.post('/quality', payload);
                toast.success('Quality check created');
            }

            resetForm();
            fetchChecks();
            fetchStats();
        } catch (error) {
            console.error('Failed to save quality check:', error);
            toast.error(error.response?.data?.error || 'Failed to save quality check');
        }
    };

    const deleteCheck = async (id) => {
        if (!window.confirm('Delete this quality check?')) return;

        try {
            await apiClient.delete(`/quality/${id}`);
            toast.success('Quality check deleted');
            fetchChecks();
            fetchStats();
        } catch (error) {
            console.error('Failed to delete quality check:', error);
            toast.error(error.response?.data?.error || 'Failed to delete quality check');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        return styles[status] || styles.pending;
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <nav className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span>Factory</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Quality Control</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quality Control</h1>
                    <p className="text-slate-500 text-sm">Monitor and manage quality checks</p>
                </div>
                <button onClick={openCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Add Quality Check
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Total Checks</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.pending || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Passed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.passed || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{stats.failed || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 text-sm">Pass Rate</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.pass_rate || 0}%</p>
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="mb-4 flex gap-2">
                {['', 'pending', 'passed', 'failed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : checks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No quality checks found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Production Order</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Check Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Inspector</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Details</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {checks.map((check) => (
                                <tr key={check.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{check.production_order || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500">{check.product_name || '-'}</td>
                                    <td className="px-4 py-3 text-slate-500 capitalize">{check.check_type || 'Visual'}</td>
                                    <td className="px-4 py-3 text-slate-500">{check.inspector_name || (check.firstName ? `${check.firstName} ${check.lastName}` : '-')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadge(check.status)}`}>
                                            {check.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                        <div>Sample: {check.sample_size || 0}</div>
                                        <div>Pass/Fail: {check.passed_quantity || 0}/{check.failed_quantity || 0}</div>
                                        <div className="text-xs">{check.defect_type || 'No defect noted'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => openEditModal(check)}
                                                className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                            >
                                                Edit
                                            </button>
                                            {check.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus(check.id, 'passed')}
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                                                    >
                                                        Pass
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(check.id, 'failed')}
                                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                                                    >
                                                        Fail
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => deleteCheck(check.id)}
                                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingCheck ? 'Edit Quality Check' : 'New Quality Check'}
                            </h2>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">x</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Production Order *</label>
                                <select
                                    required
                                    value={formData.production_order_id}
                                    onChange={(e) => setFormData({ ...formData, production_order_id: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select order</option>
                                    {productionOrders.map(order => (
                                        <option key={order.id} value={order.id}>
                                            {order.order_number} - {order.product_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sample Size</label>
                                    <input type="number" min="0" value={formData.sample_size} onChange={(e) => setFormData({ ...formData, sample_size: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                        <option value="pending">Pending</option>
                                        <option value="passed">Passed</option>
                                        <option value="failed">Failed</option>
                                        <option value="conditional">Conditional</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Passed Quantity</label>
                                    <input type="number" min="0" value={formData.passed_quantity} onChange={(e) => setFormData({ ...formData, passed_quantity: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Failed Quantity</label>
                                    <input type="number" min="0" value={formData.failed_quantity} onChange={(e) => setFormData({ ...formData, failed_quantity: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Defect Type</label>
                                <input type="text" value={formData.defect_type} onChange={(e) => setFormData({ ...formData, defect_type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={resetForm} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    {editingCheck ? 'Save Changes' : 'Create Check'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
