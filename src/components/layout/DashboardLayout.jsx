import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    const location = useLocation();
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getPageTitle = () => {
        const path = location.pathname;
        const routes = {
            '/dashboard': 'Dashboard',
            '/employees': 'Employees',
            '/users': 'Users & Permissions',
            '/inquiries': 'Inquiries',
            '/leads': 'Leads',
            '/leads/activity': 'Activity & History',
            '/leads/customers': 'Customers',
            '/leads/settings': 'Lead Settings',
            '/communications/templates': 'Email Templates',
            '/communications/bulk-mail': 'Bulk Mailing',
            '/communications/campaigns': 'Email Campaigns',
            '/communications/chat': 'Team Chat',
            '/communications/chatbot': 'Chatbot',
            '/communications/notifications': 'Push Notifications',
        };

        // Check for exact match first
        if (routes[path]) return routes[path];

        // Check for partial matches
        for (const [route, title] of Object.entries(routes)) {
            if (path.startsWith(route)) return title;
        }

        return 'Dashboard';
    };

    const getBreadcrumb = () => {
        const path = location.pathname;
        const parts = path.split('/').filter(Boolean);

        if (parts.length <= 1) return null;

        const breadcrumbMap = {
            'leads': 'Leads',
            'activity': 'Activity & History',
            'customers': 'Customers',
            'settings': 'Settings',
            'communications': 'Communications',
            'templates': 'Email Templates',
            'bulk-mail': 'Bulk Mailing',
            'campaigns': 'Campaigns',
            'chat': 'Team Chat',
            'chatbot': 'Chatbot',
            'notifications': 'Notifications'
        };

        return parts.map((part, index) => ({
            name: breadcrumbMap[part] || part.charAt(0).toUpperCase() + part.slice(1),
            isLast: index === parts.length - 1
        }));
    };

    const breadcrumb = getBreadcrumb();

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between">
                    {/* Left side */}
                    <div className="flex items-center gap-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Title & Breadcrumb */}
                        <div>
                            {breadcrumb && breadcrumb.length > 1 && (
                                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                                    {breadcrumb.slice(0, -1).map((item, idx) => (
                                        <span key={idx} className="flex items-center gap-1">
                                            {item.name}
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {getPageTitle()}
                            </h1>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="hidden md:block relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-64 pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User */}
                        <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {user?.firstName || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                    {user?.role || 'user'}
                                </p>
                            </div>
                            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                                {user?.firstName?.[0] || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
