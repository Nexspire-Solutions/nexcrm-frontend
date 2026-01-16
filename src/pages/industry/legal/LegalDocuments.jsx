/**
 * Legal Documents Page
 * Create, manage, and print legal documents from templates
 */

import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiSearch, FiFileText, FiPrinter, FiEye, FiEdit, FiTrash2, FiDownload, FiX, FiCheck, FiFolder } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';

export default function LegalDocuments() {
    const [activeTab, setActiveTab] = useState('documents');
    const [documents, setDocuments] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Modal states
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showEditDocumentModal, setShowEditDocumentModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Form states
    const [templateForm, setTemplateForm] = useState({
        name: '', description: '', category: 'other', content: '', variables: []
    });
    const [generateForm, setGenerateForm] = useState({
        template_id: '', case_id: '', client_id: '', title: '', custom_variables: {}
    });
    const [editDocForm, setEditDocForm] = useState({
        title: '', content: ''
    });

    // Data for dropdowns
    const [cases, setCases] = useState([]);
    const [clients, setClients] = useState([]);

    const printRef = useRef();

    useEffect(() => {
        fetchData();
    }, [activeTab, searchTerm, selectedCategory]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'documents') {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                const res = await apiClient.get(`/legal-documents?${params}`);
                setDocuments(res.data.data || []);
            } else {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (selectedCategory) params.append('category', selectedCategory);
                const res = await apiClient.get(`/legal-documents/templates?${params}`);
                setTemplates(res.data.data || []);
            }

            // Fetch categories
            const catRes = await apiClient.get('/legal-documents/templates/categories');
            setCategories(catRes.data.data || []);

            // Fetch cases and clients for generate modal
            const [casesRes, clientsRes] = await Promise.all([
                apiClient.get('/cases?limit=100'),
                apiClient.get('/legal-clients?limit=100')
            ]);
            setCases(casesRes.data.data || []);
            setClients(clientsRes.data.data || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/legal-documents/templates', templateForm);
            toast.success('Template created successfully');
            setShowTemplateModal(false);
            setTemplateForm({ name: '', description: '', category: 'other', content: '', variables: [] });
            fetchData();
        } catch (error) {
            toast.error('Failed to create template');
        }
    };

    const handleUpdateTemplate = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put(`/legal-documents/templates/${selectedTemplate.id}`, templateForm);
            toast.success('Template updated successfully');
            setShowTemplateModal(false);
            setSelectedTemplate(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to update template');
        }
    };

    const handleDeleteTemplate = async (id) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await apiClient.delete(`/legal-documents/templates/${id}`);
            toast.success('Template deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    const handleGenerateDocument = async (e) => {
        e.preventDefault();
        try {
            const res = await apiClient.post('/legal-documents/generate', generateForm);
            toast.success('Document generated successfully');
            setShowGenerateModal(false);
            setSelectedDocument(res.data.data);
            setShowPreviewModal(true);
            setGenerateForm({ template_id: '', case_id: '', client_id: '', title: '', custom_variables: {} });
            fetchData();
        } catch (error) {
            toast.error('Failed to generate document');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${selectedDocument?.title || 'Legal Document'}</title>
                <style>
                    body { font-family: Georgia, serif; margin: 0; padding: 20px; color: #0f172a; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 2cm; }
                    }
                </style>
            </head>
            <body>
                ${selectedDocument?.header || ''}
                ${selectedDocument?.content || ''}
                ${selectedDocument?.footer || ''}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const openEditTemplate = (template) => {
        setSelectedTemplate(template);
        setTemplateForm({
            name: template.name,
            description: template.description || '',
            category: template.category,
            content: template.content,
            variables: template.variables ? JSON.parse(template.variables) : []
        });
        setShowTemplateModal(true);
    };

    const openGenerateModal = (template) => {
        setGenerateForm({
            ...generateForm,
            template_id: template.id,
            title: `${template.name} - ${new Date().toISOString().slice(0, 10)}`
        });
        setShowGenerateModal(true);
    };

    const viewDocument = async (doc) => {
        try {
            const res = await apiClient.get(`/legal-documents/${doc.id}`);
            setSelectedDocument(res.data.data);
            setShowPreviewModal(true);
        } catch (error) {
            toast.error('Failed to load document');
        }
    };

    const openEditDocument = (doc) => {
        setSelectedDocument(doc);
        setEditDocForm({
            title: doc.title,
            content: doc.content
        });
        setShowEditDocumentModal(true);
    };

    const handleUpdateDocument = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put(`/legal-documents/${selectedDocument.id}`, editDocForm);
            toast.success('Document updated successfully');
            setShowEditDocumentModal(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to update document');
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            await apiClient.delete(`/legal-documents/${id}`);
            toast.success('Document deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    const getCategoryName = (catId) => {
        return categories.find(c => c.id === catId)?.name || catId;
    };

    return (
        <div className="p-6">
            <ProHeader
                title="Legal Documents"
                subtitle="Create and manage legal documents from templates"
                actions={
                    <div className="flex gap-3">
                        {activeTab === 'templates' && (
                            <button
                                onClick={() => { setSelectedTemplate(null); setTemplateForm({ name: '', description: '', category: 'other', content: '', variables: [] }); setShowTemplateModal(true); }}
                                className="btn-primary"
                            >
                                <FiPlus className="w-4 h-4" /> New Template
                            </button>
                        )}
                    </div>
                }
            />

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6 w-fit">
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'documents'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                >
                    <FiFileText className="inline w-4 h-4 mr-2" />
                    Generated Documents
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'templates'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                >
                    <FiFolder className="inline w-4 h-4 mr-2" />
                    Document Templates
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10 w-full"
                    />
                </div>
                {activeTab === 'templates' && (
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input w-48"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : activeTab === 'documents' ? (
                <div className="card">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Document</th>
                                <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Template</th>
                                <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Case/Client</th>
                                <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Created</th>
                                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        No documents generated yet. Create one from a template.
                                    </td>
                                </tr>
                            ) : (
                                documents.map(doc => (
                                    <tr key={doc.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <FiFileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{doc.title}</p>
                                                    <p className="text-xs text-slate-500">{getCategoryName(doc.category)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">{doc.template_name}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            {doc.case_number || doc.client_name || '-'}
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => viewDocument(doc)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                                    title="View & Print"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditDocument(doc)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-indigo-600"
                                                    title="Edit Content"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-red-600"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No templates found. Create your first template.
                        </div>
                    ) : (
                        templates.map(template => (
                            <div key={template.id} className="card p-5 hover:shadow-lg transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <FiFileText className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                        {getCategoryName(template.category)}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{template.name}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{template.description || 'No description'}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openGenerateModal(template)}
                                        className="flex-1 btn-primary text-sm py-2"
                                    >
                                        <FiPlus className="w-4 h-4" /> Generate
                                    </button>
                                    <button
                                        onClick={() => openEditTemplate(template)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                                        title="Edit"
                                    >
                                        <FiEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600"
                                        title="Delete"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {selectedTemplate ? 'Edit Template' : 'New Template'}
                            </h2>
                            <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Template Name *</label>
                                    <input
                                        type="text"
                                        value={templateForm.name}
                                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        value={templateForm.category}
                                        onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                                        className="input w-full"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    type="text"
                                    value={templateForm.description}
                                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Content (HTML) *</label>
                                <p className="text-xs text-slate-500 mb-2">
                                    Use {'{{variable_name}}'} for placeholders. Common variables: client_name, client_address, case_number, lawyer_name, current_date
                                </p>
                                <textarea
                                    value={templateForm.content}
                                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                                    className="input w-full font-mono text-sm"
                                    rows={15}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowTemplateModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    <FiCheck className="w-4 h-4" /> {selectedTemplate ? 'Update' : 'Create'} Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Generate Document Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Generate Document</h2>
                            <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleGenerateDocument} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Document Title</label>
                                <input
                                    type="text"
                                    value={generateForm.title}
                                    onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Link to Case (Optional)</label>
                                <select
                                    value={generateForm.case_id}
                                    onChange={(e) => setGenerateForm({ ...generateForm, case_id: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="">Select a case...</option>
                                    {cases.map(c => (
                                        <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Case and client details will auto-fill</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Or Link to Client</label>
                                <select
                                    value={generateForm.client_id}
                                    onChange={(e) => setGenerateForm({ ...generateForm, client_id: e.target.value })}
                                    className="input w-full"
                                    disabled={generateForm.case_id}
                                >
                                    <option value="">Select a client...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowGenerateModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    <FiFileText className="w-4 h-4" /> Generate Document
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview & Print Modal */}
            {showPreviewModal && selectedDocument && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedDocument.title}</h2>
                            <div className="flex gap-2">
                                <button onClick={handlePrint} className="btn-primary">
                                    <FiPrinter className="w-4 h-4" /> Print
                                </button>
                                <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-900">
                            <div
                                ref={printRef}
                                className="bg-white dark:bg-white text-slate-900 rounded-lg shadow-lg p-8 max-w-3xl mx-auto"
                                style={{ minHeight: '11in' }}
                            >
                                <div dangerouslySetInnerHTML={{ __html: selectedDocument.content }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Document Content Modal */}
            {showEditDocumentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Edit Generated Document</h2>
                            <button onClick={() => setShowEditDocumentModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateDocument} className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Document Title</label>
                                    <input
                                        type="text"
                                        value={editDocForm.title}
                                        onChange={(e) => setEditDocForm({ ...editDocForm, title: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Document Content (HTML)</label>
                                    <textarea
                                        value={editDocForm.content}
                                        onChange={(e) => setEditDocForm({ ...editDocForm, content: e.target.value })}
                                        className="input w-full font-mono text-sm h-[400px]"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowEditDocumentModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    <FiCheck className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
