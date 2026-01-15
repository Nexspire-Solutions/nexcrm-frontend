import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

// Icons
const Icons = {
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    edit: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    package: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    tag: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
    )
};

export default function ServicePackages() {
    const [packages, setPackages] = useState([]);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        package_price: '',
        validity_days: 365,
        max_redemptions: 1,
        is_active: true,
        is_featured: false,
        services: []
    });

    useEffect(() => {
        fetchPackages();
        fetchServices();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await apiClient.get('/service-packages');
            setPackages(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await apiClient.get('/services', { params: { is_active: true } });
            setServices(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPackage) {
                await apiClient.put(`/service-packages/${editingPackage.id}`, formData);
            } else {
                await apiClient.post('/service-packages', formData);
            }
            setShowModal(false);
            setEditingPackage(null);
            resetForm();
            fetchPackages();
        } catch (error) {
            console.error('Failed to save package:', error);
            alert(error.response?.data?.error || 'Failed to save package');
        }
    };

    const handleEdit = async (pkg) => {
        try {
            const response = await apiClient.get(`/service-packages/${pkg.id}`);
            const data = response.data?.data || pkg;

            setEditingPackage(data);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                package_price: data.package_price || '',
                validity_days: data.validity_days || 365,
                max_redemptions: data.max_redemptions || 1,
                is_active: data.is_active !== false,
                is_featured: data.is_featured || false,
                services: (data.included_services || []).map(s => ({
                    service_id: s.service_id,
                    quantity: s.quantity || 1
                }))
            });
            setShowModal(true);
        } catch (error) {
            console.error('Failed to fetch package:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this package?')) return;
        try {
            await apiClient.delete(`/service-packages/${id}`);
            fetchPackages();
        } catch (error) {
            console.error('Failed to delete package:', error);
            alert(error.response?.data?.error || 'Failed to delete package');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            package_price: '',
            validity_days: 365,
            max_redemptions: 1,
            is_active: true,
            is_featured: false,
            services: []
        });
    };

    const toggleService = (serviceId) => {
        setFormData(prev => {
            const existing = prev.services.find(s => s.service_id === serviceId);
            if (existing) {
                return {
                    ...prev,
                    services: prev.services.filter(s => s.service_id !== serviceId)
                };
            } else {
                return {
                    ...prev,
                    services: [...prev.services, { service_id: serviceId, quantity: 1 }]
                };
            }
        });
    };

    const updateQuantity = (serviceId, quantity) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.map(s =>
                s.service_id === serviceId ? { ...s, quantity: Math.max(1, quantity) } : s
            )
        }));
    };

    const calculateOriginalPrice = () => {
        return formData.services.reduce((sum, s) => {
            const service = services.find(srv => srv.id === s.service_id);
            return sum + (parseFloat(service?.price || 0) * s.quantity);
        }, 0);
    };

    const calculateDiscount = () => {
        const original = calculateOriginalPrice();
        const packagePrice = parseFloat(formData.package_price) || 0;
        if (original <= 0 || packagePrice >= original) return 0;
        return ((original - packagePrice) / original * 100).toFixed(0);
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Service Packages"
                subtitle={`${packages.length} bundles available`}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Services' },
                    { label: 'Packages' }
                ]}
                actions={
                    <button
                        onClick={() => { resetForm(); setEditingPackage(null); setShowModal(true); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        {Icons.plus}
                        Create Package
                    </button>
                }
            />

            {/* Packages Grid */}
            {packages.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            {Icons.package}
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No packages created</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            Bundle services together to offer discounted packages to your clients.
                        </p>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            {Icons.plus}
                            Create First Package
                        </button>
                    </div>
                </ProCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {packages.map((pkg) => (
                        <ProCard key={pkg.id} className="hover:shadow-lg transition-shadow relative">
                            {/* Featured badge */}
                            {pkg.is_featured && (
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1">
                                        {Icons.tag}
                                        Featured
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                                    {pkg.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {pkg.description || 'No description'}
                                </p>
                            </div>

                            {/* Included Services */}
                            <div className="mb-4">
                                <p className="text-xs font-medium text-slate-500 mb-2">INCLUDES</p>
                                <div className="space-y-1">
                                    {(pkg.included_services || []).slice(0, 3).map((service, idx) => (
                                        <div key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                            {service.service_name}
                                            {service.quantity > 1 && ` x${service.quantity}`}
                                        </div>
                                    ))}
                                    {(pkg.included_services || []).length > 3 && (
                                        <p className="text-xs text-slate-500">
                                            +{pkg.included_services.length - 3} more services
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    ₹{parseFloat(pkg.package_price || 0).toLocaleString()}
                                </span>
                                {pkg.original_price && pkg.original_price > pkg.package_price && (
                                    <>
                                        <span className="text-sm text-slate-400 line-through">
                                            ₹{parseFloat(pkg.original_price).toLocaleString()}
                                        </span>
                                        <span className="text-sm text-green-600 font-medium">
                                            Save {pkg.discount_percent}%
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Validity */}
                            <div className="text-xs text-slate-500 mb-4">
                                Valid for {pkg.validity_days} days | {pkg.max_redemptions} redemption{pkg.max_redemptions > 1 ? 's' : ''}
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                <StatusBadge
                                    status={pkg.is_active ? 'Active' : 'Inactive'}
                                    variant={pkg.is_active ? 'success' : 'warning'}
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(pkg)}
                                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    >
                                        {Icons.edit}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pkg.id)}
                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        {Icons.trash}
                                    </button>
                                </div>
                            </div>
                        </ProCard>
                    ))}
                </div>
            )}

            {/* Package Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingPackage ? 'Edit Package' : 'Create Package'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingPackage(null); }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                                {Icons.close}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Package Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    placeholder="e.g., Spa Day Package"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    rows={2}
                                />
                            </div>

                            {/* Service Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Select Services *
                                </label>
                                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                                    {services.map(service => {
                                        const selected = formData.services.find(s => s.service_id === service.id);
                                        return (
                                            <div
                                                key={service.id}
                                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${selected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                                                    }`}
                                                onClick={() => toggleService(service.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!!selected}
                                                    onChange={() => { }}
                                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                                                    {service.name}
                                                </span>
                                                <span className="text-xs text-slate-500">₹{service.price}</span>
                                                {selected && (
                                                    <input
                                                        type="number"
                                                        value={selected.quantity}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(service.id, parseInt(e.target.value) || 1);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-14 px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                                                        min="1"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {formData.services.length > 0 && (
                                    <p className="text-sm text-slate-500 mt-2">
                                        Original value: ₹{calculateOriginalPrice().toLocaleString()}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Package Price *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.package_price}
                                        onChange={(e) => setFormData({ ...formData, package_price: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        min="0"
                                        step="0.01"
                                    />
                                    {calculateDiscount() > 0 && (
                                        <p className="text-xs text-green-600 mt-1">{calculateDiscount()}% discount</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Validity (days)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.validity_days}
                                        onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) || 365 })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Featured</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingPackage(null); }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    disabled={formData.services.length === 0}
                                >
                                    {editingPackage ? 'Update Package' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
