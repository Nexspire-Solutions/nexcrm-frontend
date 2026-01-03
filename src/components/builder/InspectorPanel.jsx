import React from 'react';
import { SECTION_SCHEMAS } from '../../pages/cms/sectionSchemas';

const InspectorPanel = ({ selectedElement, onUpdate }) => {
    if (!selectedElement) {
        return (
            <div className="w-72 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-8 flex items-center justify-center text-center text-slate-400">
                <p>Select an element to edit its properties</p>
            </div>
        );
    }

    const { id, type, content, props, style } = selectedElement;

    const handleStyleChange = (key, value) => {
        onUpdate(id, {
            style: { ...style, [key]: value }
        });
    };

    const handleContentChange = (key, value) => {
        // Handle both simple content (string) and object content
        if (typeof content === 'object') {
            onUpdate(id, { content: { ...content, [key]: value } });
        } else {
            // For simple text/button where content is string, we might need to adjust strategy
            // But for sections using schemas, content/props are usually objects
            onUpdate(id, { content: value });
        }
    };

    const handlePropChange = (key, value) => {
        onUpdate(id, {
            props: { ...props, [key]: value }
        });
    };

    // Helper to render inputs based on schema
    const renderSchemaFields = (schema) => {
        return schema.fields.map((field) => (
            <div key={field.name} className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{field.label}</label>

                {field.type === 'text' && (
                    <input
                        type="text"
                        className="form-input w-full"
                        value={props?.[field.name] || content?.[field.name] || ''}
                        onChange={(e) => handlePropChange(field.name, e.target.value)}
                    />
                )}

                {field.type === 'number' && (
                    <input
                        type="number"
                        className="form-input w-full"
                        value={props?.[field.name] || content?.[field.name] || 0}
                        onChange={(e) => handlePropChange(field.name, e.target.value)}
                    />
                )}

                {field.type === 'textarea' && (
                    <textarea
                        className="form-input w-full h-24"
                        value={props?.[field.name] || content?.[field.name] || ''}
                        onChange={(e) => handlePropChange(field.name, e.target.value)}
                    />
                )}

                {field.type === 'select' && (
                    <select
                        className="form-select w-full"
                        value={props?.[field.name] || content?.[field.name] || field.default}
                        onChange={(e) => handlePropChange(field.name, e.target.value)}
                    >
                        {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                )}
            </div>
        ));
    };

    const schema = SECTION_SCHEMAS[type];

    return (
        <div className="w-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg capitalize">{schema?.label || type} Properties</h3>
                <span className="text-xs text-slate-400">ID: {id}</span>
            </div>

            <div className="p-4 space-y-6">

                {/* 1. Dynamic Fields from Schema (for complex sections) */}
                {schema && (
                    <div className="border-b pb-4 mb-4 border-slate-100">
                        <h4 className="font-bold text-sm mb-3">Settings</h4>
                        {renderSchemaFields(schema)}
                    </div>
                )}

                {/* 2. Legacy/Simple Fields (if no schema matches) */}
                {!schema && (type === 'text' || type === 'heading' || type === 'button') && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Text Content</label>
                        <textarea
                            className="form-input w-full"
                            value={props?.text || ''}
                            onChange={(e) => handlePropChange('text', e.target.value)}
                        />
                    </div>
                )}

                {/* 3. Style Editors (Global for all) */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Appearance</label>
                    <div className="space-y-3">
                        {/* Common Styles */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-xs text-slate-400">Text Color</span>
                                <input
                                    type="color"
                                    className="w-full h-8 cursor-pointer border rounded"
                                    value={style?.color || '#000000'}
                                    onChange={(e) => handleStyleChange('color', e.target.value)}
                                />
                            </div>
                            <div>
                                <span className="text-xs text-slate-400">Bg Color</span>
                                <input
                                    type="color"
                                    className="w-full h-8 cursor-pointer border rounded"
                                    value={style?.backgroundColor || '#ffffff'}
                                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-slate-400">Padding (e.g. 20px)</span>
                            <input
                                type="text"
                                className="form-input w-full"
                                value={style?.padding || ''}
                                onChange={(e) => handleStyleChange('padding', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspectorPanel;
