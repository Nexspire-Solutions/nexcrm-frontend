import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

const mockTemplates = [
    { id: 1, name: 'Welcome Email', subject: 'Welcome to Our Platform', category: 'Onboarding', lastModified: '2024-12-20', status: 'active' },
    { id: 2, name: 'Follow-up Reminder', subject: 'Following up on our conversation', category: 'Sales', lastModified: '2024-12-19', status: 'active' },
    { id: 3, name: 'Meeting Confirmation', subject: 'Your meeting is confirmed', category: 'Scheduling', lastModified: '2024-12-18', status: 'active' },
    { id: 4, name: 'Quote Proposal', subject: 'Your custom quote', category: 'Sales', lastModified: '2024-12-15', status: 'draft' },
    { id: 5, name: 'Thank You Note', subject: 'Thank you for your business', category: 'Post-Sale', lastModified: '2024-12-10', status: 'active' },
];

export default function EmailTemplates() {
    const [templates, setTemplates] = useState(mockTemplates);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    const filteredTemplates = templates.filter(t =>
        `${t.name} ${t.subject} ${t.category}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (deleteTargetId) {
            setTemplates(prev => prev.filter(t => t.id !== deleteTargetId));
            toast.success('Template deleted');
            setDeleteTargetId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6  rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Email Templates</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Create and manage reusable email templates
                    </p>
                </div>
                <button onClick={() => { setEditingTemplate(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Template
                </button>
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Templates Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4">Template Name</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Modified</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredTemplates.map((template) => (
                            <tr key={template.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{template.name}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">{template.subject}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                        {template.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={template.status === 'active'
                                        ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                    }>
                                        {template.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{template.lastModified}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => { setEditingTemplate(template); setShowModal(true); }} className="btn-ghost btn-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => { setPreviewTemplate(template); setShowPreview(true); }}
                                            className="btn-ghost btn-sm text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        >
                                            Preview
                                        </button>
                                        <button onClick={() => handleDelete(template.id)} className="btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredTemplates.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="empty-state-title">No templates found</h3>
                        <p className="empty-state-text">Create your first email template to get started</p>
                    </div>
                </div>
            )}

            {/* Template Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingTemplate ? 'Edit Template' : 'New Template'}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                        <button onClick={() => { setShowModal(false); toast.success('Template saved'); }} className="btn-primary">
                            {editingTemplate ? 'Update' : 'Create'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Template Name</label>
                        <input type="text" className="input" defaultValue={editingTemplate?.name} placeholder="e.g., Welcome Email" />
                    </div>
                    <div>
                        <label className="label">Subject Line</label>
                        <input type="text" className="input" defaultValue={editingTemplate?.subject} placeholder="Email subject" />
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <select className="select" defaultValue={editingTemplate?.category || 'Sales'}>
                            <option value="Onboarding">Onboarding</option>
                            <option value="Sales">Sales</option>
                            <option value="Scheduling">Scheduling</option>
                            <option value="Post-Sale">Post-Sale</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Email Body</label>
                        <textarea className="input min-h-48" placeholder="Write your email content here..."></textarea>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Template"
                message="Are you sure you want to delete this template? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Preview Modal */}
            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="Template Preview"
                footer={
                    <>
                        <button onClick={() => setShowPreview(false)} className="btn-secondary">Close</button>
                        <button onClick={() => { setEditingTemplate(previewTemplate); setShowPreview(false); setShowModal(true); }} className="btn-primary">Edit Template</button>
                    </>
                }
            >
                {previewTemplate && (
                    <div className="space-y-4">
                        <div>
                            <label className="label">Template Name</label>
                            <p className="text-slate-900 dark:text-white font-medium">{previewTemplate.name}</p>
                        </div>
                        <div>
                            <label className="label">Subject Line</label>
                            <p className="text-slate-900 dark:text-white font-medium">{previewTemplate.subject}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Category</label>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                    {previewTemplate.category}
                                </span>
                            </div>
                            <div>
                                <label className="label">Status</label>
                                <span className={previewTemplate.status === 'active' ? 'badge-success' : 'badge-warning'}>
                                    {previewTemplate.status}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="label">Email Body Preview</label>
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 min-h-48">
                                <p className="text-slate-600 dark:text-slate-400 italic">
                                    Email content preview would be displayed here...
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Last modified: {previewTemplate.lastModified}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
