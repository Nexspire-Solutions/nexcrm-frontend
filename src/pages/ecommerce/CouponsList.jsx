import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/**
 * Coupons List Page - Promotions Management
 */
const CouponsList = () => {
    const [activeTab, setActiveTab] = useState('coupons'); // 'coupons' | 'flash_sales'
    const [flashSales, setFlashSales] = useState([]);
    const [showFlashModal, setShowFlashModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyCoupon, setHistoryCoupon] = useState(null);

    useEffect(() => {
        fetchCoupons();
        fetchStats();
        fetchFlashSales();
    }, []);

    const fetchFlashSales = async () => {
        try {
            const response = await apiClient.get('/coupons/flash-sales');
            setFlashSales(response.data.data || []);
        } catch (error) {
            console.error('Failed to load flash sales');
        }
    };

    // ... (existing fetchCoupons, fetchStats etc)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 py-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Coupons & Offers</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage discount codes and flash sales</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'coupons' ? (
                        <button onClick={() => { setEditingCoupon(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Coupon
                        </button>
                    ) : (
                        <button onClick={() => setShowFlashModal(true)} className="btn-primary flex items-center gap-2 shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Flash Sale
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={`${activeTab === 'coupons'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Coupon Codes
                    </button>
                    <button
                        onClick={() => setActiveTab('flash_sales')}
                        className={`${activeTab === 'flash_sales'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Flash Sales
                    </button>
                </nav>
            </div>

            {activeTab === 'coupons' && (
                <>
                    {/* Stats Cards (Existing) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Coupons</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active || 0}</p>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_used || 0}</p>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Times Used</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{(stats.total_discount || 0).toLocaleString()}</p>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Discounts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coupons Table */}
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Value</th>
                                        <th className="px-6 py-4">Usage</th>
                                        <th className="px-6 py-4">Validity</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {coupons.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="empty-state">
                                                    <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    <h3 className="empty-state-title">No coupons yet</h3>
                                                    <p className="empty-state-text">Create your first coupon to offer discounts</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        coupons.map(coupon => (
                                            <tr key={coupon.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <code className="text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded">
                                                        {coupon.code}
                                                    </code>
                                                    {coupon.name && <p className="text-xs text-slate-500 mt-1">{coupon.name}</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="capitalize">{coupon.type}</span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                    {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-xs">
                                                    {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'No expiry'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleToggleActive(coupon)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${coupon.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        {coupon.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => { setEditingCoupon(coupon); setShowModal(true); }}
                                                            className="btn-ghost btn-sm text-indigo-600"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDelete(coupon.id)} className="btn-ghost btn-sm text-red-600">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'flash_sales' && (
                <FlashSalesList sales={flashSales} onUpdate={fetchFlashSales} />
            )}

            {/* Coupon Modal */}
            {showModal && (
                <CouponModal
                    coupon={editingCoupon}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchCoupons(); fetchStats(); }}
                />
            )}

            {/* Flash Sale Modal */}
            {showFlashModal && (
                <FlashSaleModal
                    onClose={() => setShowFlashModal(false)}
                    onSave={() => { setShowFlashModal(false); fetchFlashSales(); }}
                />
            )}

            {showHistoryModal && (
                <UsageHistoryModal
                    coupon={historyCoupon}
                    onClose={() => setShowHistoryModal(false)}
                />
            )}
        </div>
    );
};

// ... CouponModal (existing) ...

// ==========================================
// FLASH SALES COMPONENTS
// ==========================================

const FlashSalesList = ({ sales, onUpdate }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Discount</th>
                        <th className="px-6 py-4">Duration</th>
                        <th className="px-6 py-4">Products</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {sales.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center">
                                <div className="empty-state">
                                    <h3 className="empty-state-title">No Active Flash Sales</h3>
                                    <p className="empty-state-text">Create a flash sale to boost revenue</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        sales.map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {sale.name}
                                </td>
                                <td className="px-6 py-4">
                                    {sale.discount_type === 'percentage' ? `${sale.discount_value}%` : `₹${sale.discount_value}`}
                                </td>
                                <td className="px-6 py-4 text-xs">
                                    <div className="flex flex-col">
                                        <span>From: {new Date(sale.start_time).toLocaleString()}</span>
                                        <span>To: {new Date(sale.end_time).toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {sale.product_count} items
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(sale.end_time) < new Date() ? (
                                        <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs">Expired</span>
                                    ) : new Date(sale.start_time) > new Date() ? (
                                        <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs">Scheduled</span>
                                    ) : (
                                        <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">Active</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

const FlashSaleModal = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        start_time: '',
        end_time: '',
        products: [] // Array of { product_id, sale_price, quantity_limit }
    });

    // UI State for product selection
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Fetch products for selection
        apiClient.get('/products?limit=100').then(res => {
            setAvailableProducts(res.data.data || []);
        });
    }, []);

    const addProduct = () => {
        if (!selectedProduct) return;
        const product = availableProducts.find(p => p.id === Number(selectedProduct));
        if (!product) return;

        // Check if already added
        if (form.products.find(p => p.product_id === product.id)) return;

        setForm(prev => ({
            ...prev,
            products: [...prev.products, {
                product_id: product.id,
                name: product.name, // For UI only
                price: product.price, // For UI only
                sale_price: form.discount_type === 'percentage'
                    ? (product.price * (1 - form.discount_value / 100)).toFixed(2)
                    : (product.price - form.discount_value).toFixed(2),
                quantity_limit: ''
            }]
        }));
        setSelectedProduct('');
    };

    const removeProduct = (id) => {
        setForm(prev => ({
            ...prev,
            products: prev.products.filter(p => p.product_id !== id)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.discount_value || !form.start_time || !form.end_time) {
            toast.error('Please fill all required fields');
            return;
        }

        setSaving(true);
        try {
            await apiClient.post('/coupons/flash-sales', form);
            toast.success('Flash sale created!');
            onSave();
        } catch (error) {
            toast.error('Failed to create flash sale');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Create Flash Sale"
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                        {saving ? 'Creating...' : 'Create Sale'}
                    </button>
                </>
            }
        >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
                <div>
                    <label className="label">Sale Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="input"
                        placeholder="Summer Flash Sale"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Start Time</label>
                        <input
                            type="datetime-local"
                            value={form.start_time}
                            onChange={e => setForm({ ...form, start_time: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">End Time</label>
                        <input
                            type="datetime-local"
                            value={form.end_time}
                            onChange={e => setForm({ ...form, end_time: e.target.value })}
                            className="input"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Discount Type</label>
                        <select
                            value={form.discount_type}
                            onChange={e => setForm({ ...form, discount_type: e.target.value })}
                            className="select"
                        >
                            <option value="percentage">Percentage Off (%)</option>
                            <option value="fixed">Fixed Amount Off (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Value</label>
                        <input
                            type="number"
                            value={form.discount_value}
                            onChange={e => setForm({ ...form, discount_value: e.target.value })}
                            className="input"
                            placeholder="20"
                        />
                    </div>
                </div>

                {/* Product Selection */}
                <div className="border-t pt-4">
                    <label className="label mb-2">Include Products</label>
                    <div className="flex gap-2 mb-2">
                        <select
                            value={selectedProduct}
                            onChange={e => setSelectedProduct(e.target.value)}
                            className="select flex-1"
                        >
                            <option value="">Select a product...</option>
                            {availableProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={addProduct}
                            className="btn-primary px-4"
                        >
                            Add
                        </button>
                    </div>

                    {/* Selected Products List */}
                    <div className="space-y-2">
                        {form.products.map((item, idx) => (
                            <div key={item.product_id} className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 p-2 rounded">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-500">Orig: ₹{item.price} → Sale: ₹{item.sale_price}</p>
                                </div>
                                <input
                                    type="number"
                                    placeholder="Limit Qty"
                                    className="input py-1 px-2 w-24 text-sm"
                                    value={item.quantity_limit}
                                    onChange={(e) => {
                                        const newProducts = [...form.products];
                                        newProducts[idx].quantity_limit = e.target.value;
                                        setForm({ ...form, products: newProducts });
                                    }}
                                />
                                <button
                                    onClick={() => removeProduct(item.product_id)}
                                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                        {form.products.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-2">No products added. Sale will apply to selected products.</p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Coupon Add/Edit Modal
 */
const CouponModal = ({ coupon, onClose, onSave }) => {
    const [form, setForm] = useState({
        code: coupon?.code || '',
        name: coupon?.name || '',
        type: coupon?.type || 'percentage',
        value: coupon?.value || '',
        min_order_value: coupon?.min_order_value || '',
        max_discount: coupon?.max_discount || '',
        usage_limit: coupon?.usage_limit || '',
        per_user_limit: coupon?.per_user_limit || 1,
        end_date: coupon?.end_date?.split('T')[0] || '',
        applies_to: coupon?.applies_to || 'all',
        product_ids: coupon?.product_ids ? (Array.isArray(coupon.product_ids) ? coupon.product_ids : JSON.parse(coupon.product_ids)) : [],
        category_ids: coupon?.category_ids ? (Array.isArray(coupon.category_ids) ? coupon.category_ids : JSON.parse(coupon.category_ids)) : []
    });
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // Fetch products and categories for selection
        const loadData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    apiClient.get('/products?limit=100'), // Limit to 100 for now
                    apiClient.get('/products/categories')
                ]);
                setProducts(prodRes.data.data || []);
                setCategories(catRes.data.categories || []);
            } catch (error) {
                console.error('Failed to load products/categories', error);
                toast.error('Failed to load selection data');
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.code?.trim()) {
            toast.error('Coupon code is required');
            return;
        }
        if (!form.value || Number(form.value) <= 0) {
            toast.error('Valid discount value is required');
            return;
        }
        if (form.type === 'percentage' && Number(form.value) > 100) {
            toast.error('Percentage discount cannot exceed 100%');
            return;
        }
        if (form.min_order_value && Number(form.min_order_value) < 0) {
            toast.error('Min order value cannot be negative');
            return;
        }
        if (form.usage_limit && Number(form.usage_limit) <= 0) {
            toast.error('Usage limit must be greater than 0');
            return;
        }
        if (form.end_date && new Date(form.end_date) < new Date()) {
            toast.error('Expiry date cannot be in the past');
            return;
        }
        if (form.applies_to === 'specific_products' && form.product_ids.length === 0) {
            toast.error('Please select at least one product');
            return;
        }
        if (form.applies_to === 'specific_categories' && form.category_ids.length === 0) {
            toast.error('Please select at least one category');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form };
            // Ensure IDs are numbers
            if (payload.product_ids) payload.product_ids = payload.product_ids.map(Number);
            if (payload.category_ids) payload.category_ids = payload.category_ids.map(Number);

            if (coupon) {
                await apiClient.put(`/coupons/${coupon.id}`, payload);
            } else {
                await apiClient.post('/coupons', payload);
            }
            toast.success(coupon ? 'Coupon updated' : 'Coupon created');
            onSave();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save coupon');
        } finally {
            setSaving(false);
        }
    };

    const toggleSelection = (id, type) => {
        const key = type === 'product' ? 'product_ids' : 'category_ids';
        const current = form[key];
        const newSelection = current.includes(id)
            ? current.filter(item => item !== id)
            : [...current, id];
        setForm({ ...form, [key]: newSelection });
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={coupon ? 'Edit Coupon' : 'Create Coupon'}
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : (coupon ? 'Update' : 'Create')}
                    </button>
                </>
            }
        >
            <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Coupon Code *</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            className="input"
                            placeholder="SAVE20"
                        />
                    </div>
                    <div>
                        <label className="label">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input"
                            placeholder="Summer Sale"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Discount Type</label>
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                            <option value="free_shipping">Free Shipping</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Value *</label>
                        <input
                            type="number"
                            value={form.value}
                            onChange={(e) => setForm({ ...form, value: e.target.value })}
                            className="input"
                            placeholder={form.type === 'percentage' ? '20' : '500'}
                        />
                    </div>
                </div>

                {/* Application Logic */}
                <div>
                    <label className="label">Applies To</label>
                    <select
                        value={form.applies_to}
                        onChange={(e) => setForm({ ...form, applies_to: e.target.value })}
                        className="select"
                    >
                        <option value="all">Entire Order</option>
                        <option value="specific_products">Specific Products</option>
                        <option value="specific_categories">Specific Categories</option>
                    </select>
                </div>

                {form.applies_to === 'specific_products' && (
                    <div className="border rounded-lg p-3 bg-gray-50 dark:bg-slate-900/50 max-h-48 overflow-y-auto">
                        <label className="label mb-2">Select Products</label>
                        <div className="space-y-2">
                            {products.map(p => (
                                <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.product_ids.includes(p.id)}
                                        onChange={() => toggleSelection(p.id, 'product')}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm">{p.name}</span>
                                </label>
                            ))}
                            {products.length === 0 && <p className="text-xs text-gray-500">No products found</p>}
                        </div>
                    </div>
                )}

                {form.applies_to === 'specific_categories' && (
                    <div className="border rounded-lg p-3 bg-gray-50 dark:bg-slate-900/50 max-h-48 overflow-y-auto">
                        <label className="label mb-2">Select Categories</label>
                        <div className="space-y-2">
                            {categories.map(c => (
                                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.category_ids.includes(c.id)}
                                        onChange={() => toggleSelection(c.id, 'category')}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm">{c.name}</span>
                                </label>
                            ))}
                            {categories.length === 0 && <p className="text-xs text-gray-500">No categories found</p>}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Min Order Value</label>
                        <input
                            type="number"
                            value={form.min_order_value}
                            onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                            className="input"
                            placeholder="1000"
                        />
                    </div>
                    <div>
                        <label className="label">Max Discount</label>
                        <input
                            type="number"
                            value={form.max_discount}
                            onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                            className="input"
                            placeholder="500"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="label">Usage Limit</label>
                        <input
                            type="number"
                            value={form.usage_limit}
                            onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                            className="input"
                            placeholder="∞"
                        />
                    </div>
                    <div>
                        <label className="label">Per User Limit</label>
                        <input
                            type="number"
                            value={form.per_user_limit}
                            onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">Expiry Date</label>
                        <input
                            type="date"
                            value={form.end_date}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            className="input"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

const UsageHistoryModal = ({ coupon, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (coupon) {
            apiClient.get(`/coupons/${coupon.id}/usage`)
                .then(res => setHistory(res.data.usage || []))
                .catch(() => toast.error('Failed to load history'))
                .finally(() => setLoading(false));
        }
    }, [coupon]);

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`Usage History: ${coupon?.code}`}
            footer={<button onClick={onClose} className="btn-secondary">Close</button>}
        >
            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Customer</th>
                                <th className="px-4 py-2">Order #</th>
                                <th className="px-4 py-2">Discount</th>
                                <th className="px-4 py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        No usage history found.
                                    </td>
                                </tr>
                            ) : (
                                history.map(row => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-2 text-gray-500">
                                            {new Date(row.used_at).toLocaleDateString()}
                                            <span className="text-xs ml-1 text-gray-400">
                                                {new Date(row.used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <p className="font-medium text-slate-900 dark:text-white">{row.customer_name}</p>
                                            <p className="text-xs text-gray-500">{row.customer_email}</p>
                                        </td>
                                        <td className="px-4 py-2 font-mono text-xs">
                                            {row.order_number || 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 font-medium text-green-600">
                                            -₹{Number(row.discount_amount).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">
                                            ₹{Number(row.order_total).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </Modal>
    );
};

export default CouponsList;
