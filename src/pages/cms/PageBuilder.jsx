import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import SidebarTools from '../../components/builder/SidebarTools';
import BuilderCanvas from '../../components/builder/BuilderCanvas';
import InspectorPanel from '../../components/builder/InspectorPanel';
import { FiSave, FiEye, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const PageBuilder = () => {
    const [elements, setElements] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [activeDragItem, setActiveDragItem] = useState(null); // For overlay
    const [isPreview, setIsPreview] = useState(false); // Preview Mode

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Actions ---

    const handleSelect = (id) => {
        if (!isPreview) setSelectedId(id);
    };

    const handleUpdateElement = (id, updates) => {
        setElements((prev) =>
            prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
        );
    };

    // --- DND Logic ---

    const handleDragStart = (event) => {
        const { active } = event;
        // Find the full element data if it's an existing item
        if (active.data.current?.isCanvasElement) {
            const element = elements.find(e => e.id === active.id);
            setActiveDragItem({ ...element, isCanvasElement: true });
        } else {
            setActiveDragItem(active.data.current);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        // 1. Dragging from Sidebar to Canvas
        if (active.data.current?.isTool) {
            const type = active.data.current.type;
            const newElement = {
                id: `${type}-${Date.now()}`,
                type: type,
                content: type === 'hero' ? {
                    title: 'Strategic Growth',
                    subtitle: 'We help you scale your business with data-driven insights.',
                    cta: 'Get Started',
                    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0'
                } : type === 'features' ? {
                    features: [
                        { title: 'Responsive Design', text: 'Looks great on all devices.', icon: 'monitor' },
                        { title: 'Data Analytics', text: 'Track your growth in real-time.', icon: 'trend' },
                        { title: 'Secure Platform', text: 'Enterprise-grade security.', icon: 'shield' }
                    ]
                } : type === 'pricing' ? {
                    plans: [
                        { name: 'Starter', price: '$29', features: ['5 Projects', 'Basic Analytics', 'Support'] },
                        { name: 'Pro', price: '$99', features: ['Unlimited Projects', 'Advanced Analytics', 'Priority Support'], isPopular: true },
                        { name: 'Enterprise', price: 'Custom', features: ['Dedicated Manager', 'SSO', 'SLA'] }
                    ]
                } : type === 'cta' ? {
                    title: 'Ready to Get Started?',
                    text: 'Join thousands of satisfied customers today.',
                    buttonText: 'Sign Up Now',
                    buttonLink: '#'
                } : type === 'form' ? { // Contact Form
                    title: 'Contact Us',
                    subtitle: 'Have questions? We would love to hear from you.',
                    buttonText: 'Send Message',
                    defaultSubject: 'New Inquiry from Website'
                } : type === 'text' ? 'New Text Block' : type === 'button' ? 'Click Me' : '',
                style: {
                    padding: '10px',
                    margin: '0px'
                }
            };

            setElements((prev) => [...prev, newElement]);
            setSelectedId(newElement.id); // Auto-select
            return;
        }

        // 2. Sorting within Canvas
        if (active.id !== over.id && active.data.current?.isCanvasElement) {
            setElements((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const selectedElement = elements.find((el) => el.id === selectedId);

    // Helper to render overlay atom
    const renderDragOverlay = () => {
        if (!activeDragItem) return null;

        const style = {
            opacity: 0.8,
            cursor: 'grabbing',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            width: '300px'
        };

        if (activeDragItem.isTool) {
            return (
                <div style={style} className="shadow-xl flex items-center gap-3">
                    <span className="font-bold">New {activeDragItem.type}</span>
                </div>
            );
        }

        // If sorting, render a crude preview of the element content
        return (
            <div style={style} className="shadow-xl">
                <div className="font-bold mb-1 text-xs text-slate-400 uppercase">{activeDragItem.type}</div>
                <div className="truncate">{activeDragItem.content || 'Content'}</div>
            </div>
        );
    };

    const handleSave = async () => {
        try {
            // Hardcoded slug/title for now - in full version this would be dynamic
            const payload = {
                slug: 'home-landing',
                title: 'Home Landing Page',
                content: elements,
                status: 'published'
            };

            const response = await fetch('http://localhost:5000/api/cms/pages/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Page saved successfully!');
            } else {
                alert('Failed to save page.');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Error saving page');
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full overflow-hidden bg-slate-100">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <Link to="/cms/pages" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                            <FiArrowLeft />
                        </Link>
                        <div>
                            <h1 className="font-bold text-lg">Untitled Page</h1>
                            <span className="text-xs text-slate-400">Draft</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isPreview ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <FiEye /> {isPreview ? 'Edit' : 'Preview'}
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                        >
                            <FiSave /> Save Page
                        </button>
                    </div>
                </header>

                {/* Main Workspace */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: Hide in preview */}
                    <div className={`${isPreview ? 'hidden' : 'block'} w-64 shrink-0 transition-all`}>
                        <SidebarTools />
                    </div>

                    <BuilderCanvas
                        elements={elements}
                        selectedId={selectedId}
                        onSelect={handleSelect}
                    />

                    {/* Inspector: Hide in preview */}
                    <div className={`${isPreview ? 'hidden' : 'block'} w-72 shrink-0 transition-all`}>
                        <InspectorPanel
                            selectedElement={selectedElement}
                            onUpdate={handleUpdateElement}
                        />
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {renderDragOverlay()}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default PageBuilder;
