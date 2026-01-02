import React from 'react';

const InspectorPanel = ({ selectedElement, onUpdate }) => {
    if (!selectedElement) {
        return (
            <div className="w-72 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 p-8 flex items-center justify-center text-center text-slate-400">
                <p>Select an element to edit its properties</p>
            </div>
        );
    }

    const { id, type, content, style } = selectedElement;

    const handleStyleChange = (key, value) => {
        onUpdate(id, {
            style: { ...style, [key]: value }
        });
    };

    const handleContentChange = (value) => {
        onUpdate(id, { content: value });
    };

    return (
        <div className="w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg capitalize">{type} Properties</h3>
                <span className="text-xs text-slate-400">ID: {id}</span>
            </div>

            <div className="p-4 space-y-6">
                {/* Content Editor */}
                {(type === 'text' || type === 'button') && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Content</label>
                        <textarea
                            className="form-input w-full"
                            value={content || ''}
                            onChange={(e) => handleContentChange(e.target.value)}
                        />
                    </div>
                )}

                {/* Hero Widget Editor */}
                {type === 'hero' && (
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hero Content</label>
                        <div>
                            <span className="text-xs">Title</span>
                            <input
                                type="text"
                                className="form-input w-full"
                                value={content?.title || ''}
                                onChange={(e) => handleContentChange({ ...content, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <span className="text-xs">Subtitle</span>
                            <textarea
                                className="form-input w-full h-16"
                                value={content?.subtitle || ''}
                                onChange={(e) => handleContentChange({ ...content, subtitle: e.target.value })}
                            />
                        </div>
                        <div>
                            <span className="text-xs">CTA Text</span>
                            <input
                                type="text"
                                className="form-input w-full"
                                value={content?.cta || ''}
                                onChange={(e) => handleContentChange({ ...content, cta: e.target.value })}
                            />
                        </div>
                        <div>
                            <span className="text-xs">Background Image URL</span>
                            <input
                                type="text"
                                className="form-input w-full"
                                value={content?.image || ''}
                                onChange={(e) => handleContentChange({ ...content, image: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* Style Editors */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Typography</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-xs">Color</span>
                            <input
                                type="color"
                                className="w-full h-8 cursor-pointer"
                                value={style?.color || '#000000'}
                                onChange={(e) => handleStyleChange('color', e.target.value)}
                            />
                        </div>
                        <div>
                            <span className="text-xs">Size (px)</span>
                            <input
                                type="number"
                                className="form-input w-full"
                                value={parseInt(style?.fontSize) || 16}
                                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                            />
                        </div>
                        <div>
                            <span className="text-xs">Align</span>
                            <select
                                className="form-select w-full"
                                value={style?.textAlign || 'left'}
                                onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Spacing</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-xs">Padding</span>
                            <input
                                type="text"
                                className="form-input w-full"
                                placeholder="10px"
                                value={style?.padding || ''}
                                onChange={(e) => handleStyleChange('padding', e.target.value)}
                            />
                        </div>
                        <div>
                            <span className="text-xs">Margin</span>
                            <input
                                type="text"
                                className="form-input w-full"
                                placeholder="10px"
                                value={style?.margin || ''}
                                onChange={(e) => handleStyleChange('margin', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Background</label>
                    <input
                        type="color"
                        className="w-full h-8 cursor-pointer"
                        value={style?.backgroundColor || '#ffffff'}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default InspectorPanel;
