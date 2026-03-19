import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI } from '../../../api';
import BulkImportModal from '../../../components/common/BulkImportModal';

const CLIENT_FIELDS = [
    { value: 'name', label: 'Client / Company Name (Required)' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'company', label: 'Company (if different from name)' },
    { value: 'address', label: 'Address' },
    { value: 'website', label: 'Website' },
    { value: 'industry', label: 'Industry' },
    { value: 'notes', label: 'Notes' },
];

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await clientsAPI.getAll();
            setClients(response.data || response || []);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded mb-4 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <nav className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span>Services</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Clients</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clients</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Client
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {clients.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No clients found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Add clients to manage their appointments.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Last Visit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                                                    {client.name?.[0] || 'C'}
                                                </div>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{client.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{client.phone}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{client.last_visit || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <BulkImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={fetchClients}
                entityName="Clients"
                fields={CLIENT_FIELDS}
                requiredField="name"
                onImport={(data) => clientsAPI.bulkImport(data)}
            />
        </div>
    );
}
