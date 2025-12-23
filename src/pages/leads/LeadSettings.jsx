import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LeadSettings() {
    const [leadStatuses, setLeadStatuses] = useState([
        { id: 1, name: 'New', color: '#6366f1', order: 1 },
        { id: 2, name: 'Qualified', color: '#10b981', order: 2 },
        { id: 3, name: 'Negotiation', color: '#f59e0b', order: 3 },
        { id: 4, name: 'Won', color: '#059669', order: 4 },
        { id: 5, name: 'Lost', color: '#ef4444', order: 5 }
    ]);

    const [scoreThresholds, setScoreThresholds] = useState({
        hot: 80,
        warm: 50,
        cold: 0
    });

    const [autoAssignment, setAutoAssignment] = useState({
        enabled: true,
        method: 'round-robin'
    });

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 py-5 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Lead Settings</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Configure lead statuses, scoring, and assignment rules
                    </p>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Statuses */}
                <div className="card p-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Lead Statuses</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Define the pipeline stages for your leads</p>

                    <div className="space-y-3">
                        {leadStatuses.map((status) => (
                            <div key={status.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <input
                                    type="color"
                                    value={status.color}
                                    onChange={(e) => {
                                        setLeadStatuses(prev => prev.map(s =>
                                            s.id === status.id ? { ...s, color: e.target.value } : s
                                        ));
                                    }}
                                    className="w-8 h-8 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={status.name}
                                    onChange={(e) => {
                                        setLeadStatuses(prev => prev.map(s =>
                                            s.id === status.id ? { ...s, name: e.target.value } : s
                                        ));
                                    }}
                                    className="flex-1 input"
                                />
                                <button className="btn-ghost p-2 text-slate-400 hover:text-slate-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    <button className="btn-secondary w-full mt-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Status
                    </button>
                </div>

                {/* Score Thresholds */}
                <div className="card p-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Lead Score Thresholds</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Define score ranges for lead temperature</p>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="label mb-0 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                    Hot Leads
                                </label>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{scoreThresholds.hot}+</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={scoreThresholds.hot}
                                onChange={(e) => setScoreThresholds(prev => ({ ...prev, hot: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="label mb-0 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                    Warm Leads
                                </label>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">{scoreThresholds.warm}-{scoreThresholds.hot - 1}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={scoreThresholds.warm}
                                onChange={(e) => setScoreThresholds(prev => ({ ...prev, warm: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="label mb-0 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    Cold Leads
                                </label>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">0-{scoreThresholds.warm - 1}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Auto Assignment */}
                <div className="card p-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Auto Assignment</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Configure automatic lead assignment rules</p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Enable Auto Assignment</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Automatically assign new leads to team members</p>
                            </div>
                            <button
                                onClick={() => setAutoAssignment(prev => ({ ...prev, enabled: !prev.enabled }))}
                                className={`relative w-12 h-6 rounded-full transition-colors ${autoAssignment.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${autoAssignment.enabled ? 'left-6' : 'left-0.5'}`}></span>
                            </button>
                        </div>

                        {autoAssignment.enabled && (
                            <div>
                                <label className="label">Assignment Method</label>
                                <select
                                    value={autoAssignment.method}
                                    onChange={(e) => setAutoAssignment(prev => ({ ...prev, method: e.target.value }))}
                                    className="select"
                                >
                                    <option value="round-robin">Round Robin</option>
                                    <option value="load-balanced">Load Balanced</option>
                                    <option value="skill-based">Skill Based</option>
                                    <option value="territory">Territory Based</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications */}
                <div className="card p-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Notifications</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Configure lead notification preferences</p>

                    <div className="space-y-3">
                        {[
                            { id: 'new_lead', label: 'New lead created', enabled: true },
                            { id: 'status_change', label: 'Lead status changed', enabled: true },
                            { id: 'score_change', label: 'Lead score changed significantly', enabled: false },
                            { id: 'inactivity', label: 'Lead inactive for 7 days', enabled: true }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                                <input type="checkbox" defaultChecked={item.enabled} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
