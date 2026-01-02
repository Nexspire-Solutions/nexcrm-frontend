import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { FiMove, FiEye, FiEyeOff, FiSave, FiEdit2, FiX, FiPlus } from 'react-icons/fi';
import { SECTION_SCHEMAS } from './sectionSchemas';

const DEFAULT_SECTIONS = [
    { id: 'hero', label: 'Hero Banner', visible: true, type: 'banner', props: {} },
    { id: 'features', label: 'Features Grid', visible: true, type: 'static', props: {} },
    { id: 'products', label: 'Featured Products', visible: true, type: 'products', props: {} },
    { id: 'categories', label: 'Categories', visible: true, type: 'categories', props: {} },
    { id: 'testimonials', label: 'Testimonials', visible: false, type: 'static', props: {} },
    { id: 'blog_feed', label: 'Latest News', visible: true, type: 'blog', props: {} },
    { id: 'newsletter', label: 'Newsletter Signup', visible: true, type: 'form', props: {} },
];

export default function SectionBuilder() {
    const [sections, setSections] = useState(DEFAULT_SECTIONS);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState(['home']);
    const [currentPage, setCurrentPage] = useState('home');

    // Page Creation State
    const [isCreating, setIsCreating] = useState(false);
    const [newPageName, setNewPageName] = useState('');

    // Property Editor State
    const [editingSectionIndex, setEditingSectionIndex] = useState(null);
    const [editValues, setEditValues] = useState({});

    // Add Section State
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    useEffect(() => {
        loadLayout(currentPage);
    }, [currentPage]);

    const fetchPages = async () => {
        try {
            const res = await apiClient.get('/cms/layouts');
            if (res.data.success) {
                setPages(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch pages');
        }
    };

    const loadLayout = async (page) => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/cms/layout/${page}`);
            if (res.data.data && res.data.data.sections) {
                const savedSections = typeof res.data.data.sections === 'string'
                    ? JSON.parse(res.data.data.sections)
                    : res.data.data.sections;

                // Merge with default to ensure props are preserved but defaults are respected
                if (page === 'home') {
                    const merged = DEFAULT_SECTIONS.map(def => {
                        const saved = savedSections.find(s => s.id === def.id);
                        return saved ? { ...def, ...saved } : def;
                    });
                    // Append any extra saved ones not in default
                    const extras = savedSections.filter(s => !DEFAULT_SECTIONS.find(d => d.id === s.id));
                    setSections([...merged, ...extras]);
                } else {
                    setSections(savedSections.length ? savedSections : DEFAULT_SECTIONS);
                }
            } else {
                setSections(DEFAULT_SECTIONS);
            }
        } catch (error) {
            console.error(error);
            setSections(DEFAULT_SECTIONS);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await apiClient.post(`/cms/layout/${currentPage}`, { sections });
            toast.success(`Layout for ${currentPage} saved`);
            if (!pages.includes(currentPage)) {
                fetchPages();
            }
        } catch (error) {
            toast.error('Failed to save layout');
        }
    };

    const handleCreatePage = () => {
        if (!newPageName.trim()) return;
        const slug = newPageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (pages.includes(slug)) {
            toast.error('Page already exists');
            return;
        }

        setCurrentPage(slug);
        setSections(DEFAULT_SECTIONS);
        setIsCreating(false);
        setNewPageName('');
        setPages([...pages, slug]);
        toast.success(`Created new page: ${slug}`);
    };

    // --- Section Editing ---

    const openEditor = (index) => {
        setEditingSectionIndex(index);
        // Initialize values with defaults from schema if missing
        const section = sections[index];
        const schema = SECTION_SCHEMAS[section.type];
        const defaults = {};
        if (schema) {
            schema.fields.forEach(f => defaults[f.name] = f.default);
        }
        setEditValues({ ...defaults, ...(section.props || {}) });
    };

    const handleEditChange = (name, value) => {
        setEditValues(prev => ({ ...prev, [name]: value }));
    };

    const saveEditor = () => {
        const newSections = [...sections];
        newSections[editingSectionIndex].props = editValues;

        // Auto-update label if title changes (for better UX)
        if (editValues.title) {
            // Optional: Update label? newSections[editingSectionIndex].label = editValues.title;
        }

        setSections(newSections);
        setEditingSectionIndex(null);
    };

    // --- Add/Remove/Move ---

    const handleAddSection = (type) => {
        const schema = SECTION_SCHEMAS[type];
        const newSection = {
            id: `${type}_${Date.now()}`,
            label: `New ${schema.label}`,
            type: type,
            visible: true,
            props: {} // Defaults will be filled on edit
        };
        setSections([...sections, newSection]);
        setIsAdding(false);
        // Automatically open editor
        setTimeout(() => openEditor(sections.length), 100);
    };

    const removeSection = (index) => {
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
    };

    const toggleVisible = (index) => {
        const newSections = [...sections];
        newSections[index].visible = !newSections[index].visible;
        setSections(newSections);
    };

    const moveSection = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;

        const newSections = [...sections];
        const temp = newSections[index];
        newSections[index] = newSections[index + (direction === 'up' ? -1 : 1)];
        newSections[index + (direction === 'up' ? -1 : 1)] = temp;
        setSections(newSections);
    };

    // --- Preview Sync ---
    useEffect(() => {
        const iframe = document.getElementById('preview-frame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'cms:preview',
                sections: sections
            }, '*');
        }
    }, [sections]);

    if (loading && !pages.length) return <div className="p-8 text-center text-slate-500">Loading layout...</div>;

    const currentSchema = editingSectionIndex !== null ? SECTION_SCHEMAS[sections[editingSectionIndex]?.type] : null;

    return (
        <div className="flex h-[calc(100vh-6rem)] -m-6">
            {/* LEFT: Editor Panel (Scrollable) */}
            <div className="w-1/2 min-w-[400px] border-r border-slate-200 dark:border-slate-700 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="max-w-xl mx-auto relative">
                    {/* Page Selector & Actions */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Page Builder</h2>
                                <p className="text-slate-500 text-sm">Design your '{currentPage}' page</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                                    <FiSave /> Save
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-bold uppercase text-slate-400 px-2">Page:</span>
                            <select
                                value={currentPage}
                                onChange={(e) => setCurrentPage(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer flex-1"
                            >
                                {pages.map(p => (
                                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                            <button onClick={() => setIsCreating(true)} className="text-xs btn-secondary py-1 px-2">+ New</button>
                        </div>
                    </div>

                    {/* Sections List */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-24">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sections</span>
                            <button onClick={() => setIsAdding(true)} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                                <FiPlus /> Add
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {sections.map((section, index) => (
                                <div
                                    key={section.id}
                                    className={`p-3 flex items-center gap-3 transition-colors group ${section.visible ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50 opacity-75'}`}
                                >
                                    {/* Move Controls */}
                                    <div className="flex flex-col gap-0.5 text-slate-300">
                                        <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="hover:text-indigo-600 disabled:opacity-20"><span className="text-[10px]">▲</span></button>
                                        <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="hover:text-indigo-600 disabled:opacity-20"><span className="text-[10px]">▼</span></button>
                                    </div>

                                    {/* Label */}
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEditor(index)}>
                                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition-colors">{section.label}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{section.type}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditor(index)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"><FiEdit2 size={14} /></button>
                                        <button onClick={() => toggleVisible(index)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                                            {section.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                                        </button>
                                        <button onClick={() => removeSection(index)} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"><FiX size={14} /></button>
                                    </div>
                                </div>
                            ))}
                            {sections.length === 0 && (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    No sections yet. Click "Add" above.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Live Preview Iframe */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative border-l border-slate-200 flex flex-col">
                <div className="bg-white border-b border-slate-200 p-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono">Live Preview: {currentPage}</span>
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded">Desktop</span>
                        {/* Future: Mobile/Tablet Toggles */}
                    </div>
                </div>
                <div className="flex-1 w-full h-full p-4 overflow-hidden flex justify-center">
                    <iframe
                        id="preview-frame"
                        src={`http://localhost:3000/${currentPage}`} // Assuming Storefront port 3000
                        className="w-full h-full bg-white shadow-2xl rounded-lg border border-slate-300"
                        title="Live Preview"
                    />
                </div>
            </div>

            {/* Property Editor Modal (Slide-over) */}
            {
                editingSectionIndex !== null && currentSchema && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setEditingSectionIndex(null)} />
                        <div className="relative w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl overflow-y-auto p-6 flex flex-col animate-slide-in-right">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Edit {currentSchema.label}</h3>
                                <button onClick={() => setEditingSectionIndex(null)} className="btn-icon btn-ghost"><FiX size={24} /></button>
                            </div>

                            <div className="flex-1 space-y-6">
                                {currentSchema.fields.map(field => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">{field.label}</label>

                                        {field.type === 'text' && (
                                            <input
                                                type="text"
                                                className="form-input w-full"
                                                value={editValues[field.name] || ''}
                                                onChange={e => handleEditChange(field.name, e.target.value)}
                                            />
                                        )}

                                        {field.type === 'textarea' && (
                                            <textarea
                                                className="form-textarea w-full h-32"
                                                value={editValues[field.name] || ''}
                                                onChange={e => handleEditChange(field.name, e.target.value)}
                                            />
                                        )}

                                        {field.type === 'number' && (
                                            <input
                                                type="number"
                                                className="form-input w-full"
                                                value={editValues[field.name] || 0}
                                                onChange={e => handleEditChange(field.name, e.target.value)}
                                            />
                                        )}

                                        {field.type === 'select' && (
                                            <select
                                                className="form-select w-full"
                                                value={editValues[field.name] || field.default}
                                                onChange={e => handleEditChange(field.name, e.target.value)}
                                            >
                                                {field.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        )}

                                        {field.type === 'image' && (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    className="form-input flex-1"
                                                    placeholder="https://..."
                                                    value={editValues[field.name] || ''}
                                                    onChange={e => handleEditChange(field.name, e.target.value)}
                                                />
                                                {/* Future: Image Upload Button */}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700 flex gap-4">
                                <button onClick={() => setEditingSectionIndex(null)} className="btn-ghost flex-1">Cancel</button>
                                <button onClick={saveEditor} className="btn-primary flex-1">Apply Changes</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create Page Modal */}
            {
                isCreating && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">Create New Page</h3>
                            <input type="text" className="w-full form-input mb-4" placeholder="Page Name" value={newPageName} onChange={e => setNewPageName(e.target.value)} autoFocus />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsCreating(false)} className="btn-ghost">Cancel</button>
                                <button onClick={handleCreatePage} className="btn-primary">Create</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Section Modal */}
            {
                isAdding && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-2xl">
                            <h3 className="text-xl font-bold mb-6">Add Section</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(SECTION_SCHEMAS).map(([type, schema]) => (
                                    <button
                                        key={type}
                                        onClick={() => handleAddSection(type)}
                                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-all"
                                    >
                                        <span className="font-bold block mb-1">{schema.label}</span>
                                        <span className="text-xs text-slate-500">Click to add</span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button onClick={() => setIsAdding(false)} className="btn-ghost">Cancel</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
