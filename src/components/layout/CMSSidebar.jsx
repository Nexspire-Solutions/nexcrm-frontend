```javascript
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    FiLayout, FiType, FiImage, FiMenu, FiSettings,
    FiArrowLeft, FiMonitor, FiSmartphone, FiTablet,
    FiGrid, FiFileText, FiEdit3, FiPenTool
} from 'react-icons/fi';

export default function CMSSidebar({ isOpen, setIsOpen }) {
    const { logout } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Design System',
            items: [
                { name: 'Theme & Colors', path: '/cms/theme', icon: <FiSettings /> },
                { name: 'Typography', path: '/cms/typography', icon: <FiType /> }, // Placeholder or combined
            ]
        },
        {
            title: 'Layout & Navigation',
            items: [
                { name: 'Header & Menu', path: '/cms/header', icon: <FiMenu /> },
                { name: 'Footer', path: '/cms/footer', icon: <FiLayout /> },
            ]
        },
        {
            title: 'Pages & Content',
            items: [
                { name: 'Homepage Layout', path: '/cms/home', icon: <FiGrid /> },
                { name: 'Banners', path: '/cms/banners', icon: <FiImage /> },
                { name: 'Static Pages', path: '/cms/pages', icon: <FiFileText /> },
                { name: 'Blog', path: '/cms/blog', icon: <FiEdit3 /> },
            ]
        }
    ];

    return (
        <aside className={`fixed lg:static inset - y - 0 left - 0 z - 50 w - 64 bg - slate - 900 border - r border - slate - 700 flex flex - col transition - transform duration - 300 ${ isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0' } `}>
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700 bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">
                        CMS
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Site Builder</h1>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all border border-slate-700"
                    >
                        <FiArrowLeft />
                        <span className="font-bold">Exit to CRM</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {menuItems.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="px-3 mb-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => `
                                            flex items - center gap - 3 px - 3 py - 2.5 rounded - lg text - sm font - medium transition - all
                                            ${
    isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
}
`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Footer / Device Preview Toggles (Visual only for now) */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                <div className="flex justify-center gap-4 text-slate-400">
                    <button title="Desktop View" className="hover:text-white"><FiMonitor /></button>
                    <button title="Tablet View" className="hover:text-white"><FiTablet /></button>
                    <button title="Mobile View" className="hover:text-white"><FiSmartphone /></button>
                </div>
                <div className="text-center mt-3 text-xs text-slate-500">
                    Preview Mode
                </div>
            </div>
        </aside>
    );
}
