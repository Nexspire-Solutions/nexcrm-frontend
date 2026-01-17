/**
 * Legal Tasks Page
 * Manage deadlines, court dates, and follow-ups
 */

import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiTrash2, FiEdit, FiX } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';

export default function LegalTasks() {
    const [tasks, setTasks] = useState([]);
    const [cases, setCases] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        case_id: '',
        assigned_to: '',
        due_date: '',
        priority: 'medium',
        status: 'pending'
    });

    useEffect(() => {
        fetchTasks();
        fetchCases();
        fetchUsers();
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

    const fetchCases = async () => {
        try {
            const res = await apiClient.get('/cases?status=active&limit=100');
            setCases(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch cases');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await apiClient.get('/users?limit=100');
            setUsers(res.data.data || res.data || []);
        } catch (error) {
            console.error('Failed to fetch users');
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

    const openNewTaskModal = () => {
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            case_id: '',
            assigned_to: '',
            due_date: '',
            priority: 'medium',
            status: 'pending'
        });
        setShowModal(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title || '',
            description: task.description || '',
            case_id: task.case_id || '',
            assigned_to: task.assigned_to || '',
            due_date: task.due_date?.split('T')[0] || '',
            priority: task.priority || 'medium',
            status: task.status || 'pending'
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error('Task title is required');
            return;
        }

        setSaving(true);
        try {
            if (editingTask) {
                await apiClient.put(`/legal-tasks/${editingTask.id}`, formData);
                toast.success('Task updated successfully');
            } else {
                await apiClient.post('/legal-tasks', formData);
                toast.success('Task created successfully');
            }
            setShowModal(false);
            fetchTasks();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save task');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await apiClient.delete(`/legal-tasks/${taskId}`);
            toast.success('Task deleted');
            fetchTasks();
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    return (
        <div className="p-6">
            <ProHeader
                title="Legal Tasks & Deadlines"
                subtitle="Track all your case deadlines and follow-ups"
                actions={
                    <button onClick={openNewTaskModal} className="btn-primary">
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
                                    <button
                                        onClick={() => openEditModal(task)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600"
                                    >
                                        <FiEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-600"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add/Edit Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingTask ? 'Edit Task' : 'New Task'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="input w-full"
                                    placeholder="Task title..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="input w-full"
                                    rows={3}
                                    placeholder="Task details..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Case</label>
                                    <select
                                        name="case_id"
                                        value={formData.case_id}
                                        onChange={handleChange}
                                        className="input w-full"
                                    >
                                        <option value="">Select Case</option>
                                        {cases.map(c => (
                                            <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Assign To</label>
                                    <select
                                        name="assigned_to"
                                        value={formData.assigned_to}
                                        onChange={handleChange}
                                        className="input w-full"
                                    >
                                        <option value="">Select User</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        value={formData.due_date}
                                        onChange={handleChange}
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="input w-full"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="input w-full"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
