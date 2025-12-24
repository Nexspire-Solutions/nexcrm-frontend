import { useState } from 'react';


export default function ReservationsList() {
    const [reservations] = useState([
        { id: 1, guest: 'Alice Johnson', room: 'Suite 101', checkIn: '2023-11-20', checkOut: '2023-11-25', status: 'Confirmed', amount: '$1200' },
        { id: 2, guest: 'Bob Smith', room: 'Deluxe 204', checkIn: '2023-11-21', checkOut: '2023-11-23', status: 'Checked In', amount: '$400' },
        { id: 3, guest: 'Charlie Brown', room: 'Standard 305', checkIn: '2023-12-01', checkOut: '2023-12-05', status: 'Pending', amount: '$600' },
    ]);

    return (

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reservations</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage hotel room reservations</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    New Reservation
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Guest</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Room</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Check-in</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Check-out</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Total</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {reservations.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{item.guest}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.room}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.checkIn}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.checkOut}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{item.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'Confirmed' || item.status === 'Checked In'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                                            Details
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
