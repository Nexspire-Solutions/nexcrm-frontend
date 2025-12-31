import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSave, FiRefreshCw, FiImage, FiDroplet, FiType, FiExternalLink } from 'react-icons/fi';

const ThemeEditor = () => {
    const [settings, setSettings] = useState({
        logo: '',
        primary_color: '#3b82f6',
        secondary_color: '#10b981',
        font_family: 'Inter',
        hero_image: '',
        hero_title: '',
        hero_subtitle: '',
        company_name: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/config/storefront');
            setSettings(prev => ({ ...prev, ...res.data }));
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/config/storefront', settings);
            toast.success('Theme settings saved!');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const fontOptions = [
        'Inter',
        'Roboto',
        'Open Sans',
        'Poppins',
        'Montserrat',
        'Lato',
        'Outfit',
        'DM Sans'
    ];

    const colorPresets = [
        { name: 'Blue', primary: '#3b82f6', secondary: '#10b981' },
        { name: 'Purple', primary: '#8b5cf6', secondary: '#f59e0b' },
        { name: 'Red', primary: '#ef4444', secondary: '#3b82f6' },
        { name: 'Green', primary: '#10b981', secondary: '#6366f1' },
        { name: 'Orange', primary: '#f97316', secondary: '#06b6d4' },
        { name: 'Pink', primary: '#ec4899', secondary: '#8b5cf6' },
        { name: 'Black', primary: '#1f2937', secondary: '#6b7280' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Theme Editor</h1>
                    <p className="text-gray-600">Customize your storefront appearance</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadSettings}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiRefreshCw size={18} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <FiSave size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Branding */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FiImage className="text-blue-500" />
                        Branding
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                            <input
                                type="text"
                                value={settings.company_name}
                                onChange={(e) => handleChange('company_name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Your Store Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                            <input
                                type="url"
                                value={settings.logo}
                                onChange={(e) => handleChange('logo', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/logo.png"
                            />
                            {settings.logo && (
                                <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                                    <img src={settings.logo} alt="Logo preview" className="h-12 object-contain" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                            <input
                                type="url"
                                value={settings.hero_image}
                                onChange={(e) => handleChange('hero_image', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/hero.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                            <input
                                type="text"
                                value={settings.hero_title}
                                onChange={(e) => handleChange('hero_title', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Welcome to Our Store"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                            <textarea
                                value={settings.hero_subtitle}
                                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Shop the latest products with amazing deals"
                            />
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FiDroplet className="text-blue-500" />
                        Colors
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                            <div className="flex flex-wrap gap-2">
                                {colorPresets.map(preset => (
                                    <button
                                        key={preset.name}
                                        onClick={() => {
                                            handleChange('primary_color', preset.primary);
                                            handleChange('secondary_color', preset.secondary);
                                        }}
                                        className="px-3 py-1 rounded-full text-xs font-medium border hover:opacity-80 transition"
                                        style={{
                                            backgroundColor: preset.primary,
                                            color: 'white',
                                            borderColor: preset.primary
                                        }}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    className="w-12 h-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={settings.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.secondary_color}
                                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                                    className="w-12 h-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={settings.secondary_color}
                                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FiType className="text-blue-500" />
                        Typography
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                        <select
                            value={settings.font_family}
                            onChange={(e) => handleChange('font_family', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {fontOptions.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FiExternalLink className="text-blue-500" />
                        Preview
                    </h2>

                    <div
                        className="rounded-lg overflow-hidden border"
                        style={{ fontFamily: settings.font_family }}
                    >
                        {/* Mini header preview */}
                        <div
                            className="p-4 text-white"
                            style={{ backgroundColor: settings.primary_color }}
                        >
                            <div className="font-bold">{settings.company_name || 'Store Name'}</div>
                        </div>

                        {/* Mini hero preview */}
                        <div
                            className="p-6 text-center"
                            style={{
                                background: settings.hero_image
                                    ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${settings.hero_image}) center/cover`
                                    : `linear-gradient(to right, ${settings.primary_color}, ${settings.secondary_color})`,
                                color: 'white'
                            }}
                        >
                            <h3 className="text-lg font-bold">{settings.hero_title || 'Hero Title'}</h3>
                            <p className="text-sm opacity-80">{settings.hero_subtitle || 'Hero subtitle text'}</p>
                        </div>

                        {/* Mini button preview */}
                        <div className="p-4 flex gap-2 justify-center">
                            <button
                                className="px-4 py-2 rounded text-white text-sm"
                                style={{ backgroundColor: settings.primary_color }}
                            >
                                Primary Button
                            </button>
                            <button
                                className="px-4 py-2 rounded text-white text-sm"
                                style={{ backgroundColor: settings.secondary_color }}
                            >
                                Secondary
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeEditor;
