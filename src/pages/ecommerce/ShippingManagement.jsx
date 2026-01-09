import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/**
 * Shipping Management Page - Complete Implementation
 */
const ShippingManagement = () => {
    const [activeTab, setActiveTab] = useState('providers');
    const [providers, setProviders] = useState([]);
    const [rates, setRates] = useState([]);
    const [zones, setZones] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'providers') {
                const res = await apiClient.get('/shipping/providers');
                setProviders(res.data.data || []);
            } else if (activeTab === 'rates') {
                const [ratesRes, providersRes] = await Promise.all([
                    apiClient.get('/shipping/rates'),
                    apiClient.get('/shipping/providers')
                ]);
                setRates(ratesRes.data.data || []);
                setProviders(providersRes.data.data || []);
            } else if (activeTab === 'zones') {
                const res = await apiClient.get('/shipping/zones');
                setZones(res.data.data || []);
            } else if (activeTab === 'shipments') {
                const res = await apiClient.get('/shipping/shipments');
                setShipments(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const toggleProviderStatus = async (provider) => {
        try {
            await apiClient.patch(`/shipping/providers/${provider.id}`, {
                is_active: !provider.is_active
            });
            toast.success(`Provider ${provider.is_active ? 'disabled' : 'enabled'}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update provider');
        }
    };

    const toggleRateStatus = async (rate) => {
        try {
            await apiClient.patch(`/shipping/rates/${rate.id}`, {
                is_active: !rate.is_active
            });
            toast.success(`Rate ${rate.is_active ? 'disabled' : 'enabled'}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update rate');
        }
    };

    const deleteZone = async (zone) => {
        if (!confirm(`Delete zone "${zone.name}"?`)) return;
        try {
            await apiClient.delete(`/shipping/zones/${zone.id}`);
            toast.success('Zone deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete zone');
        }
    };

    const tabs = [
        { id: 'providers', label: 'Providers', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
        { id: 'rates', label: 'Rates', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'zones', label: 'Delivery Zones', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
        { id: 'shipments', label: 'Shipments', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' }
    ];

    const getStatusBadge = (isActive) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
            }`}>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );

    const getShipmentStatusBadge = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-800',
            picked_up: 'bg-blue-100 text-blue-800',
            in_transit: 'bg-indigo-100 text-indigo-800',
            out_for_delivery: 'bg-purple-100 text-purple-800',
            delivered: 'bg-emerald-100 text-emerald-800',
            failed: 'bg-red-100 text-red-800',
            rto: 'bg-orange-100 text-orange-800',
            cancelled: 'bg-slate-100 text-slate-800'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || 'bg-slate-100 text-slate-800'}`}>
                {status?.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Shipping & Logistics</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage shipping providers, rates, and shipments</p>
                </div>
                {activeTab === 'rates' && (
                    <button
                        onClick={() => { setEditingItem(null); setShowRateModal(true); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Rate
                    </button>
                )}
                {activeTab === 'zones' && (
                    <button
                        onClick={() => { setEditingItem(null); setShowZoneModal(true); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Zone
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm rounded-lg transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                        </svg>
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    {/* Providers Tab */}
                    {activeTab === 'providers' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {providers.map(provider => (
                                <div key={provider.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{provider.name}</h3>
                                                <code className="text-xs text-slate-500">{provider.code}</code>
                                            </div>
                                        </div>
                                        {getStatusBadge(provider.is_active)}
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => toggleProviderStatus(provider)}
                                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${provider.is_active
                                                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                }`}
                                        >
                                            {provider.is_active ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {providers.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                    <p className="text-slate-500 dark:text-slate-400">No shipping providers configured</p>
                                    <p className="text-sm text-slate-400 mt-1">Run database migrations to add default providers</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rates Tab */}
                    {activeTab === 'rates' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Rate Name</th>
                                        <th className="px-6 py-4">Provider</th>
                                        <th className="px-6 py-4">Base Rate</th>
                                        <th className="px-6 py-4">Per KG</th>
                                        <th className="px-6 py-4">Delivery Days</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {rates.map(rate => (
                                        <tr key={rate.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{rate.name}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{rate.provider_name || '-'}</td>
                                            <td className="px-6 py-4 font-semibold text-indigo-600">₹{rate.base_rate}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">₹{rate.per_kg_rate || 0}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{rate.delivery_days || '-'}</td>
                                            <td className="px-6 py-4">{getStatusBadge(rate.is_active)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => toggleRateStatus(rate)}
                                                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${rate.is_active
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                >
                                                    {rate.is_active ? 'Disable' : 'Enable'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {rates.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-slate-500 dark:text-slate-400">No shipping rates configured</p>
                                    <button
                                        onClick={() => { setEditingItem(null); setShowRateModal(true); }}
                                        className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Add your first rate
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Zones Tab */}
                    {activeTab === 'zones' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {zones.map(zone => (
                                <div key={zone.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{zone.name}</h3>
                                        {getStatusBadge(zone.is_serviceable)}
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 dark:text-slate-400">Delivery Charge:</span>
                                            <span className="font-semibold text-indigo-600">₹{zone.delivery_charge}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 dark:text-slate-400">Free Delivery Above:</span>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {zone.free_delivery_above ? `₹${zone.free_delivery_above}` : '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500 dark:text-slate-400">COD Available:</span>
                                            <span className={`font-medium ${zone.cod_available ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {zone.cod_available ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        {zone.estimated_days && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-slate-400">Est. Delivery:</span>
                                                <span className="font-medium text-slate-900 dark:text-white">{zone.estimated_days}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            onClick={() => { setEditingItem(zone); setShowZoneModal(true); }}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-2 py-1"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteZone(zone)}
                                            className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {zones.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-slate-500 dark:text-slate-400">No delivery zones configured</p>
                                    <button
                                        onClick={() => { setEditingItem(null); setShowZoneModal(true); }}
                                        className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Add your first zone
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Shipments Tab */}
                    {activeTab === 'shipments' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Order</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Provider</th>
                                        <th className="px-6 py-4">Tracking</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {shipments.map(shipment => (
                                        <tr key={shipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4">
                                                <code className="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded text-xs font-medium">
                                                    {shipment.order_number}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-slate-900 dark:text-white">{shipment.shipping_name}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{shipment.provider_name || 'Manual'}</td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                    {shipment.tracking_number || shipment.awb_number || '-'}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">{getShipmentStatusBadge(shipment.status)}</td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {new Date(shipment.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {shipments.length === 0 && (
                                <div className="text-center py-12">
                                    <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-slate-500 dark:text-slate-400">No shipments yet</p>
                                    <p className="text-sm text-slate-400 mt-1">Shipments will appear here when orders are shipped</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Rate Modal */}
            {showRateModal && (
                <RateModal
                    rate={editingItem}
                    providers={providers}
                    onClose={() => { setShowRateModal(false); setEditingItem(null); }}
                    onSave={() => { setShowRateModal(false); setEditingItem(null); fetchData(); }}
                />
            )}

            {/* Add/Edit Zone Modal */}
            {showZoneModal && (
                <ZoneModal
                    zone={editingItem}
                    onClose={() => { setShowZoneModal(false); setEditingItem(null); }}
                    onSave={() => { setShowZoneModal(false); setEditingItem(null); fetchData(); }}
                />
            )}
        </div>
    );
};

/**
 * Rate Modal Component
 */
const RateModal = ({ rate, providers, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        provider_id: rate?.provider_id || '',
        name: rate?.name || '',
        base_rate: rate?.base_rate || '',
        per_kg_rate: rate?.per_kg_rate || '',
        min_weight: rate?.min_weight || '',
        max_weight: rate?.max_weight || '',
        delivery_days: rate?.delivery_days || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (rate) {
                await apiClient.patch(`/shipping/rates/${rate.id}`, formData);
                toast.success('Rate updated');
            } else {
                await apiClient.post('/shipping/rates', formData);
                toast.success('Rate created');
            }
            onSave();
        } catch (error) {
            toast.error('Failed to save rate');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={rate ? 'Edit Rate' : 'Add Rate'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Provider</label>
                    <select
                        value={formData.provider_id}
                        onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                        <option value="">Select Provider</option>
                        {providers.filter(p => p.is_active).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rate Name *</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Standard Delivery"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base Rate (₹) *</label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.base_rate}
                            onChange={(e) => setFormData({ ...formData, base_rate: e.target.value })}
                            placeholder="50.00"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Per KG Rate (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.per_kg_rate}
                            onChange={(e) => setFormData({ ...formData, per_kg_rate: e.target.value })}
                            placeholder="20.00"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery Days</label>
                    <input
                        type="text"
                        value={formData.delivery_days}
                        onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                        placeholder="e.g., 3-5"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : (rate ? 'Update' : 'Create')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/**
 * Zone Modal Component
 */
const ZoneModal = ({ zone, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: zone?.name || '',
        delivery_charge: zone?.delivery_charge || '',
        free_delivery_above: zone?.free_delivery_above || '',
        cod_available: zone?.cod_available ?? true,
        is_serviceable: zone?.is_serviceable ?? true,
        estimated_days: zone?.estimated_days || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (zone) {
                await apiClient.patch(`/shipping/zones/${zone.id}`, formData);
                toast.success('Zone updated');
            } else {
                await apiClient.post('/shipping/zones', formData);
                toast.success('Zone created');
            }
            onSave();
        } catch (error) {
            toast.error('Failed to save zone');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={zone ? 'Edit Zone' : 'Add Zone'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Zone Name *</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Metro Cities"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery Charge (₹) *</label>
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={formData.delivery_charge}
                            onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                            placeholder="50.00"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Free Delivery Above (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.free_delivery_above}
                            onChange={(e) => setFormData({ ...formData, free_delivery_above: e.target.value })}
                            placeholder="1000.00"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Delivery</label>
                    <input
                        type="text"
                        value={formData.estimated_days}
                        onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
                        placeholder="e.g., 2-3 days"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.cod_available}
                            onChange={(e) => setFormData({ ...formData, cod_available: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">COD Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_serviceable}
                            onChange={(e) => setFormData({ ...formData, is_serviceable: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Serviceable</span>
                    </label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : (zone ? 'Update' : 'Create')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ShippingManagement;
