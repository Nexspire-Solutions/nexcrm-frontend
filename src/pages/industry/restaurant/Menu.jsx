import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import apiClient from '../../../api/axios';

export default function Menu() {
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await apiClient.get('/menu');
            setMenuItems(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch menu:', error);
            setMenuItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Menu"
                subtitle="Manage restaurant menu items"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Restaurant' }, { label: 'Menu' }]}
                actions={<button className="btn-primary">Add Item</button>}
            />

            {menuItems.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No menu items found</p>
                        <p className="text-sm text-slate-400 mt-1">Add your first menu item to get started</p>
                    </div>
                </ProCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map(item => (
                        <ProCard key={item.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.category}</p>
                                    <p className="font-bold text-indigo-600 mt-2">₹{(item.price || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </ProCard>
                    ))}
                </div>
            )}
        </div>
    );
}
