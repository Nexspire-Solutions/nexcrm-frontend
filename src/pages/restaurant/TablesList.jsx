import { useState } from 'react';


export default function TablesList() {
    const [tables] = useState([
        { id: 1, number: 'T-01', capacity: 2, status: 'Occupied', server: 'John', orderTotal: '$45.00' },
        { id: 2, number: 'T-02', capacity: 4, status: 'Available', server: '-', orderTotal: '-' },
        { id: 3, number: 'T-03', capacity: 6, status: 'Reserved', server: 'Sarah', orderTotal: '-' },
        { id: 4, number: 'T-04', capacity: 4, status: 'Occupied', server: 'Mike', orderTotal: '$120.50' },
    ]);

    return (

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Table Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">Track restaurant table status</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Add Table
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tables.map((table) => (
                    <div key={table.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Table {table.number}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{table.capacity} Seats</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${table.status === 'Available'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                : table.status === 'Occupied'
                                    ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                    : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                }`}>
                                {table.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                            <div>
                                <p className="text-xs text-slate-500">Server</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{table.server}</p>
                            </div>
                            {table.status === 'Occupied' && (
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Total</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{table.orderTotal}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
