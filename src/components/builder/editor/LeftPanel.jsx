import React, { useState } from 'react';
import { FiBox, FiLayout, FiLayers, FiSearch, FiPlus } from 'react-icons/fi';
import SidebarTools from '../SidebarTools'; // Re-use existing tools for DND
// We can wrap standard SidebarTools or rewrite it. For speed, we wrap it.

const LeftPanel = () => {
    const [activeTab, setActiveTab] = useState('add');
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="flex flex-col h-full font-sans">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('add')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'add' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Add
                </button>
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'layers' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Layers
                </button>
                <button
                    onClick={() => setActiveTab('pages')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'pages' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Pages
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                {activeTab === 'add' && (
                    <div className="p-0">
                        {/* Search */}
                        <div className="p-4 pb-0">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search elements..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        {/* Existing Sidebar Tools Component which has the Draggables */}
                        <div className="p-0">
                            {/* We might need to adjust styles of SidebarTools to fit here, but passing it as child or importing is fine */}
                            <SidebarTools />
                        </div>
                    </div>
                )}

                {activeTab === 'layers' && (
                    <div className="p-8 text-center text-slate-400">
                        <FiLayers className="mx-auto text-3xl mb-2 opacity-30" />
                        <p className="text-sm">Layer tree coming soon</p>
                    </div>
                )}

                {activeTab === 'pages' && (
                    <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <span>Pages</span>
                            <button className="p-1 hover:bg-slate-200 rounded"><FiPlus /></button>
                        </div>
                        <div className="space-y-1">
                            {['Home', 'About Us', 'Contact', 'Pricing'].map(page => (
                                <div key={page} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded cursor-pointer hover:border-indigo-500 text-sm">
                                    {page}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeftPanel;
