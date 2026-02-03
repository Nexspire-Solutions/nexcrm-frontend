import { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

export default function MenuBuilder({ mode = 'header' }) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({ label: '', url: '', order: 0 });

    useEffect(() => {
        fetchMenu();
    }, [mode]);

    const fetchMenu = async () => {
        try {
            const response = await apiClient.get(`/cms/menu/${mode}`);
            setItems(response.data?.data || response.data?.items || []);
        } catch (error) {
            console.error('Failed to fetch menu:', error);
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.label.trim()) {
            toast.error('Label is required');
            return;
        }
        try {
            await apiClient.post(`/cms/menu/${mode}`, newItem);
            toast.success('Menu item added');
            setNewItem({ label: '', url: '', order: items.length });
            fetchMenu();
        } catch (error) {
            toast.error('Failed to add item');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Delete this menu item?')) return;
        try {
            await apiClient.delete(`/cms/menu/${mode}/${id}`);
            toast.success('Item deleted');
            fetchMenu();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const handleSave = async () => {
        try {
            await apiClient.put(`/cms/menu/${mode}`, { items });
            toast.success('Menu saved successfully');
        } catch (error) {
            toast.error('Failed to save menu');
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                        {mode} Menu Builder
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Manage your {mode} navigation items
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Save Changes
                </button>
            </div>

            {/* Menu Items */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Menu Items</h3>
                </div>

                {items.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        No menu items yet. Add your first item below.
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {items.map((item, index) => (
                            <li key={item.id || index} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-400 cursor-move">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                                        <p className="text-sm text-slate-500">{item.url || '/'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingItem(item)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Add New Item Form */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Label</label>
                            <input
                                type="text"
                                value={newItem.label}
                                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                                placeholder="Menu Label"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">URL</label>
                            <input
                                type="text"
                                value={newItem.url}
                                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                                placeholder="/page-url"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                            />
                        </div>
                        <button
                            onClick={handleAddItem}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
