/**
 * Legal Tasks Page
 * Manage deadlines, court dates, and follow-ups
 */

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiTrash2, FiEdit } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';

export default function LegalTasks() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTasks();
    }, [filter, searchTerm]);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            if (searchTerm) params.append('search', searchTerm);

            const res = await apiClient.get(`/legal-tasks?${params}`);
            setTasks(res.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch tasks');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            await apiClient.put(`/legal-tasks/${task.id}`, { status: newStatus });
            toast.success(`Task marked as ${newStatus}`);
            fetchTasks();
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-600';
            case 'high': return 'bg-orange-100 text-orange-600';
            case 'medium': return 'bg-blue-100 text-blue-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="p-6">
            <ProHeader
                title="Legal Tasks & Deadlines"
                subtitle="Track all your case deadlines and follow-ups"
                actions={
                    <button className="btn-primary">
                        <FiPlus className="w-4 h-4 mr-2" /> New Task
                    </button>
                }
            />

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[300px] relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {['all', 'pending', 'in_progress', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tasks.length === 0 ? (
                        <div className="card p-12 text-center text-slate-500">
                            No tasks found. Create a new task to get started.
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-all">
                                <button
                                    onClick={() => toggleStatus(task)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'completed'
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'border-slate-300 hover:border-indigo-500'
                                        }`}
                                >
                                    {task.status === 'completed' && <FiCheckCircle className="w-4 h-4" />}
                                </button>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                            {task.title}
                                        </h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                        {task.case_number && (
                                            <span className="flex items-center gap-1">
                                                <FiAlertCircle className="w-3 h-3" /> {task.case_number}
                                            </span>
                                        )}
                                        {task.due_date && (
                                            <span className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500 font-bold' : ''}`}>
                                                <FiCalendar className="w-3 h-3" /> Due: {new Date(task.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {task.assigned_first && (
                                            <span className="flex items-center gap-1">
                                                <FiClock className="w-3 h-3" /> {task.assigned_first} {task.assigned_last}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600">
                                        <FiEdit className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-600">
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
