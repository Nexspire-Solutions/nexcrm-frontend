import { useState } from 'react';
import { Link } from 'react-router-dom';

const mockCustomers = [
    { id: 1, contactName: 'Emily Brown', company: 'DesignHub', email: 'emily@designhub.com', phone: '+1 234 567 893', totalValue: 35000, convertedDate: '2024-12-15', projectsCount: 2, status: 'active' },
    { id: 2, contactName: 'Alex Chen', company: 'InnovateTech', email: 'alex@innovate.com', phone: '+1 234 567 900', totalValue: 78000, convertedDate: '2024-11-20', projectsCount: 3, status: 'active' },
    { id: 3, contactName: 'Lisa Martinez', company: 'GreenEco', email: 'lisa@greeneco.com', phone: '+1 234 567 901', totalValue: 45000, convertedDate: '2024-10-10', projectsCount: 1, status: 'active' },
    { id: 4, contactName: 'Robert Kim', company: 'FinanceX', email: 'robert@financex.com', phone: '+1 234 567 902', totalValue: 120000, convertedDate: '2024-09-05', projectsCount: 4, status: 'inactive' },
];

export default function Customers() {
    const [customers] = useState(mockCustomers);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = customers.filter(c =>
        `${c.contactName} ${c.company} ${c.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        totalValue: customers.reduce((sum, c) => sum + c.totalValue, 0),
        projects: customers.reduce((sum, c) => sum + c.projectsCount, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Customers</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Leads that have been converted to customers
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="stat-card-icon bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.total}</p>
                    <p className="stat-card-label">Total Customers</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.active}</p>
                    <p className="stat-card-label">Active</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="stat-card-value">Rs.{stats.totalValue.toLocaleString()}</p>
                    <p className="stat-card-label">Total Revenue</p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="stat-card-value">{stats.projects}</p>
                    <p className="stat-card-label">Total Projects</p>
                </div>
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="card p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg flex-shrink-0">
                                {customer.contactName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{customer.contactName}</h3>
                                    <span className={customer.status === 'active' ? 'badge-success' : 'badge-gray'}>
                                        {customer.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{customer.company}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Total Value</p>
                                <p className="font-semibold text-slate-900 dark:text-white">Rs.{customer.totalValue.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Projects</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{customer.projectsCount}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button className="btn-ghost btn-sm flex-1">View Details</button>
                            <button className="btn-ghost btn-sm flex-1">New Project</button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCustomers.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="empty-state-title">No customers found</h3>
                        <p className="empty-state-text">Convert leads to customers to see them here</p>
                    </div>
                </div>
            )}
        </div>
    );
}
