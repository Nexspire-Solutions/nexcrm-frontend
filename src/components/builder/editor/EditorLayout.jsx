import React, { useState } from 'react';
import { FiMonitor, FiTablet, FiSmartphone, FiArrowLeft, FiSave, FiEye, FiSettings, FiLayout, FiLayers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EditorLayout = ({ children, leftPanel, rightPanel, onSave, onPublish, isSaving }) => {
    const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(true);

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-slate-900 overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-4">
                    <Link to="/builder/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500">
                        <FiArrowLeft />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase">Designing</span>
                        <h1 className="text-sm font-bold text-slate-800 dark:text-white">Landing Page</h1>
                    </div>
                </div>

                {/* Viewport Controls */}
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-2 rounded transition-all ${viewMode === 'desktop' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FiMonitor />
                    </button>
                    <button
                        onClick={() => setViewMode('tablet')}
                        className={`p-2 rounded transition-all ${viewMode === 'tablet' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FiTablet />
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-2 rounded transition-all ${viewMode === 'mobile' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FiSmartphone />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <FiEye /> <span className="hidden sm:inline">Preview</span>
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg shadow-sm transition-all"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FiSave />
                        )}
                        <span>Save</span>
                    </button>
                    <button
                        onClick={onPublish}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                    >
                        <span>Publish</span>
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel */}
                <aside
                    className={`${leftOpen ? 'w-80' : 'w-0'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 relative flex flex-col z-30`}
                >
                    <div className="flex-1 overflow-hidden opacity-100 transition-opacity duration-300">
                        {leftPanel}
                    </div>
                    {/* Toggle */}
                    <button
                        onClick={() => setLeftOpen(!leftOpen)}
                        className="absolute top-1/2 -right-3 w-6 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-lg shadow-md flex items-center justify-center text-slate-400 hover:text-indigo-600 z-50 focus:outline-none"
                    >
                        <FiLayout className="w-4 h-4" />
                    </button>
                </aside>

                {/* Canvas Area */}
                <main className="flex-1 bg-slate-100 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center p-8">
                    <div
                        className={`
                            bg-white shadow-2xl transition-all duration-300 overflow-y-auto overflow-x-hidden relative scrollbar-hide
                            ${viewMode === 'desktop' ? 'w-full h-full rounded-none' : ''}
                            ${viewMode === 'tablet' ? 'w-[768px] h-[90%] rounded-xl border border-slate-300' : ''}
                            ${viewMode === 'mobile' ? 'w-[375px] h-[90%] rounded-2xl border-4 border-slate-800' : ''}
                        `}
                    >
                        {children}
                    </div>
                </main>

                {/* Right Panel */}
                <aside
                    className={`${rightOpen ? 'w-80' : 'w-0'} bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 transition-all duration-300 relative flex flex-col z-30`}
                >
                    <div className="flex-1 overflow-hidden opacity-100 transition-opacity duration-300">
                        {rightPanel}
                    </div>
                    {/* Toggle */}
                    <button
                        onClick={() => setRightOpen(!rightOpen)}
                        className="absolute top-1/2 -left-3 w-6 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l-lg shadow-md flex items-center justify-center text-slate-400 hover:text-indigo-600 z-50 focus:outline-none"
                    >
                        <FiSettings className="w-4 h-4" />
                    </button>
                </aside>
            </div>
        </div>
    );
};

export default EditorLayout;
