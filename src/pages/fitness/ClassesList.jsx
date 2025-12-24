import { useState } from 'react';


export default function ClassesList() {
    const [classes] = useState([
        { id: 1, name: 'Morning Yoga', instructor: 'Sarah Jenks', schedule: 'Mon, Wed, Fri 07:00 AM', capacity: 20, enrolled: 15, status: 'Active' },
        { id: 2, name: 'HIIT Blast', instructor: 'Mike Tyson', schedule: 'Tue, Thu 06:00 PM', capacity: 15, enrolled: 15, status: 'Full' },
        { id: 3, name: 'Pilates Core', instructor: 'Emily Blunt', schedule: 'Sat 10:00 AM', capacity: 12, enrolled: 8, status: 'Active' },
    ]);

    return (

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fitness Classes</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage gym classes and schedules</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Add Class
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Class Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Instructor</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Schedule</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Capacity</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Enrolled</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {classes.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.instructor}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.schedule}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{item.capacity}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{item.enrolled}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'Full'
                                            ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                                            Manage
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
