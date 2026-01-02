import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash, FiSave, FiLink, FiMenu, FiMove } from 'react-icons/fi';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableItem = ({ item, index, onChange, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-4 items-start bg-white p-4 rounded-lg border border-slate-200 shadow-sm group">
            <div {...attributes} {...listeners} className="mt-3 text-slate-400 cursor-grab hover:text-slate-600">
                <FiMove />
            </div>

            <div className="flex-1 space-y-3">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Label</label>
                        <input
                            type="text"
                            value={item.label}
                            onChange={(e) => onChange(item.id, 'label', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            placeholder="Link Text"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">URL</label>
                        <input
                            type="text"
                            value={item.href}
                            onChange={(e) => onChange(item.id, 'href', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            placeholder="/page-url"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={() => onDelete(item.id)}
                className="mt-3 text-slate-400 hover:text-red-600 transition-colors"
            >
                <FiTrash />
            </button>
        </div>
    );
};

const MenuBuilder = ({ mode = 'header' }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Sensors for Drag and Drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchMenu();
    }, [mode]);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/cms/menus');
            if (response.ok) {
                const data = await response.json();
                if (data[mode]) {
                    setItems(JSON.parse(data[mode].items));
                } else {
                    setItems([]); // Empty if new
                }
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('http://localhost:5000/api/cms/menus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    position: mode,
                    items: items
                })
            });

            if (response.ok) {
                alert('Menu saved successfully!');
            } else {
                alert('Failed to save menu.');
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { id: `item-${Date.now()}`, label: 'New Link', href: '#' }]);
    };

    const handleDeleteItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleChangeItem = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (loading) return <div className="p-10 text-center">Loading menu...</div>;

    return (
        <div className="flex h-full bg-slate-100">
            <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-8 h-full overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 capitalize flex items-center gap-2">
                            <FiMenu /> {mode} Menu
                        </h1>
                        <p className="text-slate-500 mt-1">Manage links for your site {mode}</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : <><FiSave /> Save Changes</>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(i => i.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.map((item, index) => (
                                <SortableItem
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    onChange={handleChangeItem}
                                    onDelete={handleDeleteItem}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {items.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
                            No links added yet.
                        </div>
                    )}

                    <button
                        onClick={handleAddItem}
                        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium flex items-center justify-center gap-2"
                    >
                        <FiPlus /> Add Menu Link
                    </button>
                </div>
            </div>

            {/* Preview Sidebar */}
            <div className="w-80 bg-white border-l border-slate-200 p-6 hidden lg:block">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FiLink /> Preview
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                        {mode === 'header' ? 'Navigation Bar' : 'Footer Links'}
                    </p>
                    <div className={`flex ${mode === 'header' ? 'flex-col gap-2' : 'flex-col gap-2'}`}>
                        {items.map(item => (
                            <div key={item.id} className="text-sm text-indigo-600 hover:underline cursor-default">
                                {item.label || 'Untitled'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuBuilder;
