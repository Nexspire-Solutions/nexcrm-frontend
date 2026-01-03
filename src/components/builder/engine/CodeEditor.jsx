import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useEditor } from './EditorProvider';

const CodeEditor = () => {
    const { state, actions } = useEditor();
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);

    // Sync state to code when switching to this view
    useEffect(() => {
        if (state.tree) {
            setCode(JSON.stringify(state.tree, null, 2));
        }
    }, [state.tree]);

    const handleEditorChange = (value) => {
        setCode(value);
        try {
            const parsed = JSON.parse(value);
            // Basic validation
            if (!parsed.id || !parsed.type) {
                throw new Error('Root node must have id and type');
            }
            setError(null);
            // Auto-save to context (debouncing would be better in prod)
            actions.load(parsed);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e]">
            <div className="h-10 bg-[#2d2d2d] flex items-center justify-between px-4 text-xs text-gray-400 border-b border-[#3e3e3e]">
                <span>page.json</span>
                {error && <span className="text-red-400 flex items-center gap-2">⚠️ {error}</span>}
                {!error && <span className="text-green-400">✓ Valid JSON</span>}
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    theme="vs-dark"
                    value={code}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        formatOnPaste: true,
                        formatOnType: true
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;
