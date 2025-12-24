import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import NotificationBell from '../common/NotificationBell';
import NotificationSidebar from '../common/NotificationSidebar';
import { getSocket } from '../../utils/socket';

// Mock notifications
const mockNotifications = [
    { id: 1, type: 'lead', title: 'New Lead Added', message: 'John Smith from TechCorp submitted a contact form', time: '2 min ago', read: false },
    { id: 2, type: 'message', title: 'New Message', message: 'Sarah sent you a message in #General', time: '15 min ago', read: false },
    { id: 3, type: 'task', title: 'Task Completed', message: 'Follow-up call with DataFlow Inc marked as done', time: '1 hour ago', read: true },
    { id: 4, type: 'system', title: 'System Update', message: 'New features are now available', time: '3 hours ago', read: true },
];

export default function DashboardLayout() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);

    // Listen for real-time notifications
    useEffect(() => {
        const socket = getSocket();
        if (socket) {
            socket.on('notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
            });
        }
    }, []);

    const handleMarkAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleClearAll = () => {
        setNotifications([]);
        setNotificationOpen(false);
    };

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
                        <NotificationBell
                            onClick={() => setNotificationOpen(true)}
                            unreadCount={notifications.filter(n => !n.read).length}
                        />

                        {/* User Dropdown */}
                        <div className="relative ml-2 pl-4 border-l border-slate-200 dark:border-slate-700 hidden sm:block">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            >
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
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 z-40 py-1 animate-scale-in">
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                // navigate('/profile'); // Future implementation
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                // navigate('/settings'); // Future implementation
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Settings
                                        </button>
                                        <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>

            {/* Notification Sidebar */}
            <NotificationSidebar
                isOpen={notificationOpen}
                onClose={() => setNotificationOpen(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
            />
        </div>
    );
}
