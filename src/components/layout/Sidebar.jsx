import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useState } from 'react';

// Professional SVG Icons
const Icons = {
    dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    employees: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    inquiries: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    leads: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    activity: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    customers: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    bulkMail: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    ),
    campaign: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
    ),
    chat: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
    ),
    chatbot: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    notification: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    ),
    chevronDown: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    logout: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    sun: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
    ),
    moon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
    ),
};

export default function Sidebar({ isOpen, setIsOpen }) {
    const { user, logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedGroups, setExpandedGroups] = useState(['leads', 'communications']);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleGroup = (group) => {
        setExpandedGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    };

    const isGroupActive = (paths) => {
        return paths.some(path => location.pathname.startsWith(path));
    };

    // Main navigation items
    const mainNavItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: Icons.dashboard,
            roles: ['admin', 'manager', 'sales_operator', 'user']
        },
        {
            name: 'Employees',
            path: '/employees',
            icon: Icons.employees,
            roles: ['admin', 'manager']
        },
        {
            name: 'Users & Permissions',
            path: '/users',
            icon: Icons.users,
            roles: ['admin']
        },
        {
            name: 'Inquiries',
            path: '/inquiries',
            icon: Icons.inquiries,
            roles: ['admin', 'manager', 'sales_operator']
        }
    ];

    // Leads group with sub-items
    const leadsGroup = {
        name: 'Leads',
        icon: Icons.leads,
        roles: ['admin', 'manager', 'sales_operator'],
        items: [
            { name: 'All Leads', path: '/leads', icon: Icons.leads },
            { name: 'Activity & History', path: '/leads/activity', icon: Icons.activity },
            { name: 'Customers', path: '/leads/customers', icon: Icons.customers },
            { name: 'Settings', path: '/leads/settings', icon: Icons.settings }
        ]
    };

    // Communications group with sub-items
    const communicationsGroup = {
        name: 'Communications',
        icon: Icons.email,
        roles: ['admin', 'manager'],
        items: [
            { name: 'Email Templates', path: '/communications/templates', icon: Icons.email },
            { name: 'Bulk Mailing', path: '/communications/bulk-mail', icon: Icons.bulkMail },
            { name: 'Email Campaigns', path: '/communications/campaigns', icon: Icons.campaign },
            { name: 'Team Chat', path: '/communications/chat', icon: Icons.chat },
            { name: 'Chatbot', path: '/communications/chatbot', icon: Icons.chatbot },
            { name: 'Push Notifications', path: '/communications/notifications', icon: Icons.notification }
        ]
    };

    const userRole = user?.role || 'user';

    const filteredMainNav = mainNavItems.filter(item =>
        item.roles.includes(userRole)
    );

    const canViewLeads = leadsGroup.roles.includes(userRole);
    const canViewCommunications = communicationsGroup.roles.includes(userRole);

    const NavItem = ({ item, isSubItem = false }) => (
        <NavLink
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isSubItem ? 'ml-4 text-sm' : ''
                } ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
            }
        >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="font-medium truncate">{item.name}</span>
        </NavLink>
    );

    const NavGroup = ({ group, groupKey }) => {
        const isExpanded = expandedGroups.includes(groupKey);
        const isActive = isGroupActive(group.items.map(i => i.path));

        return (
            <div className="space-y-1">
                <button
                    onClick={() => toggleGroup(groupKey)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive && !isExpanded
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span className="flex-shrink-0">{group.icon}</span>
                        <span className="font-medium">{group.name}</span>
                    </div>
                    <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        {Icons.chevronDown}
                    </span>
                </button>

                {isExpanded && (
                    <div className="space-y-1 mt-1">
                        {group.items.map((item) => (
                            <NavItem key={item.path} item={item} isSubItem />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>

                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">NexCRM</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                    >
                        {Icons.close}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {/* Main Menu */}
                    <div className="space-y-1">
                        <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Main Menu
                        </p>
                        {filteredMainNav.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </div>

                    {/* Leads Group */}
                    {canViewLeads && (
                        <div className="mt-6 space-y-1">
                            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Sales
                            </p>
                            <NavGroup group={leadsGroup} groupKey="leads" />
                        </div>
                    )}

                    {/* Communications Group */}
                    {canViewCommunications && (
                        <div className="mt-6 space-y-1">
                            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Communications
                            </p>
                            <NavGroup group={communicationsGroup} groupKey="communications" />
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                        </span>
                        <div className={`relative w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center transition-all ${isDark ? 'left-5' : 'left-0.5'}`}>
                                {isDark ? <span className="text-indigo-600">{Icons.moon}</span> : <span className="text-amber-500">{Icons.sun}</span>}
                            </span>
                        </div>
                    </button>

                    {/* User Info & Logout */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                            {user?.firstName?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {user?.firstName || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">
                                {user?.role || 'user'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Logout"
                        >
                            {Icons.logout}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
