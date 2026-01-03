import React from 'react';
import { useEditor } from './EditorProvider';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import AtomDynamicList from '../atoms/AtomDynamicList';

const RenderNode = ({ node }) => {
    const { state, actions } = useEditor();
    const isSelected = state.selectedId === node.id;

    // Droppable Logic for containers
    const isContainer = ['Body', 'Section', 'Container', 'Grid'].includes(node.type);
    const { setNodeRef, isOver } = useDroppable({
        id: node.id,
        disabled: !isContainer,
        data: { id: node.id, type: node.type, isContainer }
    });

    // Stop propagation to select nested elements correctly
    const handleClick = (e) => {
        e.stopPropagation();
        actions.select(node.id);
    };

    // Style logic
    const baseClasses = node.props?.className || '';
    const selectedClasses = isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 relative z-10' : 'hover:ring-1 hover:ring-indigo-300 ring-inset';
    const dropClasses = isOver ? 'bg-indigo-50 ring-2 ring-indigo-400 border-indigo-400' : '';

    const componentProps = {
        ...node.props,
        // We merge our interactive handlers
        onClick: handleClick,
        // Combine classes
        className: `${baseClasses} ${selectedClasses} ${dropClasses} transition-all duration-200`,
        // Attach ref only if it's a container valid for dropping
        // ref: isContainer ? setNodeRef : undefined  <-- We handle ref explicitly below depending on tag
    };

    // Recursive Children Rendering
    const children = node.children?.map(child => (
        <RenderNode key={child.id} node={child} />
    ));

    // --- Render Logic ---
    // Note: We MUST pass setNodeRef to the DOM element for dnd-kit storage

    if (node.type === 'Body') {
        const isEmpty = !children || children.length === 0;
        return (
            <div {...componentProps} ref={setNodeRef}>
                {children}
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center p-12 border-4 border-dashed border-slate-200 rounded-3xl m-12 pointer-events-auto bg-white/50 backdrop-blur-sm">
                            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Start Building Your Page</h2>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                Drag a <strong>Section</strong> from the sidebar to begin, or choose a pre-made template.
                            </p>
                            <div className="flex justify-center gap-4">
                                <a href="/cms/templates" className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                    Browse Templates
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (node.type === 'Section') {
        return <section {...componentProps} ref={setNodeRef}>{children}</section>;
    }

    if (node.type === 'Container') {
        return <div {...componentProps} ref={setNodeRef}>{children}</div>;
    }

    if (node.type === 'Grid') {
        return <div {...componentProps} ref={setNodeRef}>{children}</div>;
    }

    // Non-container elements (no ref for dropping)
    if (node.type === 'Heading') {
        const Tag = node.props.tag || 'h2';
        return <Tag {...componentProps}>{node.props.text}</Tag>;
    }

    if (node.type === 'Text') {
        return <p {...componentProps}>{node.props.text}</p>;
    }

    if (node.type === 'Button') {
        return <a {...componentProps}>{node.props.text}</a>;
    }

    if (node.type === 'Image') {
        return <img {...componentProps} />;
    }

    if (node.type === 'HtmlBlock') {
        return (
            <div
                {...componentProps}
                dangerouslySetInnerHTML={{ __html: node.props.html }}
            />
        );
    }

    if (node.type === 'dynamic_list') {
        return (
            <div {...componentProps} ref={setNodeRef}>
                <AtomDynamicList
                    dataSource={node.content?.dataSource || node.props?.dataSource}
                    limit={node.content?.limit || node.props?.limit}
                    title={node.content?.title || node.props?.title}
                    layout={node.content?.layout || node.props?.layout}
                />
            </div>
        );
    }

    return <div className="p-4 bg-red-100 text-red-500">Unknown Type: {node.type}</div>;
};

export default RenderNode;
