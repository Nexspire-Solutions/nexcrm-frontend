import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CMSSidebar from './CMSSidebar';

export default function CMSLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <CMSSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header Toggle */}
                <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-700">
                    <span className="font-bold text-white">CMS Builder</span>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>

                <main className="flex-1 overflow-auto relative bg-slate-100 dark:bg-slate-900">
                    {/* Split View or Canvas Area */}
                    <div className="max-w-7xl mx-auto h-full p-4 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
