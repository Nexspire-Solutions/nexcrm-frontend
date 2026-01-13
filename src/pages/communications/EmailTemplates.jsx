import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { templatesAPI } from '../../api';

export default function EmailTemplates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await templatesAPI.getAll();
            setTemplates(response.data || []);
        } catch (error) {
            console.error('Failed to load templates:', error);
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTemplates = templates.filter(t =>
        `${t.name} ${t.subject} ${t.category}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId) {
            try {
                await templatesAPI.delete(deleteTargetId);
                toast.success('Template deleted');
                fetchTemplates();
            } catch (error) {
                toast.error('Failed to delete template');
            }
            setDeleteTargetId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="card p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Email Templates</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Create and manage reusable email templates
                    </p>
                </div>
                <button
                    onClick={() => navigate('/communications/templates/new')}
                    className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
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
            {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                        <div key={template.id} className="card overflow-hidden group hover:shadow-lg transition-shadow">
                            {/* Preview Thumbnail */}
                            <div className="h-32 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                                <iframe
                                    srcDoc={template.body || '<p style="padding:40px;text-align:center;color:#999;">No content</p>'}
                                    className="w-full h-full scale-50 origin-top-left pointer-events-none"
                                    style={{ width: '200%', height: '200%' }}
                                    title={template.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{template.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${template.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        {template.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-3">{template.subject}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
                                        {template.category}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setPreviewTemplate(template); setShowPreview(true); }}
                                            className="btn-ghost btn-sm"
                                            title="Preview"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/communications/templates/${template.id}/edit`)}
                                            className="btn-ghost btn-sm text-indigo-600"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="btn-ghost btn-sm text-red-500"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state py-12">
                        <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No templates yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Create your first email template to get started</p>
                        <button onClick={() => navigate('/communications/templates/new')} className="btn-primary">
                            Create Template
                        </button>
                    </div>
                </div>
            )}

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

            {/* Preview Modal with HTML Rendering */}
            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title={previewTemplate?.name || 'Template Preview'}
                size="xl"
                footer={
                    <>
                        <button onClick={() => setShowPreview(false)} className="btn-secondary">Close</button>
                        <button
                            onClick={() => { navigate(`/communications/templates/${previewTemplate?.id}/edit`); setShowPreview(false); }}
                            className="btn-primary"
                        >
                            Edit Template
                        </button>
                    </>
                }
            >
                {previewTemplate && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Subject:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{previewTemplate.subject}</span>
                        </div>
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <iframe
                                srcDoc={previewTemplate.body || '<p style="padding:40px;text-align:center;color:#666;">No email content</p>'}
                                className="w-full h-[500px] bg-white"
                                title="Email Preview"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
