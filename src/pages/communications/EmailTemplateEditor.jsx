import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { templatesAPI } from '../../api';

// Widget types with icons
const WIDGETS = [
    { id: 'header', name: 'Header', icon: 'M4 6h16M4 12h16M4 18h7', description: 'Title and logo section' },
    { id: 'text', name: 'Text Block', icon: 'M4 6h16M4 12h8m-8 6h16', description: 'Rich text content' },
    { id: 'image', name: 'Image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', description: 'Add an image' },
    { id: 'button', name: 'Button', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', description: 'Call-to-action button' },
    { id: 'divider', name: 'Divider', icon: 'M5 12h14', description: 'Horizontal line' },
    { id: 'columns', name: '2 Columns', icon: 'M9 4v16m6-16v16M4 7h4m-4 5h4m-4 5h4m8-10h4m-4 5h4m-4 5h4', description: 'Two column layout' },
    { id: 'spacer', name: 'Spacer', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4', description: 'Empty space' },
    { id: 'social', name: 'Social Links', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z', description: 'Social media icons' },
    { id: 'footer', name: 'Footer', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2zM5 12h14', description: 'Footer with unsubscribe' }
];

// Default settings for each widget type
const getDefaultSettings = (type) => {
    const defaults = {
        header: { title: 'Your Company', subtitle: '', bgColor: '#4F46E5', textColor: '#FFFFFF', align: 'center', padding: '30' },
        text: { content: 'Enter your text here...', fontSize: '16', textColor: '#374151', align: 'left', padding: '20' },
        image: { src: 'https://via.placeholder.com/600x200', alt: 'Image', width: '100', align: 'center', padding: '10' },
        button: { text: 'Click Here', url: '#', bgColor: '#4F46E5', textColor: '#FFFFFF', align: 'center', borderRadius: '6', padding: '20' },
        divider: { color: '#E5E7EB', height: '1', padding: '20' },
        columns: { leftContent: 'Left column content', rightContent: 'Right column content', padding: '20' },
        spacer: { height: '40' },
        social: { facebook: '#', twitter: '#', instagram: '#', linkedin: '#', padding: '20' },
        footer: { text: '© 2024 Your Company. All rights reserved.', address: '123 Main St, City', unsubscribe: 'Unsubscribe', bgColor: '#F3F4F6', textColor: '#6B7280', padding: '30' }
    };
    return defaults[type] || {};
};

// Generate HTML from widget
const widgetToHtml = (widget) => {
    const s = widget.settings;
    switch (widget.type) {
        case 'header':
            return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${s.bgColor};padding:${s.padding}px;text-align:${s.align};">
                <tr><td><h1 style="color:${s.textColor};margin:0;font-size:28px;">${s.title}</h1>
                ${s.subtitle ? `<p style="color:${s.textColor};opacity:0.8;margin:10px 0 0;">${s.subtitle}</p>` : ''}</td></tr>
            </table>`;
        case 'text':
            return `<table width="100%" cellpadding="0" cellspacing="0" style="padding:${s.padding}px;">
                <tr><td style="font-size:${s.fontSize}px;color:${s.textColor};text-align:${s.align};line-height:1.6;">${s.content.replace(/\n/g, '<br/>')}</td></tr>
            </table>`;
        case 'image':
            return `<table width="100%" cellpadding="0" cellspacing="0" style="padding:${s.padding}px;text-align:${s.align};">
                <tr><td><img src="${s.src}" alt="${s.alt}" style="max-width:${s.width}%;height:auto;display:inline-block;" /></td></tr>
            </table>`;
        case 'button':
            return `<table width="100%" cellpadding="0" cellspacing="0" style="padding:${s.padding}px;text-align:${s.align};">
                <tr><td><a href="${s.url}" style="display:inline-block;background-color:${s.bgColor};color:${s.textColor};padding:14px 28px;text-decoration:none;font-weight:600;border-radius:${s.borderRadius}px;">${s.text}</a></td></tr>
            </table>`;
        case 'divider':
            return `<table width="100%" cellpadding="0" cellspacing="0" style="padding:${s.padding}px 0;">
                <tr><td><hr style="border:none;border-top:${s.height}px solid ${s.color};margin:0;" /></td></tr>
            </table>`;
        case 'columns':
            return `<table width="100%" cellpadding="0" cellspacing="0" style="padding:${s.padding}px;">
                <tr><td width="50%" style="padding-right:10px;vertical-align:top;">${s.leftContent}</td>
                <td width="50%" style="padding-left:10px;vertical-align:top;">${s.rightContent}</td></tr>
            </table>`;
        case 'spacer':
            return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:${s.height}px;"></td></tr></table>`;
        case 'social':
            const socialIcons = [];
            if (s.facebook) socialIcons.push(`<a href="${s.facebook}" style="margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" width="24"/></a>`);
            if (s.twitter) socialIcons.push(`<a href="${s.twitter}" style="margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" width="24"/></a>`);
            if (s.instagram) socialIcons.push(`<a href="${s.instagram}" style="margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/24/733/733558.png" alt="Instagram" width="24"/></a>`);
            if (s.linkedin) socialIcons.push(`<a href="${s.linkedin}" style="margin:0 8px;"><img src="https://cdn-icons-png.flaticon.com/24/733/733561.png" alt="LinkedIn" width="24"/></a>`);
            return `<table width="100%" cellpadding="0" cellspacing="0" style="padding:${s.padding}px;text-align:center;">
                <tr><td>${socialIcons.join('')}</td></tr>
            </table>`;
        case 'footer':
            return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${s.bgColor};padding:${s.padding}px;text-align:center;">
                <tr><td style="color:${s.textColor};font-size:12px;">
                    <p style="margin:0 0 10px;">${s.text}</p>
                    <p style="margin:0 0 10px;">${s.address}</p>
                    <a href="#" style="color:${s.textColor};">${s.unsubscribe}</a>
                </td></tr>
            </table>`;
        default:
            return '';
    }
};

// Full email HTML wrapper
const generateFullHtml = (widgets) => {
    const bodyHtml = widgets.map(widgetToHtml).join('\n');
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <tr><td>
${bodyHtml}
                    </td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

export default function EmailTemplateEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const canvasRef = useRef(null);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Marketing');
    const [widgets, setWidgets] = useState([]);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [viewMode, setViewMode] = useState('visual');
    const [showPreview, setShowPreview] = useState(false);
    const [templateVariables, setTemplateVariables] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [activeInput, setActiveInput] = useState(null);

    // Fetch template variables from API
    useEffect(() => {
        const fetchVariables = async () => {
            try {
                const response = await templatesAPI.getVariables();
                setTemplateVariables(response.data || []);
            } catch (error) {
                setTemplateVariables([
                    { variable_key: 'first_name', label: 'First Name', category: 'contact' },
                    { variable_key: 'last_name', label: 'Last Name', category: 'contact' },
                    { variable_key: 'email', label: 'Email', category: 'contact' },
                    { variable_key: 'company', label: 'Company', category: 'company' },
                ]);
            }
        };
        fetchVariables();
    }, []);

    // Load existing template
    useEffect(() => {
        if (isEditing) {
            loadTemplate();
        }
    }, [id]);

    const loadTemplate = async () => {
        try {
            const response = await templatesAPI.getById(id);
            const template = response.data;
            setTemplateName(template.name || '');
            setSubject(template.subject || '');
            setCategory(template.category || 'Marketing');
            if (template.body) {
                setWidgets([{ id: Date.now(), type: 'text', settings: { ...getDefaultSettings('text'), content: template.body } }]);
            }
        } catch (error) {
            toast.error('Failed to load template');
            navigate('/communications/templates');
        } finally {
            setLoading(false);
        }
    };

    // Drag handlers for widgets from sidebar
    const handleWidgetDragStart = (e, widgetType) => {
        setDraggedItem({ type: 'new-widget', widgetType });
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', widgetType);
    };

    // Drag handlers for reordering existing widgets
    const handleCanvasWidgetDragStart = (e, index) => {
        setDraggedItem({ type: 'reorder', index });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = draggedItem?.type === 'new-widget' ? 'copy' : 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        setDragOverIndex(null);

        if (!draggedItem) return;

        if (draggedItem.type === 'new-widget') {
            // Add new widget at position
            const newWidget = {
                id: Date.now(),
                type: draggedItem.widgetType,
                settings: getDefaultSettings(draggedItem.widgetType)
            };
            const newWidgets = [...widgets];
            newWidgets.splice(dropIndex, 0, newWidget);
            setWidgets(newWidgets);
            setSelectedWidget(newWidget);
            toast.success(`Added ${WIDGETS.find(w => w.id === draggedItem.widgetType)?.name}`);
        } else if (draggedItem.type === 'reorder') {
            // Reorder existing widget
            const dragIndex = draggedItem.index;
            if (dragIndex === dropIndex) return;

            const newWidgets = [...widgets];
            const [removed] = newWidgets.splice(dragIndex, 1);
            newWidgets.splice(dropIndex > dragIndex ? dropIndex - 1 : dropIndex, 0, removed);
            setWidgets(newWidgets);
        }

        setDraggedItem(null);
    };

    const handleCanvasDropZone = (e) => {
        e.preventDefault();
        if (draggedItem?.type === 'new-widget') {
            const newWidget = {
                id: Date.now(),
                type: draggedItem.widgetType,
                settings: getDefaultSettings(draggedItem.widgetType)
            };
            setWidgets(prev => [...prev, newWidget]);
            setSelectedWidget(newWidget);
            toast.success(`Added ${WIDGETS.find(w => w.id === draggedItem.widgetType)?.name}`);
        }
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    // Variable drag handlers
    const handleVariableDragStart = (e, variable) => {
        const varStr = `{{${variable.variable_key}}}`;
        e.dataTransfer.setData('text/plain', varStr);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const insertVariable = (variable) => {
        const varStr = `{{${variable.variable_key}}}`;
        if (activeInput && selectedWidget) {
            updateWidgetSettings(selectedWidget.id, activeInput, selectedWidget.settings[activeInput] + varStr);
            toast.success(`Inserted ${varStr}`);
        } else {
            navigator.clipboard.writeText(varStr);
            toast.success(`Copied ${varStr} to clipboard`);
        }
    };

    const addWidget = (type) => {
        const newWidget = {
            id: Date.now(),
            type,
            settings: getDefaultSettings(type)
        };
        setWidgets(prev => [...prev, newWidget]);
        setSelectedWidget(newWidget);
    };

    const updateWidgetSettings = (widgetId, key, value) => {
        setWidgets(prev => prev.map(w =>
            w.id === widgetId ? { ...w, settings: { ...w.settings, [key]: value } } : w
        ));
        if (selectedWidget?.id === widgetId) {
            setSelectedWidget(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
        }
    };

    const removeWidget = (widgetId) => {
        setWidgets(prev => prev.filter(w => w.id !== widgetId));
        if (selectedWidget?.id === widgetId) {
            setSelectedWidget(null);
        }
    };

    const duplicateWidget = (widget) => {
        const newWidget = {
            ...widget,
            id: Date.now(),
            settings: { ...widget.settings }
        };
        const index = widgets.findIndex(w => w.id === widget.id);
        const newWidgets = [...widgets];
        newWidgets.splice(index + 1, 0, newWidget);
        setWidgets(newWidgets);
        toast.success('Widget duplicated');
    };

    const handleSave = async () => {
        if (!templateName.trim()) {
            toast.error('Template name is required');
            return;
        }
        if (!subject.trim()) {
            toast.error('Subject line is required');
            return;
        }

        setSaving(true);
        try {
            const htmlBody = generateFullHtml(widgets);
            const data = {
                name: templateName,
                subject,
                category,
                body: htmlBody,
                status: 'active'
            };

            if (isEditing) {
                await templatesAPI.update(id, data);
                toast.success('Template updated');
            } else {
                await templatesAPI.create(data);
                toast.success('Template created');
            }
            navigate('/communications/templates');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const generatedHtml = generateFullHtml(widgets);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Group variables by category
    const groupedVariables = templateVariables.reduce((acc, v) => {
        const cat = v.category || 'custom';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(v);
        return acc;
    }, {});

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-100 dark:bg-slate-950">
            {/* Top Bar */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/communications/templates')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Untitled Template"
                        className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white w-56"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="select text-sm h-9">
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="Post-Sale">Post-Sale</option>
                        <option value="Transactional">Transactional</option>
                    </select>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject line..."
                        className="input text-sm h-9 w-56"
                    />
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`p-2 rounded-lg transition-colors ${showPreview ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                        title="Toggle Preview"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary h-9 px-4">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Widgets & Variables */}
                <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
                    {/* Tab Switcher */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setViewMode('visual')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${viewMode === 'visual' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Blocks
                        </button>
                        <button
                            onClick={() => setViewMode('code')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${viewMode === 'code' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Code
                        </button>
                    </div>

                    {viewMode === 'visual' ? (
                        <div className="flex-1 overflow-y-auto p-3 space-y-4">
                            {/* Content Blocks - Draggable */}
                            <div>
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Drag to Add</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {WIDGETS.map(w => (
                                        <div
                                            key={w.id}
                                            draggable
                                            onDragStart={(e) => handleWidgetDragStart(e, w.id)}
                                            onClick={() => addWidget(w.id)}
                                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-grab active:cursor-grabbing transition-all group"
                                            title={w.description}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 flex items-center justify-center transition-colors">
                                                <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={w.icon} />
                                                </svg>
                                            </div>
                                            <span className="text-[11px] text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 font-medium">{w.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Variables - Draggable */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                                    Variables
                                    <span className="text-[10px] normal-case font-normal ml-1 text-slate-400">(drag or click)</span>
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(groupedVariables).map(([cat, vars]) => (
                                        <div key={cat}>
                                            <p className="text-[10px] text-slate-400 uppercase mb-1 px-1">{cat}</p>
                                            <div className="space-y-1">
                                                {vars.map(v => (
                                                    <div
                                                        key={v.variable_key}
                                                        draggable
                                                        onDragStart={(e) => handleVariableDragStart(e, v)}
                                                        onClick={() => insertVariable(v)}
                                                        className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-grab active:cursor-grabbing transition-colors group"
                                                    >
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">{v.label}</span>
                                                        <code className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
                                                            {`{{${v.variable_key}}}`}
                                                        </code>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 p-3">
                            <textarea
                                value={generatedHtml}
                                readOnly
                                className="w-full h-full font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-lg border border-slate-700 resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* Center - Canvas */}
                <div
                    ref={canvasRef}
                    className="flex-1 overflow-auto p-6"
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(widgets.length); }}
                    onDrop={handleCanvasDropZone}
                >
                    <div className="max-w-xl mx-auto">
                        {widgets.length === 0 ? (
                            <div
                                className={`rounded-2xl border-2 border-dashed p-16 text-center transition-all ${draggedItem ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600'
                                    }`}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {draggedItem ? 'Drop here to add' : 'Start Building'}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Drag blocks from the left sidebar or click to add
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                                {widgets.map((widget, index) => (
                                    <div key={widget.id}>
                                        {/* Drop zone indicator */}
                                        {dragOverIndex === index && (
                                            <div className="h-1 bg-indigo-500 mx-4 rounded-full animate-pulse" />
                                        )}
                                        <div
                                            draggable
                                            onDragStart={(e) => handleCanvasWidgetDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onClick={() => setSelectedWidget(widget)}
                                            className={`relative group cursor-pointer ${selectedWidget?.id === widget.id
                                                    ? 'ring-2 ring-indigo-500 ring-inset'
                                                    : 'hover:ring-2 hover:ring-slate-300 hover:ring-inset'
                                                }`}
                                        >
                                            <div dangerouslySetInnerHTML={{ __html: widgetToHtml(widget) }} />

                                            {/* Widget Controls */}
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all flex gap-0.5 bg-white dark:bg-slate-700 rounded-lg shadow-lg p-0.5">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); duplicateWidget(widget); }}
                                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-500 hover:text-slate-700"
                                                    title="Duplicate"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-slate-500 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Drag handle */}
                                            <div className="absolute top-1/2 -translate-y-1/2 left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Final drop zone */}
                                {dragOverIndex === widgets.length && (
                                    <div className="h-1 bg-indigo-500 mx-4 mb-2 rounded-full animate-pulse" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Properties */}
                {selectedWidget && (
                    <div className="w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
                        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={WIDGETS.find(w => w.id === selectedWidget.type)?.icon || ''} />
                                    </svg>
                                </span>
                                {selectedWidget.type}
                            </h3>
                            <button onClick={() => setSelectedWidget(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-4">
                            {Object.entries(selectedWidget.settings).map(([key, value]) => (
                                <div key={key}>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                                        {key.replace(/([A-Z])/g, ' $1')}
                                    </label>
                                    {key.includes('Color') ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={value}
                                                onChange={(e) => updateWidgetSettings(selectedWidget.id, key, e.target.value)}
                                                className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer overflow-hidden"
                                            />
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => updateWidgetSettings(selectedWidget.id, key, e.target.value)}
                                                onFocus={() => setActiveInput(key)}
                                                className="input flex-1 text-sm h-10"
                                            />
                                        </div>
                                    ) : key === 'align' ? (
                                        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                            {['left', 'center', 'right'].map(align => (
                                                <button
                                                    key={align}
                                                    onClick={() => updateWidgetSettings(selectedWidget.id, key, align)}
                                                    className={`flex-1 py-2 rounded-md text-sm capitalize transition-colors ${value === align
                                                            ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white'
                                                            : 'text-slate-500 hover:text-slate-700'
                                                        }`}
                                                >
                                                    {align}
                                                </button>
                                            ))}
                                        </div>
                                    ) : key === 'content' || key === 'leftContent' || key === 'rightContent' ? (
                                        <textarea
                                            value={value}
                                            onChange={(e) => updateWidgetSettings(selectedWidget.id, key, e.target.value)}
                                            onFocus={() => setActiveInput(key)}
                                            className="input min-h-28 text-sm"
                                            placeholder="Type content or drag variables here..."
                                        />
                                    ) : (
                                        <input
                                            type={key.includes('height') || key.includes('Size') || key.includes('width') || key.includes('padding') || key.includes('Radius') ? 'number' : 'text'}
                                            value={value}
                                            onChange={(e) => updateWidgetSettings(selectedWidget.id, key, e.target.value)}
                                            onFocus={() => setActiveInput(key)}
                                            className="input text-sm h-10"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Quick Variable Insert */}
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                            <p className="text-[10px] text-slate-400 uppercase font-medium mb-2">Quick Insert Variable</p>
                            <div className="flex flex-wrap gap-1">
                                {templateVariables.slice(0, 6).map(v => (
                                    <button
                                        key={v.variable_key}
                                        onClick={() => insertVariable(v)}
                                        className="px-2 py-1 text-[10px] bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview Panel */}
                {showPreview && (
                    <div className="w-96 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
                        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Preview</h3>
                            <div className="flex gap-1 text-xs">
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Desktop</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <iframe
                                    srcDoc={generatedHtml}
                                    className="w-full h-[600px]"
                                    title="Email Preview"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
