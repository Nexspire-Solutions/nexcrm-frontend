import { useState } from 'react';


export default function PrescriptionsList() {
    const [prescriptions] = useState([
        { id: 1, rxNumber: 'RX-90210', patient: 'John Doe', doctor: 'Dr. House', medication: 'Lisinopril', dosage: '10mg', date: '2023-11-20', status: 'Active' },
        { id: 2, rxNumber: 'RX-90211', patient: 'Jane Smith', doctor: 'Dr. Wilson', medication: 'Amoxicillin', dosage: '500mg', date: '2023-11-18', status: 'Completed' },
        { id: 3, rxNumber: 'RX-90212', patient: 'Robert Brown', doctor: 'Dr. Cuddy', medication: 'Metformin', dosage: '500mg', date: '2023-11-15', status: 'Active' },
    ]);

    return (

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prescriptions</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage patient prescriptions and medications</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    New Prescription
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Rx Number</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Patient</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Medication</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Dosage</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Prescribed By</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {prescriptions.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-indigo-600 dark:text-indigo-400 font-mono">{item.rxNumber}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{item.patient}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{item.medication}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.dosage}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{item.doctor}</td>
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
                                            View
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
