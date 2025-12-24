import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';

const mockMenu = [
    { id: 1, name: 'Grilled Salmon', category: 'Main Course', price: '$24.99', available: true, popular: true },
    { id: 2, name: 'Caesar Salad', category: 'Appetizer', price: '$8.99', available: true, popular: false },
    { id: 3, name: 'New York Cheesecake', category: 'Dessert', price: '$7.99', available: true, popular: true },
    { id: 4, name: 'Ribeye Steak', category: 'Main Course', price: '$32.99', available: false, popular: true },
    { id: 5, name: 'Margherita Pizza', category: 'Main Course', price: '$16.99', available: true, popular: true },
    { id: 6, name: 'Tiramisu', category: 'Dessert', price: '$8.99', available: true, popular: false },
];

const categories = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Beverage'];

export default function Menu() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [menu] = useState(mockMenu);

    const filteredMenu = activeCategory === 'All'
        ? menu
        : menu.filter(item => item.category === activeCategory);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Menu"
                subtitle="Manage your restaurant menu items"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Restaurant' }, { label: 'Menu' }]}
                actions={<button className="btn-primary">Add Item</button>}
            />

            <div className="flex gap-2 mb-6 overflow-x-auto">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenu.map(item => (
                    <ProCard key={item.id} className="hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.name}</h3>
                            {item.popular && (
                                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                                    Popular
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-slate-500 mb-3">{item.category}</p>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
                            <span className="text-2xl font-bold text-indigo-600">{item.price}</span>
                            <StatusBadge
                                status={item.available ? 'available' : 'unavailable'}
                                variant={item.available ? 'success' : 'error'}
                            />
                        </div>
                    </ProCard>
                ))}
            </div>
        </div>
    );
}
