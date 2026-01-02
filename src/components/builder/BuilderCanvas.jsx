import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableElement from './DraggableElement';

const BuilderCanvas = ({ elements, selectedId, onSelect }) => {
    const { setNodeRef } = useDroppable({
        id: 'canvas-droppable'
    });

    return (
        <div
            ref={setNodeRef}
            className="flex-1 bg-slate-100 p-8 overflow-y-auto"
            onClick={() => onSelect(null)} // Deselect on bg click
        >
            <div className="bg-white min-h-[800px] shadow-lg rounded-lg max-w-4xl mx-auto p-8 border border-slate-200">
                <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    {elements.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded">
                            Drag elements here to build your page
                        </div>
                    ) : (
                        elements.map((el) => (
                            <DraggableElement
                                key={el.id}
                                element={el}
                                isSelected={el.id === selectedId}
                                onSelect={onSelect}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

export default BuilderCanvas;
