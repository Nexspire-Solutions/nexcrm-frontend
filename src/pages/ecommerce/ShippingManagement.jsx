import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/**
 * Shipping Management Page
 */
const ShippingManagement = () => {
    const [activeTab, setActiveTab] = useState('providers');
    const [providers, setProviders] = useState([]);
    const [rates, setRates] = useState([]);
    const [zones, setZones] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);

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
                const res = await apiClient.get('/shipping/rates');
                setRates(res.data.data || []);
            } else if (activeTab === 'zones') {
                const res = await apiClient.get('/shipping/zones');
                setZones(res.data.data || []);
            } else if (activeTab === 'shipments') {
                const res = await apiClient.get('/shipping/shipments');
                setShipments(res.data.data || []);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'providers', label: 'Providers' },
        { id: 'rates', label: 'Rates' },
        { id: 'zones', label: 'Delivery Zones' },
        { id: 'shipments', label: 'Shipments' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Shipping & Logistics</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage shipping providers, rates, and shipments</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
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
                                <div key={provider.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
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
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${provider.is_active
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                                            }`}>
                                            {provider.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {providers.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No shipping providers configured
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {rates.map(rate => (
                                        <tr key={rate.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{rate.name}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{rate.provider_name || '-'}</td>
                                            <td className="px-6 py-4 font-semibold text-indigo-600">₹{rate.base_rate}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">₹{rate.per_kg_rate || 0}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{rate.delivery_days || '-'} days</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${rate.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {rate.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {rates.length === 0 && (
                                <div className="text-center py-12 text-slate-500">No shipping rates configured</div>
                            )}
                        </div>
                    )}

                    {/* Zones Tab */}
                    {activeTab === 'zones' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {zones.map(zone => (
                                <div key={zone.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{zone.name}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Delivery Charge:</span>
                                            <span className="font-medium">₹{zone.delivery_charge}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Free Delivery Above:</span>
                                            <span className="font-medium">₹{zone.free_delivery_above || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">COD Available:</span>
                                            <span className={zone.cod_available ? 'text-emerald-600' : 'text-red-600'}>
                                                {zone.cod_available ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {zones.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No delivery zones configured
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
                                                <code className="text-indigo-600">{shipment.order_number}</code>
                                            </td>
                                            <td className="px-6 py-4 text-slate-900 dark:text-white">{shipment.shipping_name}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{shipment.provider_name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                                    {shipment.tracking_number || shipment.awb_number || '-'}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${shipment.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                                    shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                                        shipment.status === 'rto' ? 'bg-red-100 text-red-800' :
                                                            'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {shipment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {new Date(shipment.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {shipments.length === 0 && (
                                <div className="text-center py-12 text-slate-500">No shipments yet</div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ShippingManagement;
