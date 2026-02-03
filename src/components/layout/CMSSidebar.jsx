import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    FiHome, FiPieChart, // Dashboard
    FiLayout, FiImage, FiMenu, FiEdit3, FiPenTool, FiLayers, // Design
    FiFileText, FiMessageSquare, FiHelpCircle, // Content
    FiShoppingBag, FiCalendar, FiBriefcase, // Business
    FiUsers, FiTarget, FiMail, // CRM & Marketing
    FiSettings, FiCreditCard, FiGlobe, // Settings
    FiLogOut, FiChevronDown, FiChevronRight
} from 'react-icons/fi';

export default function CMSSidebar({ isOpen, setIsOpen }) {
    const { logout } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const menuGroups = [
        {
            title: 'Dashboard',
            items: [
                { name: 'Home', path: '/cms/overview', icon: <FiHome /> },
            ]
        },
        {
            title: 'Content',
            items: [
                { name: 'Pages', path: '/cms/pages', icon: <FiLayout /> },
            ]
        },
        {
            title: 'Appearance',
            items: [
                { name: 'Themes', path: '/cms/templates', icon: <FiLayers /> },
                { name: 'Menus', path: '/cms/menus', icon: <FiMenu /> },
                { name: 'Website Builder', path: '/builder', icon: <FiPenTool /> },
            ]
        },
        {
            title: 'System',
            items: [
                { name: 'Settings', path: '/cms/settings', icon: <FiSettings /> },
            ]
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} transform fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        N
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 dark:text-white leading-none">Nexspire</h1>
                        <span className="text-[10px] items-center font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                            BUSINESS OS
                        </span>
                    </div>
                </div>
            </div>

            {/* Scrollable Menu */}
            <div className="overflow-y-auto h-[calc(100vh-4rem-4rem)] p-4 space-y-6">
                {menuGroups.map((group, idx) => (
                    <div key={idx}>
                        <h3 className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {group.title}
                        </h3>
                        <div className="space-y-0.5">
                            {group.items.map((item, i) => (
                                <NavLink
                                    key={i}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`
                                    }
                                >
                                    <span className="text-lg opacity-80">{item.icon}</span>
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / User Profile */}
            <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <button
                    onClick={() => navigate('/cms/overview')}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 justify-center"
                >
                    <FiHome className="text-lg" />
                    Dashboard
                </button>
                <a
                    href="http://localhost:5173" // Assuming Storefront port
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 justify-center"
                >
                    <FiGlobe className="text-lg" />
                    View Live Store
                </a>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <FiLogOut className="text-lg" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
