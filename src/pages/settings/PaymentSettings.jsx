import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    FiCreditCard, FiSave, FiCheckCircle, FiXCircle, FiEye, FiEyeOff,
    FiExternalLink, FiAlertTriangle, FiDollarSign, FiTruck
} from 'react-icons/fi';

const PaymentSettings = () => {
    const [settings, setSettings] = useState({
        stripe_enabled: false,
        stripe_public_key: '',
        stripe_secret_key: '',
        stripe_webhook_secret: '',
        cod_enabled: true,
        payment_mode: 'test'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);
    const [stripeSecretConfigured, setStripeSecretConfigured] = useState(false);
    const [webhookConfigured, setWebhookConfigured] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/config/payment');
            if (res.data.success) {
                const data = res.data.data;
                setSettings(prev => ({
                    ...prev,
                    stripe_enabled: data.stripe_enabled || false,
                    stripe_public_key: data.stripe_public_key || '',
                    cod_enabled: data.cod_enabled !== false,
                    payment_mode: data.payment_mode || 'test'
                }));
                setStripeSecretConfigured(data.stripe_secret_configured || false);
                setWebhookConfigured(data.stripe_webhook_configured || false);
            }
        } catch (error) {
            console.error('Failed to load payment settings:', error);
            toast.error('Failed to load payment settings');
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
            // Only send non-empty values for secrets
            const payload = { ...settings };
            if (!payload.stripe_secret_key) {
                delete payload.stripe_secret_key;
            }
            if (!payload.stripe_webhook_secret) {
                delete payload.stripe_webhook_secret;
            }

            await api.put('/config/payment', payload);
            toast.success('Payment settings saved successfully!');

            // Reload to get updated state
            loadSettings();

            // Clear secret fields after save
            setSettings(prev => ({
                ...prev,
                stripe_secret_key: '',
                stripe_webhook_secret: ''
            }));
        } catch (error) {
            toast.error('Failed to save payment settings');
        } finally {
            setSaving(false);
        }
    };

    const testConnection = async () => {
        if (!settings.stripe_secret_key && !stripeSecretConfigured) {
            toast.error('Please enter a Stripe Secret Key first');
            return;
        }

        setTesting(true);
        try {
            const res = await api.post('/config/payment/test', {
                secret_key: settings.stripe_secret_key || undefined
            });

            if (res.data.success) {
                toast.success(`Connected! Account: ${res.data.account.id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.details || 'Connection failed');
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Payment Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Configure payment methods for your storefront</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/25"
                >
                    <FiSave size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-6">
                {/* Stripe Configuration */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <FiCreditCard size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Stripe</h2>
                                <p className="text-sm text-slate-500">Accept credit/debit cards online</p>
                            </div>
                        </div>

                        {/* Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.stripe_enabled}
                                onChange={(e) => handleChange('stripe_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {settings.stripe_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    </div>

                    {settings.stripe_enabled && (
                        <div className="space-y-5 border-t border-slate-200 dark:border-slate-700 pt-5">
                            {/* Mode Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Mode
                                </label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.payment_mode === 'test'
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                            : 'border-slate-200 dark:border-slate-600'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment_mode"
                                            value="test"
                                            checked={settings.payment_mode === 'test'}
                                            onChange={(e) => handleChange('payment_mode', e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-3">
                                            <FiAlertTriangle className={settings.payment_mode === 'test' ? 'text-amber-500' : 'text-slate-400'} size={20} />
                                            <div>
                                                <div className="font-medium text-slate-800 dark:text-white">Test Mode</div>
                                                <div className="text-sm text-slate-500">Use test API keys for development</div>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.payment_mode === 'live'
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : 'border-slate-200 dark:border-slate-600'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="payment_mode"
                                            value="live"
                                            checked={settings.payment_mode === 'live'}
                                            onChange={(e) => handleChange('payment_mode', e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-3">
                                            <FiCheckCircle className={settings.payment_mode === 'live' ? 'text-green-500' : 'text-slate-400'} size={20} />
                                            <div>
                                                <div className="font-medium text-slate-800 dark:text-white">Live Mode</div>
                                                <div className="text-sm text-slate-500">Accept real payments</div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Public Key */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Publishable Key
                                </label>
                                <input
                                    type="text"
                                    value={settings.stripe_public_key}
                                    onChange={(e) => handleChange('stripe_public_key', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                                    placeholder={settings.payment_mode === 'live' ? 'pk_live_...' : 'pk_test_...'}
                                />
                            </div>

                            {/* Secret Key */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Secret Key
                                    {stripeSecretConfigured && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <FiCheckCircle size={14} /> Configured
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showSecretKey ? 'text' : 'password'}
                                        value={settings.stripe_secret_key}
                                        onChange={(e) => handleChange('stripe_secret_key', e.target.value)}
                                        className="w-full px-4 py-2.5 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                                        placeholder={stripeSecretConfigured ? '••••••••••••••••' : (settings.payment_mode === 'live' ? 'sk_live_...' : 'sk_test_...')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecretKey(!showSecretKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showSecretKey ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                    {stripeSecretConfigured
                                        ? 'Leave empty to keep existing key, or enter a new key to replace'
                                        : 'Never share your secret key publicly'}
                                </p>
                            </div>

                            {/* Webhook Secret */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Webhook Secret
                                    {webhookConfigured && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <FiCheckCircle size={14} /> Configured
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showWebhookSecret ? 'text' : 'password'}
                                        value={settings.stripe_webhook_secret}
                                        onChange={(e) => handleChange('stripe_webhook_secret', e.target.value)}
                                        className="w-full px-4 py-2.5 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                                        placeholder={webhookConfigured ? '••••••••••••••••' : 'whsec_...'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showWebhookSecret ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Required for payment confirmation webhooks
                                </p>
                            </div>

                            {/* Test Connection & Dashboard Link */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={testConnection}
                                    disabled={testing || (!settings.stripe_secret_key && !stripeSecretConfigured)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    {testing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheckCircle size={16} />
                                            Test Connection
                                        </>
                                    )}
                                </button>

                                <a
                                    href="https://dashboard.stripe.com/apikeys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                >
                                    <FiExternalLink size={16} />
                                    Open Stripe Dashboard
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cash on Delivery */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <FiDollarSign size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Cash on Delivery</h2>
                                <p className="text-sm text-slate-500">Accept payment when order is delivered</p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.cod_enabled}
                                onChange={(e) => handleChange('cod_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {settings.cod_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    </div>
                </div>

                {/* Payment Status Summary */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Payment Methods Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            {settings.stripe_enabled && stripeSecretConfigured ? (
                                <FiCheckCircle className="text-green-500" size={20} />
                            ) : (
                                <FiXCircle className="text-slate-400" size={20} />
                            )}
                            <span className="text-slate-700 dark:text-slate-300">
                                Card Payments (Stripe)
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {settings.cod_enabled ? (
                                <FiCheckCircle className="text-green-500" size={20} />
                            ) : (
                                <FiXCircle className="text-slate-400" size={20} />
                            )}
                            <span className="text-slate-700 dark:text-slate-300">
                                Cash on Delivery
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSettings;
