import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiLayout } from 'react-icons/fi';

const ThemeEditor = () => {
    const [config, setConfig] = useState({
        colors: {
            primary: '#4F46E5',
            secondary: '#10B981',
            background: '#FFFFFF',
            text: '#1F2937'
        },
        typography: {
            fontFamily: 'Inter',
            headingFont: 'Inter'
        },
        borderRadius: '0.5rem'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch current theme
    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/cms/theme'); // Adjust port as needed
                if (response.ok) {
                    const data = await response.json();
                    setConfig(data);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTheme();
    }, []);

    const handleChange = (section, key, value) => {
        setConfig(prev => ({
            ...prev,
            [section]: typeof prev[section] === 'object'
                ? { ...prev[section], [key]: value }
                : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('http://localhost:5000/api/cms/theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                alert('Theme updated successfully!');
            } else {
                alert('Failed to update theme.');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Error saving theme');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading editor...</div>;

    return (
        <div className="flex h-full bg-slate-100 overflow-hidden">
            {/* Sidebar Controls */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto shrink-0">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FiLayout /> Theme Editor
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Customize your brand identity</p>
                </div>

                <div className="p-6 space-y-8">
                    {/* Colors */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Brand Colors</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-600 mb-1">Primary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={config.colors.primary}
                                        onChange={(e) => handleChange('colors', 'primary', e.target.value)}
                                        className="h-10 w-10 p-1 rounded border border-slate-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={config.colors.primary}
                                        onChange={(e) => handleChange('colors', 'primary', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-600 mb-1">Secondary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={config.colors.secondary}
                                        onChange={(e) => handleChange('colors', 'secondary', e.target.value)}
                                        className="h-10 w-10 p-1 rounded border border-slate-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={config.colors.secondary}
                                        onChange={(e) => handleChange('colors', 'secondary', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm uppercase"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-600 mb-1">Background Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={config.colors.background}
                                        onChange={(e) => handleChange('colors', 'background', e.target.value)}
                                        className="h-10 w-10 p-1 rounded border border-slate-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={config.colors.background}
                                        onChange={(e) => handleChange('colors', 'background', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Typography */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Typography</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-600 mb-1">Font Family</label>
                                <select
                                    value={config.typography.fontFamily}
                                    onChange={(e) => handleChange('typography', 'fontFamily', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                                >
                                    <option value="Inter">Inter</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Lato">Lato</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Shape */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Shape & Form</h3>
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">Border Radius</label>
                            <select
                                value={config.borderRadius}
                                onChange={(e) => setConfig({ ...config, borderRadius: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                            >
                                <option value="0px">Square (0px)</option>
                                <option value="0.25rem">Small (4px)</option>
                                <option value="0.5rem">Medium (8px)</option>
                                <option value="1rem">Large (16px)</option>
                                <option value="9999px">Round (Pill)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-auto p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Live Preview Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="h-16 bg-white border-b border-slate-200 flex items-center px-8">
                    <span className="font-semibold text-slate-500">Live Preview</span>
                </div>

                <div className="flex-1 p-8 overflow-y-auto bg-slate-100 flex justify-center items-start">
                    <div
                        className="w-full max-w-4xl bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300"
                        style={{ fontFamily: config.typography.fontFamily }}
                    >
                        {/* Mock Navbar */}
                        <div className="h-16 px-8 flex items-center justify-between border-b" style={{ borderColor: '#e2e8f0' }}>
                            <div className="font-bold text-xl" style={{ color: config.colors.primary }}>BrandLogo</div>
                            <div className="flex gap-6 text-sm font-medium">
                                <span className="opacity-75">Home</span>
                                <span className="opacity-75">Features</span>
                                <span className="opacity-75">Pricing</span>
                            </div>
                            <button
                                style={{
                                    backgroundColor: config.colors.primary,
                                    borderRadius: config.borderRadius
                                }}
                                className="px-5 py-2 text-white font-medium text-sm hover:opacity-90 transition-opacity"
                            >
                                Get Started
                            </button>
                        </div>

                        {/* Mock Hero */}
                        <div
                            className="py-20 px-8 text-center"
                            style={{ backgroundColor: config.colors.background, color: config.colors.text }}
                        >
                            <span
                                className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-6"
                                style={{
                                    backgroundColor: `${config.colors.secondary}20`,
                                    color: config.colors.secondary,
                                    borderRadius: config.borderRadius
                                }}
                            >
                                New Feature Released
                            </span>
                            <h1 className="text-5xl font-bold mb-6">
                                Design with <span style={{ color: config.colors.primary }}>Confidence</span>
                            </h1>
                            <p className="text-lg opacity-70 max-w-2xl mx-auto mb-10">
                                This preview shows exactly how your typography, colors, and shapes will appear on your live storefront.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    style={{
                                        backgroundColor: config.colors.primary,
                                        borderRadius: config.borderRadius
                                    }}
                                    className="px-8 py-3 text-white font-bold hover:opacity-90 transition-opacity"
                                >
                                    Primary Action
                                </button>
                                <button
                                    style={{
                                        color: config.colors.text,
                                        borderColor: '#e2e8f0',
                                        borderWidth: '1px',
                                        borderRadius: config.borderRadius
                                    }}
                                    className="px-8 py-3 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Secondary Action
                                </button>
                            </div>
                        </div>

                        {/* Mock Features */}
                        <div className="py-16 px-8 bg-slate-50 grid grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-6 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                        style={{ backgroundColor: `${config.colors.primary}15`, color: config.colors.primary }}
                                    >
                                        ★
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Feature {i}</h3>
                                    <p className="text-sm opacity-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeEditor;
