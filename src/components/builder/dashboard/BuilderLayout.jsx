import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import { FiHome, FiLayout, FiBox, FiCpu, FiGlobe, FiSettings, FiLogOut, FiPlus } from 'react-icons/fi';

const BuilderLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { icon: <FiHome />, label: 'Dashboard', path: '/builder/dashboard' },
        { icon: <FiLayout />, label: 'Projects', path: '/builder/projects' },
        { icon: <FiBox />, label: 'Templates', path: '/builder/templates' },
        { icon: <FiGlobe />, label: 'Domains', path: '/builder/domains' },
        { icon: <FiCpu />, label: 'Hosting', path: '/builder/hosting' },
        { icon: <FiSettings />, label: 'Settings', path: '/builder/settings' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col z-20`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 min-w-[2rem] rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                            N
                        </div>
                        <span className={`font-bold text-lg text-slate-900 dark:text-white transition-opacity duration-300 ${!isSidebarOpen && 'opacity-0 hidden'}`}>
                            NexBuilder
                        </span>
                    </div>
                </div>

                {/* Create Button */}
                <div className="p-4">
                    <button
                        onClick={() => navigate('/cms/builder/new')} // Redirects to editor
                        className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-3 flex items-center justify-center gap-2 transition-all shadow-md group ${!isSidebarOpen && 'rounded-full aspect-square p-0'}`}
                        title="Create New Site"
                    >
                        <FiPlus className="text-xl" />
                        <span className={`${!isSidebarOpen && 'hidden'} font-medium`}>New Project</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 space-y-2 mt-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                            `}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className={`${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <button className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-red-600 transition-colors text-sm font-medium">
                        <FiLogOut className="text-lg" />
                        <span className={`${!isSidebarOpen && 'hidden'}`}>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Workspace</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default BuilderLayout;
