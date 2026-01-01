import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSave, FiRefreshCw, FiImage, FiDroplet, FiType, FiExternalLink, FiGlobe, FiDollarSign, FiTruck, FiMapPin } from 'react-icons/fi';

const ThemeEditor = () => {
    const [settings, setSettings] = useState({
        logo: '',
        primary_color: '#3b82f6',
        secondary_color: '#10b981',
        font_family: 'Inter',
        hero_image: '',
        hero_title: '',
        hero_subtitle: '',
        company_name: '',
        currency_symbol: '₹',
        footer_text: '',
        support_email: '',
        support_phone: '',
        // E-commerce settings
        tax_rate: '10',
        shipping_mode: 'simple', // 'simple' or 'zone_based'
        shipping_fee: '5.99',
        free_shipping_threshold: '50'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/cms/layout/theme_config');
            if (res.data.data && res.data.data.sections) {
                const data = typeof res.data.data.sections === 'string'
                    ? JSON.parse(res.data.data.sections)
                    : res.data.data.sections;
                setSettings(prev => ({ ...prev, ...data }));
            }
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
            await api.post('/cms/layout/theme_config', { sections: settings });
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Theme Editor</h1>
                    <p className="text-slate-500 dark:text-slate-400">Customize your storefront appearance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadSettings}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors"
                    >
                        <FiRefreshCw size={18} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        <FiSave size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Branding Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                        <FiImage className="text-indigo-500" />
                        Branding
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Store Name</label>
                            <input
                                type="text"
                                value={settings.company_name}
                                onChange={(e) => handleChange('company_name', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Your Store Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Logo URL</label>
                            <input
                                type="url"
                                value={settings.logo}
                                onChange={(e) => handleChange('logo', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="https://example.com/logo.png"
                            />
                            {settings.logo && (
                                <div className="mt-3 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
                                    <img src={settings.logo} alt="Logo preview" className="h-12 object-contain" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hero Image URL</label>
                            <input
                                type="url"
                                value={settings.hero_image}
                                onChange={(e) => handleChange('hero_image', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="https://example.com/hero.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hero Title</label>
                            <input
                                type="text"
                                value={settings.hero_title}
                                onChange={(e) => handleChange('hero_title', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Welcome to Our Store"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hero Subtitle</label>
                            <textarea
                                value={settings.hero_subtitle}
                                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                placeholder="Shop the latest products with amazing deals"
                            />
                        </div>
                    </div>
                </div>

                {/* Colors Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                        <FiDroplet className="text-indigo-500" />
                        Colors
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Quick Presets</label>
                            <div className="flex flex-wrap gap-2">
                                {colorPresets.map(preset => (
                                    <button
                                        key={preset.name}
                                        onClick={() => {
                                            handleChange('primary_color', preset.primary);
                                            handleChange('secondary_color', preset.secondary);
                                        }}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-80 transition shadow-sm"
                                        style={{
                                            backgroundColor: preset.primary,
                                            color: 'white'
                                        }}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Primary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    className="w-14 h-11 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600"
                                />
                                <input
                                    type="text"
                                    value={settings.primary_color}
                                    onChange={(e) => handleChange('primary_color', e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Secondary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.secondary_color}
                                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                                    className="w-14 h-11 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600"
                                />
                                <input
                                    type="text"
                                    value={settings.secondary_color}
                                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography & Settings Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                        <FiType className="text-indigo-500" />
                        Typography & Settings
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Font Family</label>
                            <select
                                value={settings.font_family}
                                onChange={(e) => handleChange('font_family', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {fontOptions.map(font => (
                                    <option key={font} value={font}>{font}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <FiDollarSign className="inline mr-1" />
                                Currency Symbol
                            </label>
                            <input
                                type="text"
                                value={settings.currency_symbol}
                                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="₹"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <FiGlobe className="inline mr-1" />
                                Footer Text
                            </label>
                            <input
                                type="text"
                                value={settings.footer_text}
                                onChange={(e) => handleChange('footer_text', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="© 2024 Your Company. All rights reserved."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Support Email</label>
                                <input
                                    type="email"
                                    value={settings.support_email}
                                    onChange={(e) => handleChange('support_email', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="support@store.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Support Phone</label>
                                <input
                                    type="tel"
                                    value={settings.support_phone}
                                    onChange={(e) => handleChange('support_phone', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="+91 9876543210"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* E-commerce Settings Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                        <FiDollarSign className="text-green-500" />
                        E-commerce Settings
                    </h2>

                    {/* Shipping Mode Toggle */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            <FiTruck className="inline mr-2" />
                            Shipping Calculation Mode
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.shipping_mode === 'simple'
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="shipping_mode"
                                    value="simple"
                                    checked={settings.shipping_mode === 'simple'}
                                    onChange={(e) => handleChange('shipping_mode', e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-3">
                                    <FiDollarSign className={settings.shipping_mode === 'simple' ? 'text-indigo-500' : 'text-slate-400'} size={24} />
                                    <div>
                                        <div className="font-medium text-slate-800 dark:text-white">Simple (Flat Rate)</div>
                                        <div className="text-sm text-slate-500">Fixed shipping fee for all orders</div>
                                    </div>
                                </div>
                            </label>

                            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.shipping_mode === 'zone_based'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="shipping_mode"
                                    value="zone_based"
                                    checked={settings.shipping_mode === 'zone_based'}
                                    onChange={(e) => handleChange('shipping_mode', e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex items-center gap-3">
                                    <FiMapPin className={settings.shipping_mode === 'zone_based' ? 'text-green-500' : 'text-slate-400'} size={24} />
                                    <div>
                                        <div className="font-medium text-slate-800 dark:text-white">Zone-Based</div>
                                        <div className="text-sm text-slate-500">Charges vary by delivery location</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Simple mode settings */}
                    {settings.shipping_mode === 'simple' ? (
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Tax Rate (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={settings.tax_rate}
                                    onChange={(e) => handleChange('tax_rate', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="10"
                                />
                                <p className="text-xs text-slate-500 mt-1">Applied to all orders</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Shipping Fee ({settings.currency_symbol})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={settings.shipping_fee}
                                    onChange={(e) => handleChange('shipping_fee', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="5.99"
                                />
                                <p className="text-xs text-slate-500 mt-1">Standard shipping cost</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Free Shipping Above ({settings.currency_symbol})
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={settings.free_shipping_threshold}
                                    onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="50"
                                />
                                <p className="text-xs text-slate-500 mt-1">Free shipping threshold</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                                    <FiMapPin className="text-white" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Zone-Based Shipping Active</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        Shipping charges are calculated based on delivery zones. Configure your zones, rates, and delivery areas in the Shipping Management page.
                                    </p>
                                    <Link
                                        to="/shipping"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                        <FiTruck size={16} />
                                        Manage Shipping Zones
                                    </Link>
                                </div>
                            </div>

                            {/* Tax rate still applies */}
                            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Tax Rate (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={settings.tax_rate}
                                    onChange={(e) => handleChange('tax_rate', e.target.value)}
                                    className="w-32 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="10"
                                />
                                <p className="text-xs text-slate-500 mt-1">Tax is still applied to all orders</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
                        <FiExternalLink className="text-indigo-500" />
                        Live Preview
                    </h2>

                    <div
                        className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600"
                        style={{ fontFamily: settings.font_family }}
                    >
                        {/* Mini header preview */}
                        <div
                            className="p-4 text-white flex items-center gap-3"
                            style={{ backgroundColor: settings.primary_color }}
                        >
                            {settings.logo && (
                                <img src={settings.logo} alt="Logo" className="h-8 w-auto" />
                            )}
                            <span className="font-bold">{settings.company_name || 'Store Name'}</span>
                        </div>

                        {/* Mini hero preview */}
                        <div
                            className="p-8 text-center"
                            style={{
                                background: settings.hero_image
                                    ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${settings.hero_image}) center/cover`
                                    : `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})`,
                                color: 'white'
                            }}
                        >
                            <h3 className="text-xl font-bold mb-2">{settings.hero_title || 'Hero Title'}</h3>
                            <p className="text-sm opacity-90">{settings.hero_subtitle || 'Hero subtitle text goes here'}</p>
                        </div>

                        {/* Mini button preview */}
                        <div className="p-5 flex gap-3 justify-center bg-slate-50 dark:bg-slate-900">
                            <button
                                className="px-5 py-2 rounded-lg text-white text-sm font-medium shadow-sm"
                                style={{ backgroundColor: settings.primary_color }}
                            >
                                Primary Button
                            </button>
                            <button
                                className="px-5 py-2 rounded-lg text-white text-sm font-medium shadow-sm"
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
