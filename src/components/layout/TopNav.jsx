/**
 * TopNav - Main horizontal navigation component
 * Modern SaaS-style top navigation with dropdowns
 */
import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import NotificationBell from '../common/NotificationBell';

// Navigation Icons
const Icons = {
    logo: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    dashboard: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
    leads: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    inquiries: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    employees: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    users: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    communications: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    settings: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    chevronDown: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
    search: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    sun: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>,
    moon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>,
    menu: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    close: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    logout: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    profile: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

export default function TopNav({ onMobileMenuToggle }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setActiveDropdown(null);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userRole = user?.role || 'user';

    // Main navigation items
    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Icons.dashboard, roles: ['admin', 'manager', 'sales_operator', 'user'] },
        {
            name: 'Sales',
            icon: Icons.leads,
            roles: ['admin', 'manager', 'sales_operator'],
            children: [
                { name: 'All Leads', path: '/leads' },
                { name: 'Customers', path: '/leads/customers' },
                { name: 'Activity', path: '/leads/activity' },
                { name: 'Settings', path: '/leads/settings' },
            ]
        },
        { name: 'Inquiries', path: '/inquiries', icon: Icons.inquiries, roles: ['admin', 'manager', 'sales_operator'] },
        {
            name: 'Team',
            icon: Icons.employees,
            roles: ['admin', 'manager'],
            children: [
                { name: 'Employees', path: '/employees' },
                { name: 'Users & Permissions', path: '/users' },
            ]
        },
        {
            name: 'Communications',
            icon: Icons.communications,
            roles: ['admin', 'manager'],
            children: [
                { name: 'Email Templates', path: '/communications/templates' },
                { name: 'Bulk Mailing', path: '/communications/bulk-mail' },
                { name: 'Campaigns', path: '/communications/campaigns' },
                { name: 'Team Chat', path: '/communications/chat' },
                { name: 'Chatbot', path: '/communications/chatbot' },
                { name: 'Notifications', path: '/communications/notifications' },
            ]
        },
    ];

    const filteredNavItems = navItems.filter(item => item.roles?.includes(userRole));

    const isPathActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="top-nav">
            {/* Left - Logo & Brand */}
            <div className="top-nav-brand">
                <div className="top-nav-logo">
                    {Icons.logo}
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">
                    NexCRM
                </span>
            </div>

            {/* Center - Navigation Links */}
            <div className="top-nav-links" ref={dropdownRef}>
                {filteredNavItems.map((item, idx) => (
                    item.children ? (
                        <div key={idx} className="top-nav-dropdown">
                            <button
                                className={`top-nav-link flex items-center gap-1 ${item.children.some(c => isPathActive(c.path)) ? 'active' : ''}`}
                                onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                                {Icons.chevronDown}
                            </button>
                            {activeDropdown === item.name && (
                                <div className="top-nav-dropdown-menu opacity-100 visible translate-y-0">
                                    {item.children.map((child, cidx) => (
                                        <NavLink
                                            key={cidx}
                                            to={child.path}
                                            onClick={() => setActiveDropdown(null)}
                                            className={`top-nav-dropdown-item ${isPathActive(child.path) ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' : ''}`}
                                        >
                                            {child.name}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <NavLink
                            key={idx}
                            to={item.path}
                            className={({ isActive }) => `top-nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    )
                ))}
            </div>

            {/* Right - Actions */}
            <div className="top-nav-actions">
                {/* Search */}
                <div className="hidden md:flex items-center relative">
                    <span className="absolute left-3 text-slate-400">{Icons.search}</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="input-search w-48 lg:w-64 py-2 text-sm"
                    />
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="btn-ghost btn-icon"
                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                    {theme === 'dark' ? Icons.sun : Icons.moon}
                </button>

                {/* Notifications */}
                <NotificationBell onClick={() => { }} unreadCount={3} />

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => {
                            setActiveDropdown(null); // Close other dropdowns
                            setUserMenuOpen(!userMenuOpen);
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <div className="avatar avatar-sm text-xs">
                            {user?.firstName?.[0] || 'U'}
                        </div>
                        <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {user?.firstName || 'User'}
                        </span>
                    </button>

                    {userMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] py-1 animate-modal-in">
                            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="py-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/profile');
                                        setUserMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
                                >
                                    {Icons.profile}
                                    My Profile
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(false); }}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
                                >
                                    {Icons.settings}
                                    Settings
                                </button>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(false); handleLogout(); }}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors w-full text-left"
                                >
                                    {Icons.logout}
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={onMobileMenuToggle}
                    className="lg:hidden btn-ghost btn-icon"
                >
                    {Icons.menu}
                </button>
            </div>
        </nav >
    );
}
