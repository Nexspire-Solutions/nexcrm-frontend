import React, { useState } from 'react';
import { useEditor } from './EditorProvider';
import { COMPONENT_SCHEMA } from '../lib/schema';
import { FiTrash2, FiImage } from 'react-icons/fi';
import MediaLibraryModal from './MediaLibraryModal';

const Inspector = () => {
    const { state, actions } = useEditor();
    const [isMediaOpen, setIsMediaOpen] = useState(false);
    const [mediaTarget, setMediaTarget] = useState(null); // Which prop key triggered it

    // Find the selected node in the tree using the ID
    const findSelectedParams = (root, id) => {
        if (root.id === id) return { node: root };
        if (root.children) {
            for (const child of root.children) {
                const res = findSelectedParams(child, id);
                if (res) return res;
            }
        }
        return null;
    };

    const selectedParams = state.selectedId ? findSelectedParams(state.tree, state.selectedId) : null;
    const node = selectedParams?.node;

    if (!node) {
        return (
            <div className="w-72 border-l border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center text-center h-full">
                <p className="text-sm text-slate-400 font-medium">Select an element<br />to edit properties</p>
            </div>
        );
    }

    const schema = COMPONENT_SCHEMA[node.type];

    const handleChange = (key, value) => {
        actions.update(node.id, { [key]: value });
    };

    const openMediaLibrary = (key) => {
        setMediaTarget(key);
        setIsMediaOpen(true);
    };

    const handleMediaSelect = (url) => {
        if (mediaTarget) {
            handleChange(mediaTarget, url);
        }
        setIsMediaOpen(false);
        setMediaTarget(null);
    };

    return (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{node.type}</span>
                    <h3 className="text-sm font-bold text-slate-800">Properties</h3>
                </div>
                {!['root', 'body'].includes(node.id) && ( // Prevent deleting root
                    <button
                        onClick={() => actions.delete(node.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Element"
                    >
                        <FiTrash2 />
                    </button>
                )}
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* ID Display */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Element ID</label>
                    <div className="text-xs font-mono bg-slate-100 p-2 rounded text-slate-600 truncate">
                        {node.id}
                    </div>
                </div>

                {/* Dynamic Fields based on Schema Default Props (Simple version) */}
                {Object.entries(node.props).map(([key, value]) => {
                    // Determine input type
                    let inputType = 'text';
                    if (key === 'className' || key === 'html' || key === 'text') inputType = 'textarea';

                    // Label mapping
                    const labelMap = {
                        href: 'Link URL',
                        src: 'Image Source',
                        html: 'Raw HTML Code'
                    };
                    const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
                    const isImageField = key === 'src' || (key.toLowerCase().includes('image') && typeof value === 'string');

                    return (
                        <div key={key} className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 capitalize">
                                {label}
                            </label>

                            {inputType === 'textarea' ? (
                                <textarea
                                    value={value}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono h-24"
                                />
                            ) : isImageField ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleChange(key, e.target.value)}
                                        className="flex-1 text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="https://..."
                                    />
                                    <button
                                        onClick={() => openMediaLibrary(key)}
                                        className="p-2 bg-slate-100 border border-slate-300 rounded hover:bg-slate-200 transition-colors text-slate-600"
                                        title="Choose from Library"
                                    >
                                        <FiImage />
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type={inputType}
                                    value={value}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Media Library Modal */}
            <MediaLibraryModal
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
};

export default Inspector;
