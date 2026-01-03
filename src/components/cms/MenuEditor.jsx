import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { FiMove, FiTrash2, FiPlus, FiSave } from 'react-icons/fi';

/**
 * Sortable Menu Item Component
 */
const SortableItem = ({ id, item, onDelete, onUpdate }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-2 flex items-center gap-3 shadow-sm group">
            <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-indigo-600">
                <FiMove />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                    type="text"
                    value={item.label}
                    onChange={(e) => onUpdate(id, 'label', e.target.value)}
                    className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-sm font-medium"
                    placeholder="Label"
                />
                <input
                    type="text"
                    value={item.url}
                    onChange={(e) => onUpdate(id, 'url', e.target.value)}
                    className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-sm text-slate-500"
                    placeholder="URL (e.g., /about)"
                />
            </div>

            <button onClick={() => onDelete(id)} className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <FiTrash2 />
            </button>
        </div>
    );
};

const MenuEditor = () => {
    const [menus, setMenus] = useState([]);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);

    // sensors for dnd
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchMenus();
        fetchPages();
    }, []);

    const fetchMenus = async () => {
        try {
            const res = await apiClient.get('/cms/menus');
            setMenus(res.data || []);
            // Select first menu if any
            if (res.data && res.data.length > 0 && !selectedMenu) {
                handleSelectMenu(res.data[0]);
            }
        } catch (error) {
            console.error('Failed to load menus');
        }
    };

    const fetchPages = async () => {
        try {
            const res = await apiClient.get('/cms/pages');
            setPages(res.data.data || []);
        } catch (error) {
            console.error('Failed to load pages');
        }
    };

    const handleSelectMenu = (menu) => {
        setSelectedMenu(menu);
        setMenuItems(menu.items || []);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setMenuItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleAddItem = (type = 'custom', data = {}) => {
        const newItem = {
            id: `item-${Date.now()}`,
            label: data.label || 'New Link',
            url: data.url || '#',
            type
        };
        setMenuItems([...menuItems, newItem]);
    };

    const handleUpdateItem = (id, field, value) => {
        setMenuItems(items => items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleDeleteItem = (id) => {
        setMenuItems(items => items.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        if (!selectedMenu) return;
        setLoading(true);
        try {
            await apiClient.post('/cms/menus', {
                id: selectedMenu.id,
                name: selectedMenu.name,
                slug: selectedMenu.slug,
                items: menuItems
            });
            toast.success('Menu saved successfully');
            fetchMenus();
        } catch (error) {
            toast.error('Failed to save menu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMenu = async () => {
        const name = prompt('Enter menu name (e.g. Main Footer)');
        if (!name) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        try {
            await apiClient.post('/cms/menus', { name, slug, items: [] });
            toast.success('Menu created');
            fetchMenus();
        } catch (error) {
            toast.error('Failed to create menu');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar: Pages & Controls */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Menu</label>
                        <button onClick={handleCreateMenu} className="text-xs text-indigo-600 hover:underline">+ New Menu</button>
                    </div>
                    <select
                        className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none"
                        value={selectedMenu?.id || ''}
                        onChange={(e) => {
                            const menu = menus.find(m => m.id === parseInt(e.target.value));
                            handleSelectMenu(menu);
                        }}
                    >
                        <option value="">Select a menu...</option>
                        {menus.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.slug})</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Add Pages</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {pages.map(page => (
                            <div key={page.id} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors group">
                                <span className="text-sm text-slate-600 dark:text-slate-400">{page.title}</span>
                                <button
                                    onClick={() => handleAddItem('page', { label: page.title, url: `/${page.slug}` })}
                                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-600 my-4 pt-4">
                        <button
                            onClick={() => handleAddItem('custom')}
                            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors text-sm font-medium"
                        >
                            <FiPlus /> Add Custom Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Menu Structure */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[500px] flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Menu Structure</h2>
                            <p className="text-sm text-slate-500">Drag items to reorder</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={!selectedMenu || loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <FiSave /> {loading ? 'Saving...' : 'Save Menu'}
                        </button>
                    </div>

                    <div className="p-4 flex-1 bg-slate-50 dark:bg-slate-900/50">
                        {!selectedMenu ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <p>Select or create a menu to start editing</p>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={menuItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {menuItems.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                            Menu is empty. Add items from the left.
                                        </div>
                                    ) : (
                                        menuItems.map((item) => (
                                            <SortableItem
                                                key={item.id}
                                                id={item.id}
                                                item={item}
                                                onDelete={handleDeleteItem}
                                                onUpdate={handleUpdateItem}
                                            />
                                        ))
                                    )}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuEditor;
