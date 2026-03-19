import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../api/axios';

const initialForm = {
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    city: '',
    payment_terms: '',
    rating: 3,
    status: 'active',
    notes: ''
};

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [stats, setStats] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        Promise.all([fetchSuppliers(), fetchStats()]).finally(() => setLoading(false));
    }, [search]);

    const fetchSuppliers = async () => {
        try {
            const response = await apiClient.get('/suppliers', { params: { search: search || undefined } });
            setSuppliers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/suppliers/stats');
            setStats(response.data.data || null);
        } catch (error) {
            console.error('Failed to fetch supplier stats:', error);
        }
    };

    const refreshAll = async () => {
        await Promise.all([fetchSuppliers(), fetchStats()]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await apiClient.put(`/suppliers/${editingId}`, formData);
                toast.success('Supplier updated');
            } else {
                await apiClient.post('/suppliers', formData);
                toast.success('Supplier created');
            }

            setShowForm(false);
            setEditingId(null);
            setFormData(initialForm);
            refreshAll();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save supplier');
        }
    };

    const handleEdit = (supplier) => {
        setEditingId(supplier.id);
        setFormData({
            name: supplier.name || '',
            contact_person: supplier.contact_person || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            city: supplier.city || '',
            payment_terms: supplier.payment_terms || '',
            rating: supplier.rating || 3,
            status: supplier.status || 'active',
            notes: supplier.notes || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this supplier?')) return;
        try {
            await apiClient.delete(`/suppliers/${id}`);
            toast.success('Supplier deleted');
            refreshAll();
        } catch (error) {
            toast.error('Failed to delete supplier');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Suppliers</h1>
                    <p className="text-sm text-slate-500">Maintain your manufacturing vendor directory.</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialForm); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Add Supplier
                </button>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Total Suppliers</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Inactive</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactive || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Avg. Rating</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.average_rating || 0}</p>
                    </div>
                </div>
            )}

            <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading suppliers...</div>
                ) : suppliers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No suppliers found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">City</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rating</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Linked Materials</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900 dark:text-white">{supplier.name}</div>
                                        <div className="text-xs text-slate-400 capitalize">{supplier.status}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">
                                        <div>{supplier.contact_person || '-'}</div>
                                        <div>{supplier.email || supplier.phone || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{supplier.city || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{supplier.rating || 0}/5</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{supplier.linked_materials || 0}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(supplier)} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Edit</button>
                                            <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                                    <input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                                    <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
                                    <input type="text" value={formData.payment_terms} onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                                    <input type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 3 })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingId ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
