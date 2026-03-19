import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../api/axios';

const initialForm = {
    material_id: '',
    movement_type: 'purchase',
    quantity: '',
    notes: ''
};

export default function MaterialMovements() {
    const [movements, setMovements] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        Promise.all([fetchMovements(), fetchMaterials(), fetchStats()]).finally(() => setLoading(false));
    }, []);

    const fetchMovements = async () => {
        try {
            const response = await apiClient.get('/material-movements');
            setMovements(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch material movements:', error);
        }
    };

    const fetchMaterials = async () => {
        try {
            const response = await apiClient.get('/materials');
            setMaterials(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/material-movements/stats');
            setStats(response.data.data || null);
        } catch (error) {
            console.error('Failed to fetch material movement stats:', error);
        }
    };

    const refreshAll = async () => {
        await Promise.all([fetchMovements(), fetchStats()]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/material-movements', {
                ...formData,
                material_id: Number(formData.material_id),
                quantity: Number(formData.quantity)
            });
            toast.success('Material movement recorded');
            setFormData(initialForm);
            setShowForm(false);
            refreshAll();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to record movement');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Material Movements</h1>
                    <p className="text-sm text-slate-500">Ledger of purchases, consumption, returns, and stock adjustments.</p>
                </div>
                <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Record Movement
                </button>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Purchases</p>
                        <p className="text-2xl font-bold text-green-600">{stats.purchases || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Consumption</p>
                        <p className="text-2xl font-bold text-red-600">{stats.consumption || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Adjustments</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.adjustments || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Returns</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.returns || 0}</p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading material ledger...</div>
                ) : movements.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No material movements recorded</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Material</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Notes</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {movements.map((movement) => (
                                <tr key={movement.id}>
                                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{movement.material_name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500 capitalize">{movement.movement_type?.replace('_', ' ')}</td>
                                    <td className={`px-4 py-3 text-sm font-medium ${Number(movement.quantity) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Number(movement.quantity) >= 0 ? '+' : ''}{movement.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{movement.notes || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-500">{new Date(movement.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Record Material Movement</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Material *</label>
                                <select value={formData.material_id} onChange={(e) => setFormData({ ...formData, material_id: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                    <option value="">Select material</option>
                                    {materials.map((material) => (
                                        <option key={material.id} value={material.id}>{material.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                                    <select value={formData.movement_type} onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                        <option value="purchase">Purchase</option>
                                        <option value="consumption">Consumption</option>
                                        <option value="adjustment">Adjustment</option>
                                        <option value="return">Return</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity *</label>
                                    <input type="number" required step="0.01" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
