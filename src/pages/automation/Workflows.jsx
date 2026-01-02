import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { workflowAPI } from '../../api';

const statusStyles = {
    running: 'badge-primary',
    completed: 'badge-success',
    failed: 'badge-error',
    pending: 'badge-warning'
};

const triggerLabels = {
    trigger_lead_created: 'Lead Created',
    trigger_lead_updated: 'Lead Updated',
    trigger_customer_created: 'Customer Created',
    trigger_order_placed: 'Order Placed',
    trigger_inquiry_received: 'Inquiry Received',
    trigger_manual: 'Manual',
    trigger_webhook: 'Webhook',
    trigger_schedule: 'Schedule'
};

export default function Workflows() {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [importData, setImportData] = useState('');
    const [formData, setFormData] = useState({ name: '', description: '', trigger_type: 'trigger_lead_created' });

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const res = await workflowAPI.getAll();
            setWorkflows(res.data || []);
        } catch (error) {
            console.error('Failed to fetch workflows:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error('Workflow name is required');
            return;
        }
        setSaving(true);
        try {
            const res = await workflowAPI.create({
                name: formData.name,
                description: formData.description,
                trigger_type: formData.trigger_type,
                canvas_data: { nodes: [], edges: [] }
            });
            toast.success('Workflow created');
            setShowModal(false);
            setFormData({ name: '', description: '', trigger_type: 'trigger_lead_created' });
            navigate(`/automation/workflows/${res.workflowId}`);
        } catch (error) {
            toast.error('Failed to create workflow');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await workflowAPI.toggle(id);
            toast.success(res.is_active ? 'Workflow activated' : 'Workflow deactivated');
            fetchWorkflows();
        } catch (error) {
            toast.error('Failed to toggle workflow');
        }
    };

    const handleRun = async (id) => {
        try {
            await workflowAPI.run(id);
            toast.success('Workflow execution started');
        } catch (error) {
            toast.error('Failed to run workflow');
        }
    };

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId) {
            try {
                await workflowAPI.delete(deleteTargetId);
                toast.success('Workflow deleted');
                fetchWorkflows();
            } catch (error) {
                toast.error('Failed to delete workflow');
            }
            setDeleteTargetId(null);
        }
    };

    const handleDuplicate = async (id) => {
        try {
            const res = await workflowAPI.duplicate(id);
            toast.success('Workflow duplicated');
            navigate(`/automation/workflows/${res.workflowId}`);
        } catch (error) {
            toast.error('Failed to duplicate workflow');
        }
    };

    const handleExport = async (id) => {
        try {
            const res = await workflowAPI.export(id);
            const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `workflow-${id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Workflow exported');
        } catch (error) {
            toast.error('Failed to export workflow');
        }
    };

    const handleImport = async () => {
        try {
            const parsed = JSON.parse(importData);
            const workflow = parsed.workflow || parsed;
            const res = await workflowAPI.import(workflow);
            toast.success('Workflow imported');
            setShowImportModal(false);
            setImportData('');
            navigate(`/automation/workflows/${res.workflowId}`);
        } catch (error) {
            toast.error('Invalid JSON or import failed');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Workflow Automation</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Build visual workflows to automate your CRM tasks
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowImportModal(true)} className="btn-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Workflow
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{workflows.length}</p>
                            <p className="text-xs text-slate-500">Total Workflows</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{workflows.filter(w => w.is_active).length}</p>
                            <p className="text-xs text-slate-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {workflows.reduce((sum, w) => sum + (w.total_executions || 0), 0)}
                            </p>
                            <p className="text-xs text-slate-500">Total Runs</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {workflows.reduce((sum, w) => sum + (w.successful_executions || 0), 0)}
                            </p>
                            <p className="text-xs text-slate-500">Successful</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workflows Grid */}
            {workflows.length === 0 ? (
                <div className="card p-12 text-center">
                    <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No workflows yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Create your first automation workflow</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        Create Workflow
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workflows.map(workflow => (
                        <div key={workflow.id} className="card hover:shadow-lg transition-shadow">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{workflow.name}</h3>
                                        {workflow.description && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{workflow.description}</p>
                                        )}
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                                        <input
                                            type="checkbox"
                                            checked={workflow.is_active}
                                            onChange={() => handleToggle(workflow.id)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Trigger:</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                        {triggerLabels[workflow.trigger_type] || workflow.trigger_type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span>{workflow.total_executions || 0} runs</span>
                                    <span>{workflow.successful_executions || 0} successful</span>
                                </div>
                                {workflow.last_run && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        Last run: {new Date(workflow.last_run).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/automation/workflows/${workflow.id}`)}
                                    className="btn-primary btn-sm flex-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleRun(workflow.id)}
                                    className="btn-secondary btn-sm"
                                    title="Run workflow"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDuplicate(workflow.id)}
                                    className="btn-ghost btn-sm"
                                    title="Duplicate"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleExport(workflow.id)}
                                    className="btn-ghost btn-sm"
                                    title="Export"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(workflow.id)}
                                    className="btn-ghost btn-sm text-red-500"
                                    title="Delete workflow"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Create Workflow"
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>Cancel</button>
                        <button onClick={handleCreate} className="btn-primary" disabled={saving}>
                            {saving ? 'Creating...' : 'Create & Edit'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Workflow Name *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Welcome New Leads"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea
                            className="input"
                            rows={2}
                            placeholder="What does this workflow do?"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="label">Trigger Type</label>
                        <select
                            className="select"
                            value={formData.trigger_type}
                            onChange={(e) => setFormData(prev => ({ ...prev, trigger_type: e.target.value }))}
                        >
                            {Object.entries(triggerLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Workflow"
                message="Are you sure you want to delete this workflow? All execution history will be lost."
                confirmText="Delete"
                type="danger"
            />

            {/* Import Modal */}
            <Modal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                title="Import Workflow"
                footer={
                    <>
                        <button onClick={() => setShowImportModal(false)} className="btn-secondary">Cancel</button>
                        <button onClick={handleImport} className="btn-primary">Import</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">Paste the exported workflow JSON below:</p>
                    <textarea
                        className="input font-mono text-sm"
                        rows={10}
                        placeholder='{"version": "1.0", "workflow": {...}}'
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
}
