import { useState, useEffect, useMemo } from 'react';
import Modal from '../../../components/common/Modal';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

export default function CreateOrderModal({ onClose, onOrderCreated }) {
    const [step, setStep] = useState(1); // 1: Customer, 2: Products, 3: Review
    const [loading, setLoading] = useState(false);

    // Data
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [cart, setCart] = useState([]);
    const [orderDetails, setOrderDetails] = useState({
        payment_method: 'cash',
        payment_status: 'pending',
        notes: '',
        shipping_cost: 0,
        discount: 0
    });

    // Search States
    const [customerSearch, setCustomerSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await apiClient.get('/customers', { params: { limit: 100 } });
            setCustomers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            toast.error('Failed to load customers');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/ecommerce/products', { params: { limit: 100, status: 'active' } });
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        }
    };

    // Filtered lists
    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return customers;
        const lower = customerSearch.toLowerCase();
        return customers.filter(c =>
            c.name?.toLowerCase().includes(lower) ||
            c.email?.toLowerCase().includes(lower) ||
            c.phone?.includes(lower)
        );
    }, [customers, customerSearch]);

    const filteredProducts = useMemo(() => {
        if (!productSearch) return products;
        const lower = productSearch.toLowerCase();
        return products.filter(p =>
            p.name?.toLowerCase().includes(lower) ||
            p.sku?.toLowerCase().includes(lower)
        );
    }, [products, productSearch]);

    // Cart Actions
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                product_id: product.id,
                variant_id: null,
                name: product.name,
                sku: product.sku,
                unit_price: parseFloat(product.price),
                quantity: 1,
                image: product.image_url || null
            }];
        });
        toast.success('Added to order');
    };

    const updateQuantity = (productId, newQty) => {
        if (newQty < 1) {
            setCart(prev => prev.filter(item => item.product_id !== productId));
            return;
        }
        setCart(prev => prev.map(item =>
            item.product_id === productId
                ? { ...item, quantity: newQty }
                : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const total = subtotal + parseFloat(orderDetails.shipping_cost || 0) - parseFloat(orderDetails.discount || 0);

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            toast.error('Please select a customer');
            return;
        }
        if (cart.length === 0) {
            toast.error('Please add at least one product');
            return;
        }

        setLoading(true);
        try {
            // Construct payload matching backend expectations
            const payload = {
                client_id: selectedCustomer.id, // Using client_id as per schema keys, though route might expect customer_id logic? 
                // Wait, db schema has client_id (CRM contacts) and customer_id (Storefront users).
                // The /api/orders route uses client_id for CRM created orders typically.
                // Let's us client_id as we are selecting from CRM customers/clients.

                items: cart,

                // Shipping - Pre-fill from customer if available (simplified for now)
                shipping_name: selectedCustomer.name,
                shipping_email: selectedCustomer.email,
                shipping_phone: selectedCustomer.phone,
                shipping_address: selectedCustomer.address || '',

                // Billing
                billing_name: selectedCustomer.name,

                // Order Details
                payment_method: orderDetails.payment_method,
                payment_status: orderDetails.payment_status,
                notes: orderDetails.notes,
                shipping_cost: parseFloat(orderDetails.shipping_cost),
                discount: parseFloat(orderDetails.discount)
            };

            await apiClient.post('/orders', payload);
            toast.success('Order created successfully');
            onOrderCreated();
            onClose();
        } catch (error) {
            console.error('Create order error:', error);
            toast.error(error.response?.data?.error || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Create New Order"
            maxWidth="max-w-4xl"
            footer={
                <div className="flex justify-between w-full">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="btn-secondary disabled:opacity-50"
                    >
                        Back
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="btn-secondary">Cancel</button>
                        {step < 2 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                disabled={!selectedCustomer}
                                className="btn-primary disabled:opacity-50"
                            >
                                Next: Add Products
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || cart.length === 0}
                                className="btn-primary disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                Create Order - ₹{total.toLocaleString()}
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-6">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs border-current">1</div>
                    Customer
                </div>
                <div className="w-12 h-0.5 bg-slate-200 mx-2" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs border-current">2</div>
                    Products & Review
                </div>
            </div>

            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={customerSearch}
                            onChange={e => setCustomerSearch(e.target.value)}
                            className="input w-full"
                            autoFocus
                        />
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                            {filteredCustomers.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredCustomers.map(customer => (
                                            <tr key={customer.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedCustomer?.id === customer.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{customer.name}</td>
                                                <td className="px-4 py-3 text-slate-500">{customer.email}</td>
                                                <td className="px-4 py-3 text-slate-500">{customer.phone}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => setSelectedCustomer(customer)}
                                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedCustomer?.id === customer.id
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {selectedCustomer?.id === customer.id ? 'Selected' : 'Select'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-slate-500">No customers found</div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Product Selection */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-slate-900 dark:text-white">Add Products</h3>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                className="input w-full"
                            />
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-[400px] overflow-y-auto">
                                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredProducts.map(product => (
                                        <div key={product.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 rounded flex-shrink-0 overflow-hidden">
                                                    {product.image_url ? <img src={product.image_url} alt="" className="w-full h-full object-cover" /> : null}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{product.name}</p>
                                                    <p className="text-xs text-slate-500">SKU: {product.sku} • Stock: {product.inventory_count || product.stock || 0}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">₹{parseFloat(product.price).toLocaleString()}</p>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <div className="p-8 text-center text-slate-500 text-sm">No products found</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Cart & Summary */}
                        <div className="space-y-6 flex flex-col h-[500px]">
                            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Order Summary</h3>
                                {cart.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                        Cart is empty
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map((item, idx) => (
                                            <div key={`${item.product_id}-${idx}`} className="flex items-start justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded shadow-sm">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-500">₹{item.unit_price.toLocaleString()} each</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded">
                                                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="px-2 py-1 text-slate-500 hover:bg-slate-100">-</button>
                                                        <span className="px-2 text-xs font-medium">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="px-2 py-1 text-slate-500 hover:bg-slate-100">+</button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 hover:text-red-700">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Order Details Form */}
                            <div className="border-t pt-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label text-xs">Payment Method</label>
                                        <select
                                            value={orderDetails.payment_method}
                                            onChange={e => setOrderDetails({ ...orderDetails, payment_method: e.target.value })}
                                            className="select text-sm py-1.5"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="upi">UPI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label text-xs">Payment Status</label>
                                        <select
                                            value={orderDetails.payment_status}
                                            onChange={e => setOrderDetails({ ...orderDetails, payment_status: e.target.value })}
                                            className="select text-sm py-1.5"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label text-xs">Shipping Cost</label>
                                        <input
                                            type="number"
                                            value={orderDetails.shipping_cost}
                                            onChange={e => setOrderDetails({ ...orderDetails, shipping_cost: e.target.value })}
                                            className="input text-sm py-1.5"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="label text-xs">Discount</label>
                                        <input
                                            type="number"
                                            value={orderDetails.discount}
                                            onChange={e => setOrderDetails({ ...orderDetails, discount: e.target.value })}
                                            className="input text-sm py-1.5"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Shipping</span>
                                        <span>₹{parseFloat(orderDetails.shipping_cost || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-500">Discount</span>
                                        <span className="text-emerald-600">-₹{parseFloat(orderDetails.discount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <span>Total</span>
                                        <span className="text-indigo-600">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
