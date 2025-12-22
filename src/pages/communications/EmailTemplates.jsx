import { useState } from 'react';
import toast from 'react-hot-toast';

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

    const filteredTemplates = templates.filter(t =>
        `${t.name} ${t.subject} ${t.category}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this template?')) {
            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.success('Template deleted');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Email Templates</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Create and manage reusable email templates
                    </p>
                </div>
                <button onClick={() => { setEditingTemplate(null); setShowModal(true); }} className="btn-primary">
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

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                    <div key={template.id} className="card p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className={template.status === 'active' ? 'badge-success' : 'badge-warning'}>
                                {template.status}
                            </span>
                        </div>

                        <h3 className="font-semibold text-slate-900 dark:text-white mt-4">{template.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">{template.subject}</p>

                        <div className="flex items-center gap-2 mt-4">
                            <span className="badge-gray">{template.category}</span>
                        </div>

                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Last modified: {template.lastModified}</p>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => { setEditingTemplate(template); setShowModal(true); }} className="btn-ghost btn-sm flex-1">Edit</button>
                            <button className="btn-ghost btn-sm flex-1">Preview</button>
                            <button onClick={() => handleDelete(template.id)} className="btn-ghost btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
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

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
                            <button onClick={() => setShowModal(false)} className="btn-ghost p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
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
                        <div className="modal-footer">
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={() => { setShowModal(false); toast.success('Template saved'); }} className="btn-primary">
                                {editingTemplate ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
