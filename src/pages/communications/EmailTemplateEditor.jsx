import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { templatesAPI } from '../../api';

// Widget types
const WIDGETS = [
    { id: 'header', name: 'Header', icon: 'M4 6h16M4 12h16M4 18h7' },
    { id: 'text', name: 'Text Block', icon: 'M4 6h16M4 12h8m-8 6h16' },
    { id: 'image', name: 'Image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'button', name: 'Button', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122' },
    { id: 'divider', name: 'Divider', icon: 'M5 12h14' },
    { id: 'columns', name: '2 Columns', icon: 'M9 4v16m6-16v16M4 7h4m-4 5h4m-4 5h4m8-10h4m-4 5h4m-4 5h4' },
    { id: 'spacer', name: 'Spacer', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' },
    { id: 'social', name: 'Social Links', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z' },
    { id: 'footer', name: 'Footer', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2zM5 12h14' }
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

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Marketing');
    const [widgets, setWidgets] = useState([]);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [viewMode, setViewMode] = useState('visual'); // 'visual' | 'code'
    const [showPreview, setShowPreview] = useState(false);
    const [templateVariables, setTemplateVariables] = useState([]);

    // Fetch template variables from API
    useEffect(() => {
        const fetchVariables = async () => {
            try {
                const response = await templatesAPI.getVariables();
                setTemplateVariables(response.data || []);
            } catch (error) {
                console.error('Failed to fetch variables:', error);
                // Fallback to defaults
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

            // Try to parse widgets from body, or start with default
            if (template.body) {
                // For existing templates, create a text widget with the HTML
                setWidgets([{ id: Date.now(), type: 'text', settings: { ...getDefaultSettings('text'), content: template.body } }]);
            }
        } catch (error) {
            toast.error('Failed to load template');
            navigate('/communications/templates');
        } finally {
            setLoading(false);
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

    const moveWidget = (widgetId, direction) => {
        const index = widgets.findIndex(w => w.id === widgetId);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === widgets.length - 1)) return;

        const newWidgets = [...widgets];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];
        setWidgets(newWidgets);
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

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            {/* Top Bar */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/communications/templates')} className="btn-ghost">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Template name..."
                        className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white w-64"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="select text-sm">
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
                        placeholder="Email subject..."
                        className="input text-sm w-64"
                    />
                    <button onClick={() => setShowPreview(!showPreview)} className={`btn-ghost ${showPreview ? 'text-indigo-600' : ''}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Widgets */}
                <div className="w-56 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto flex-shrink-0">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Content Blocks</h3>
                    <div className="space-y-2">
                        {WIDGETS.map(w => (
                            <button
                                key={w.id}
                                onClick={() => addWidget(w.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all text-slate-700 dark:text-slate-300"
                            >
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={w.icon} />
                                </svg>
                                {w.name}
                            </button>
                        ))}
                    </div>

                    {/* Template Variables */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Variables</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Click to copy, then paste in any text field</p>
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                            {templateVariables.map(v => (
                                <button
                                    key={v.variable_key}
                                    onClick={() => {
                                        const varStr = `{{${v.variable_key}}}`;
                                        navigator.clipboard.writeText(varStr);
                                        toast.success(`Copied ${varStr}`);
                                    }}
                                    className="w-full flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-white dark:hover:bg-slate-800 transition-colors group"
                                >
                                    <span className="text-slate-600 dark:text-slate-400">{v.label}</span>
                                    <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded text-[10px] group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
                                        {`{{${v.variable_key}}}`}
                                    </code>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center - Canvas */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-auto p-6">
                    {/* View Toggle */}
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm">
                            <button onClick={() => setViewMode('visual')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                Visual
                            </button>
                            <button onClick={() => setViewMode('code')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                HTML Code
                            </button>
                        </div>
                    </div>

                    {viewMode === 'visual' ? (
                        <div className="max-w-2xl mx-auto">
                            {widgets.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
                                    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                    </svg>
                                    <p className="text-slate-500 dark:text-slate-400 mb-2">Start building your email</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500">Click a content block from the left sidebar</p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                                    {widgets.map((widget, index) => (
                                        <div
                                            key={widget.id}
                                            onClick={() => setSelectedWidget(widget)}
                                            className={`relative group cursor-pointer ${selectedWidget?.id === widget.id ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
                                        >
                                            {/* Widget Preview */}
                                            <div dangerouslySetInnerHTML={{ __html: widgetToHtml(widget) }} />

                                            {/* Hover Controls */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, 'up'); }} className="p-1 bg-white dark:bg-slate-700 rounded shadow text-slate-500 hover:text-slate-700">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, 'down'); }} className="p-1 bg-white dark:bg-slate-700 rounded shadow text-slate-500 hover:text-slate-700">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }} className="p-1 bg-white dark:bg-slate-700 rounded shadow text-red-500 hover:text-red-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <textarea
                                value={generatedHtml}
                                readOnly
                                className="w-full h-[500px] font-mono text-sm bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-700"
                            />
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Properties */}
                {selectedWidget && (
                    <div className="w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4 overflow-y-auto flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white capitalize">{selectedWidget.type} Settings</h3>
                            <button onClick={() => setSelectedWidget(null)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(selectedWidget.settings).map(([key, value]) => (
                                <div key={key}>
                                    <label className="label capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                    {key.includes('Color') ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={value}
                                                onChange={(e) => updateWidgetSettings(selectedWidget.id, key, e.target.value)}
                                                className="w-10 h-10 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => updateWidgetSettings(selectedWidget.id, key, e.target.value)}
                                                className="input flex-1"
                                            />
                                        </div>
                                    ) : key === 'align' ? (
                                        <select
                                            value={value}
                                            onChange={(e) => updateWidgetSettings(selectedWidget.id, key, e.target.value)}
                                            className="select"
                                        >
                                            <option value="left">Left</option>
                                            <option value="center">Center</option>
                                            <option value="right">Right</option>
                                        </select>
                                    ) : key === 'content' || key === 'leftContent' || key === 'rightContent' ? (
                                        <textarea
                                            value={value}
                                            onChange={(e) => updateWidgetSettings(selectedWidget.id, key, e.target.value)}
                                            className="input min-h-24"
                                        />
                                    ) : (
                                        <input
                                            type={key.includes('height') || key.includes('Size') || key.includes('width') || key.includes('padding') || key.includes('Radius') ? 'number' : 'text'}
                                            value={value}
                                            onChange={(e) => updateWidgetSettings(selectedWidget.id, key, e.target.value)}
                                            className="input"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Preview Panel */}
                {showPreview && (
                    <div className="w-96 bg-slate-100 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex-shrink-0 flex flex-col">
                        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Live Preview</h3>
                        </div>
                        <div className="flex-1 overflow-auto p-3">
                            <iframe
                                srcDoc={generatedHtml}
                                className="w-full h-full bg-white rounded-lg shadow-sm"
                                title="Email Preview"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
