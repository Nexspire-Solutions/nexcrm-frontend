import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axios';

export default function Billing() {
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await apiClient.get('/billing');
            setInvoices(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return styles[status] || styles.pending;
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
                        <span>Law Firm</span>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white">Billing</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Invoices</h1>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Invoice
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {invoices.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No invoices found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Create invoices for your legal cases.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Invoice #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Case</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">INV-{invoice.id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{invoice.client_name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{invoice.case_title}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">₹{invoice.amount?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{invoice.due_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
