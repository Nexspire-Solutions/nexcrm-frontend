/**
 * Time Tracking - Legal Module
 * 
 * Time entry management with timer
 */

import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiPlay, FiPause, FiClock, FiCalendar, FiDollarSign, FiFilter, FiSave, FiTrash2 } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';

export default function TimeTracking() {
    const [entries, setEntries] = useState([]);
    const [cases, setCases] = useState([]);
    const [totals, setTotals] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerCase, setTimerCase] = useState(null);
    const [timerDescription, setTimerDescription] = useState('');
    const timerRef = useRef(null);

    const [filters, setFilters] = useState({
        start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    const [formData, setFormData] = useState({
        case_id: '',
        entry_date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        activity_type: 'other',
        billable: true
    });

    useEffect(() => {
        fetchEntries();
        fetchCases();
    }, [filters]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(filters);
            const response = await apiClient.get(`/time-entries?${params.toString()}`);
            setEntries(response.data.data || []);
            setTotals(response.data.totals || {});
        } catch (error) {
            console.error('Failed to fetch entries');
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCases = async () => {
        try {
            const response = await apiClient.get('/cases?status=open');
            setCases(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch cases');
        }
    };

    const startTimer = () => {
        if (!timerCase) {
            toast.error('Please select a case first');
            return;
        }
        setTimerRunning(true);
        timerRef.current = setInterval(() => {
            setTimerSeconds(prev => prev + 1);
        }, 1000);
    };

    const pauseTimer = () => {
        setTimerRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const saveTimer = async () => {
        if (!timerDescription) {
            toast.error('Please enter a description');
            return;
        }

        pauseTimer();
        const hours = (timerSeconds / 3600).toFixed(2);

        try {
            await apiClient.post('/time-entries', {
                case_id: timerCase,
                entry_date: new Date().toISOString().split('T')[0],
                hours,
                description: timerDescription,
                activity_type: 'other',
                billable: true
            });
            toast.success('Time entry saved');
            setTimerSeconds(0);
            setTimerCase(null);
            setTimerDescription('');
            fetchEntries();
        } catch (error) {
            toast.error('Failed to save time entry');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/time-entries', formData);
            toast.success('Time entry added');
            setShowModal(false);
            setFormData({ case_id: '', entry_date: new Date().toISOString().split('T')[0], hours: '', description: '', activity_type: 'other', billable: true });
            fetchEntries();
        } catch (error) {
            toast.error('Failed to add entry');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this time entry?')) return;
        try {
            await apiClient.delete(`/time-entries/${id}`);
            toast.success('Entry deleted');
            fetchEntries();
        } catch (error) {
            toast.error('Failed to delete entry');
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
    };

    const activityTypes = [
        { value: 'research', label: 'Research' },
        { value: 'drafting', label: 'Drafting' },
        { value: 'court_appearance', label: 'Court Appearance' },
        { value: 'client_meeting', label: 'Client Meeting' },
        { value: 'phone_call', label: 'Phone Call' },
        { value: 'document_review', label: 'Document Review' },
        { value: 'travel', label: 'Travel' },
        { value: 'administrative', label: 'Administrative' },
        { value: 'other', label: 'Other' }
    ];

    if (loading && entries.length === 0) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Time Tracking"
                subtitle="Track billable hours"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Legal' }, { label: 'Time Tracking' }]}
                actions={<button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><FiPlus className="w-4 h-4" /> Add Entry</button>}
            />

            {/* Timer Card */}
            <div className="card p-5 mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
                        <div className="text-5xl font-mono font-bold">{formatTime(timerSeconds)}</div>
                        <select
                            value={timerCase || ''}
                            onChange={(e) => setTimerCase(e.target.value)}
                            className="bg-white/20 border-0 rounded-lg px-4 py-2 text-white placeholder-white/70 w-48"
                        >
                            <option value="">Select Case</option>
                            {cases.map(c => (
                                <option key={c.id} value={c.id} className="text-slate-900">{c.case_number} - {c.title}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={timerDescription}
                            onChange={(e) => setTimerDescription(e.target.value)}
                            placeholder="What are you working on?"
                            className="bg-white/20 border-0 rounded-lg px-4 py-2 text-white placeholder-white/70 flex-1 w-full md:w-auto"
                        />
                    </div>
                    <div className="flex gap-2">
                        {!timerRunning ? (
                            <button onClick={startTimer} className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors">
                                <FiPlay className="w-6 h-6 ml-1" />
                            </button>
                        ) : (
                            <button onClick={pauseTimer} className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors">
                                <FiPause className="w-6 h-6" />
                            </button>
                        )}
                        {timerSeconds > 0 && (
                            <button onClick={saveTimer} className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-50 transition-colors">
                                <FiSave className="w-4 h-4" /> Save
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <FiClock className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{parseFloat(totals.total_hours || 0).toFixed(1)}</p>
                            <p className="text-sm text-slate-500">Total Hours</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FiClock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{parseFloat(totals.billable_hours || 0).toFixed(1)}</p>
                            <p className="text-sm text-slate-500">Billable Hours</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <FiDollarSign className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totals.total_amount)}</p>
                            <p className="text-sm text-slate-500">Total Value</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div>
                        <label className="label text-sm">From</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label text-sm">To</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                            className="input"
                        />
                    </div>
                    <button onClick={() => setFilters({
                        start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
                        end_date: new Date().toISOString().split('T')[0]
                    })} className="btn-secondary">This Month</button>
                </div>
            </div>

            {/* Entries Table */}
            {entries.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No time entries found</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Case</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Hours</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Amount</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {entries.map(entry => (
                                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FiCalendar className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm">{new Date(entry.entry_date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900 dark:text-white">{entry.case_number}</p>
                                        <p className="text-xs text-slate-500 truncate max-w-xs">{entry.case_title}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-xs">{entry.description}</p>
                                        <span className="text-xs text-slate-500 capitalize">{entry.activity_type?.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-indigo-600">{parseFloat(entry.hours).toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold">{formatCurrency(entry.amount)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${entry.billable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {entry.billable ? 'Billable' : 'Non-billable'}
                                            </span>
                                            {entry.billed && (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">Billed</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {!entry.billed && (
                                            <button onClick={() => handleDelete(entry.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                                <FiTrash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Entry Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Time Entry</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="label">Case *</label>
                                <select value={formData.case_id} onChange={(e) => setFormData({ ...formData, case_id: e.target.value })} className="select w-full" required>
                                    <option value="">Select Case</option>
                                    {cases.map(c => (
                                        <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Date *</label>
                                    <input type="date" value={formData.entry_date} onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })} className="input w-full" required />
                                </div>
                                <div>
                                    <label className="label">Hours *</label>
                                    <input type="number" step="0.25" min="0" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} className="input w-full" placeholder="1.5" required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Activity Type</label>
                                <select value={formData.activity_type} onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })} className="select w-full">
                                    {activityTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Description *</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input w-full" rows={3} required />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="billable" checked={formData.billable} onChange={(e) => setFormData({ ...formData, billable: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
                                <label htmlFor="billable" className="text-sm text-slate-700 dark:text-slate-300">Billable</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
