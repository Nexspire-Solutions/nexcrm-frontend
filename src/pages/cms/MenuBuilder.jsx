import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful'; // Ensure this dep exists, if not I might need to simplify or use input type='color'
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave, FiMonitor, FiMenu } from 'react-icons/fi';

export default function MenuBuilder({ mode = 'header' }) {
    // Mode can be 'header' or 'footer'
    const [config, setConfig] = useState({
        logo: '',
        primaryColor: '#4f46e5',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        layout: 'default' // default, center, simple
    });

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewMode, setPreviewMode] = useState('desktop');

    useEffect(() => {
        fetchData();
    }, [mode]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Global Config (Simulated by layout/header_config for now)
            const configRes = await apiClient.get(`/cms/layout/${mode}_config`);
            if (configRes.data.data && configRes.data.data.sections) {
                // Determine if sections is string or object
                const data = typeof configRes.data.data.sections === 'string'
                    ? JSON.parse(configRes.data.data.sections)
                    : configRes.data.data.sections;
                setConfig(prev => ({ ...prev, ...data }));
            }

            // Fetch Menus
            const menuRes = await apiClient.get('/cms/menus');
            if (menuRes.data.data) {
                const myMenu = menuRes.data.data.find(m => m.position === mode);
                if (myMenu && myMenu.items) {
                    // Determine if items is string or object
                    const items = typeof myMenu.items === 'string' ? JSON.parse(myMenu.items) : myMenu.items;
                    setMenuItems(items);
                } else {
                    setMenuItems([]);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Save Config
            await apiClient.post(`/cms/layout/${mode}_config`, { sections: config });

            // Save Menu Items
            await apiClient.post('/cms/menus', { position: mode, items: menuItems });

            toast.success('Changes published successfully');
        } catch (error) {
            toast.error('Failed to save changes');
        }
    };

    const addMenuItem = () => {
        setMenuItems([...menuItems, { label: 'New Link', path: '/', icon: '', type: 'link' }]);
    };

    const updateMenuItem = (index, field, value) => {
        const newItems = [...menuItems];
        newItems[index][field] = value;
        setMenuItems(newItems);
    };

    const deleteMenuItem = (index) => {
        setMenuItems(menuItems.filter((_, i) => i !== index));
    };

    if (loading) return <div className="p-8 text-center">Loading editor...</div>;

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
                <div>
                    <h2 className="text-xl font-bold capitalize">{mode} Editor</h2>
                    <p className="text-sm text-slate-500">Customize appearance and navigation</p>
                </div>
                <div className="flex gap-3">
                    <div className="hidden md:flex bg-slate-100 rounded-lg p-1">
                        <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-white shadow' : ''}`}><FiMonitor /></button>
                    </div>
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                        <FiSave /> Publish
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
                {/* Editor Pane */}
                <div className="w-full lg:w-96 flex-shrink-0 space-y-6 overflow-y-auto pr-2 pb-20">

                    {/* Style Config */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold mb-4">Appearance</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Logo URL</label>
                                <input
                                    type="text"
                                    value={config.logo}
                                    onChange={e => setConfig({ ...config, logo: e.target.value })}
                                    className="input w-full"
                                    placeholder="/uploads/logo.png"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Background</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={config.backgroundColor}
                                        onChange={e => setConfig({ ...config, backgroundColor: e.target.value })}
                                        className="h-10 w-20 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={config.backgroundColor}
                                        onChange={e => setConfig({ ...config, backgroundColor: e.target.value })}
                                        className="input flex-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Text Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={config.textColor}
                                        onChange={e => setConfig({ ...config, textColor: e.target.value })}
                                        className="h-10 w-20 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={config.textColor}
                                        onChange={e => setConfig({ ...config, textColor: e.target.value })}
                                        className="input flex-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Display Mode</label>
                                <select
                                    value={config.displayMode || 'text'}
                                    onChange={e => setConfig({ ...config, displayMode: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="text">Text Only (Brand Name)</option>
                                    <option value="logo">Logo Image</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Menu Links</h3>
                            <button onClick={addMenuItem} className="text-indigo-600 hover:text-indigo-700"><FiPlus /></button>
                        </div>

                        <div className="space-y-3">
                            {menuItems.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 group">
                                    <div className="grid grid-cols-12 gap-2 mb-2">
                                        <div className="col-span-4">
                                            <input
                                                type="text"
                                                value={item.label}
                                                onChange={e => updateMenuItem(idx, 'label', e.target.value)}
                                                className="input text-sm px-2 py-1 w-full"
                                                placeholder="Label"
                                            />
                                        </div>
                                        <div className="col-span-5">
                                            <input
                                                type="text"
                                                value={item.path}
                                                onChange={e => updateMenuItem(idx, 'path', e.target.value)}
                                                className="input text-sm px-2 py-1 w-full"
                                                placeholder="/path"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <select
                                                value={item.icon || 'none'}
                                                onChange={e => updateMenuItem(idx, 'icon', e.target.value)}
                                                className="input text-sm px-1 py-1 w-full"
                                            >
                                                <option value="">No Icon</option>
                                                <option value="home">Home</option>
                                                <option value="shop">Shop</option>
                                                <option value="user">User</option>
                                                <option value="heart">Heart</option>
                                                <option value="phone">Phone</option>
                                                <option value="mail">Mail</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400">Drag to reorder (Coming soon)</span>
                                        <button onClick={() => deleteMenuItem(idx)} className="text-red-400 hover:text-red-500"><FiTrash2 /></button>
                                    </div>
                                </div>
                            ))}
                            {menuItems.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No items yet</p>}
                        </div>
                    </div>

                </div>

                {/* Preview Pane */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 flex flex-col relative">
                    <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 text-xs font-mono text-center border-b border-slate-300 dark:border-slate-600 text-slate-500">
                        Live Preview ({previewMode})
                    </div>

                    <div className="flex-1 overflow-auto bg-white relative">
                        {/* Simulation of Header */}
                        <div
                            className="w-full transition-all mx-auto shadow-sm"
                            style={{
                                backgroundColor: config.backgroundColor,
                                color: config.textColor,
                                padding: '1rem 2rem',
                                maxWidth: previewMode === 'desktop' ? '100%' : '375px',
                                borderRight: previewMode !== 'desktop' ? '1px solid #eee' : 'none',
                                borderLeft: previewMode !== 'desktop' ? '1px solid #eee' : 'none',
                                minHeight: mode === 'header' ? '80px' : '200px'
                            }}
                        >
                            <div className="flex items-center justify-between">
                                {/* Logo */}
                                <div className="font-bold text-xl">
                                    {config.logo ? <img src={config.logo} alt="Logo" className="h-8" /> : <span>Your Brand</span>}
                                </div>

                                {/* Nav */}
                                <nav className="hidden md:flex gap-6">
                                    {menuItems.map((item, i) => (
                                        <span key={i} className="cursor-pointer hover:opacity-70 font-medium">{item.label}</span>
                                    ))}
                                </nav>

                                {/* Mobile Menu Icon */}
                                <div className="md:hidden">
                                    <FiMenu size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Dummy Content */}
                        <div
                            className="bg-slate-50 p-8 mx-auto"
                            style={{ maxWidth: previewMode === 'desktop' ? '100%' : '375px' }}
                        >
                            <div className="h-64 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 mb-8">
                                Hero Banner Placeholder
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 bg-slate-200 w-3/4 rounded"></div>
                                <div className="h-4 bg-slate-200 w-1/2 rounded"></div>
                                <div className="h-4 bg-slate-200 w-5/6 rounded"></div>
                            </div>
                        </div>

                        {/* Simulation of Footer if mode is footer */}
                        {mode === 'footer' && (
                            <div
                                className="w-full transition-all mx-auto mt-auto"
                                style={{
                                    backgroundColor: config.backgroundColor,
                                    color: config.textColor,
                                    padding: '2rem',
                                    maxWidth: previewMode === 'desktop' ? '100%' : '375px'
                                }}
                            >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div>
                                        <h4 className="font-bold mb-4">Company</h4>
                                        <div className="space-y-2 flex flex-col opacity-80">
                                            {menuItems.slice(0, 3).map((item, i) => <span key={i}>{item.label}</span>)}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-4">Links</h4>
                                        <div className="space-y-2 flex flex-col opacity-80">
                                            {menuItems.slice(3).map((item, i) => <span key={i}>{item.label}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
