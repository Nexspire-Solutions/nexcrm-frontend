import React from 'react';
import { useEditor } from './EditorProvider';
import RenderNode from './RenderNode';

const Canvas = () => {
    const { state } = useEditor();
    const rootNode = state.tree;

    if (!rootNode) return <div>Loading...</div>;

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-200 p-8 shadow-inner transition-all relative">
            <div className="min-h-screen bg-white mx-auto shadow-2xl transition-all" style={{ maxWidth: '100%' }}>
                <RenderNode node={rootNode} />
            </div>
        </div>
    );
};

export default Canvas;
