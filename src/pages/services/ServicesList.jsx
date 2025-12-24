import { useState } from 'react';


export default function ServicesList() {
    const [services] = useState([
        { id: 1, name: 'General Consultation', duration: '30 min', price: '$50', category: 'Consultation', status: 'Active' },
        { id: 2, name: 'Deep Cleaning', duration: '2 hours', price: '$150', category: 'Cleaning', status: 'Active' },
        { id: 3, name: 'Premium Support', duration: '1 hour', price: '$100', category: 'Support', status: 'Inactive' },
    ]);

    return (

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage offered services and pricing</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Add Service
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Service Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Duration</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Price</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Category</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {services.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.duration}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{item.price}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'Active'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
