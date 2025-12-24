import { useState } from 'react';

export default function ViewingsList() {
    const [viewings] = useState([
        { id: 1, property: 'Modern Downtown Apartment', client: 'Alice Johnson', date: '2023-11-15', time: '10:00 AM', agent: 'Bob Smith', status: 'Confirmed' },
        { id: 2, property: 'Suburban Family Home', client: 'Michael Brown', date: '2023-11-16', time: '02:00 PM', agent: 'Sarah Davis', status: 'Pending' },
        { id: 3, property: 'Seaside Villa', client: 'Emily Wilson', date: '2023-11-18', time: '11:30 AM', agent: 'Bob Smith', status: 'Completed' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Property Viewings</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage scheduled property viewings</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Schedule Viewing
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Property</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Client</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Date & Time</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Agent</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {viewings.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium">{item.property}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{item.client}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.date} at {item.time}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.agent}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'Confirmed'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : item.status === 'Pending'
                                                ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                                            Reschedule
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
