import React, { useState } from 'react';
import InspectorPanel from '../InspectorPanel'; // Re-use existing inspector logic
import { FiType, FiLayout, FiMaximize, FiDroplet, FiGrid } from 'react-icons/fi';
import SEOPanel from '../panels/SEOPanel';

const RightPanel = ({ selectedElement, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('style');

    // Only force selection for Style tab. Settings can be global or element specific.
    // For now, let's treat Settings as Global Page Settings if no element selected, or Element settings if selected.
    // Actually, SEOPanel is usually page-level.

    return (
        <div className="flex flex-col h-full font-sans">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
                <button
                    onClick={() => setActiveTab('style')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'style' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Style
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Settings
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'style' && (
                    selectedElement ? (
                        <div className="Inspector-Override remove-fixed-width" style={{ width: '100%' }}>
                            <InspectorPanel selectedElement={selectedElement} onUpdate={onUpdate} />
                        </div>
                    ) : (
                        <div className="flex flex-col h-full items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900">
                            <FiLayout className="text-4xl mb-3 opacity-20" />
                            <p className="text-sm font-medium">Select an element to edit styles</p>
                        </div>
                    )
                )}

                {activeTab === 'settings' && (
                    <div className="p-4">
                        <SEOPanel />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightPanel;
