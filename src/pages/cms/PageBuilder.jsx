import React, { useState, useEffect } from 'react';
import { EditorProvider, useEditor } from '../../components/builder/engine/EditorProvider';
import Canvas from '../../components/builder/engine/Canvas';
import CodeEditor from '../../components/builder/engine/CodeEditor';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useParams } from 'react-router-dom';

// New Layout Components
import EditorLayout from '../../components/builder/editor/EditorLayout';
import LeftPanel from '../../components/builder/editor/LeftPanel';
import RightPanel from '../../components/builder/editor/RightPanel';
import PublishModal from '../../components/builder/panels/PublishModal';

// Inner Shell to consume Editor Context
const BuilderShell = () => {
    const { actions, state } = useEditor();
    const [activeDrag, setActiveDrag] = useState(null);
    const { slug } = useParams();
    const [pageSlug, setPageSlug] = useState(slug || 'home-landing');
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        })
    );

    const handleDragStart = (e) => {
        if (e.active.data.current?.isSidebar) {
            setActiveDrag(e.active.data.current.type);
        }
    };

    const handleDragEnd = (e) => {
        const { active, over } = e;
        setActiveDrag(null);

        if (!over) return;

        if (active.data.current?.isSidebar) {
            if (active.data.current.type === 'TEMPLATE') {
                console.log('Template dropped:', active.data.current.template);
                // In future: actions.addTemplate or similar
            } else {
                const payload = active.data.current.structure ? { structure: active.data.current.structure } : {};
                actions.add(over.id, active.data.current.type, payload);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                slug: pageSlug,
                title: pageSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                content: state.tree,
                status: 'published'
            };

            const response = await fetch(import.meta.env.VITE_API_URL + '/cms/pages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('Saved successfully');
            } else {
                console.error('Failed to save');
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <EditorLayout
                onSave={handleSave}
                onPublish={() => setIsPublishModalOpen(true)}
                isSaving={isSaving}
                leftPanel={<LeftPanel />}
                rightPanel={
                    <RightPanel
                        selectedElement={state.selectedId ? state.tree[state.selectedId] : null}
                        onUpdate={(id, updates) => actions.update(id, updates)}
                    />
                }
            >
                {/* Center Canvas */}
                <Canvas />
            </EditorLayout>

            <PublishModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
            />

            <DragOverlay>
                {activeDrag ? (
                    <div className="p-2 bg-indigo-600 text-white rounded shadow-xl font-bold z-50">
                        New {activeDrag}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

// Main Page Component
const PageBuilder = () => {
    return (
        <EditorProvider>
            <BuilderShell />
        </EditorProvider>
    );
};

export default PageBuilder;
