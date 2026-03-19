import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../../../api/axios';
import ProHeader from '../../../components/common/ProHeader';

function todayPlus(days = 0) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function emptyItem() {
    return {
        description: '',
        quantity: 1,
        unit: 'pcs',
        unit_price: 0,
        item_type: 'custom'
    };
}

export default function ManufacturingInvoiceForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [clients, setClients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        client_id: '',
        source_id: '',
        invoice_date: todayPlus(0),
        due_date: todayPlus(30),
        tax_rate: 18,
        discount_amount: 0,
        notes: '',
        billing_name: '',
        billing_company: '',
        billing_email: '',
        billing_phone: '',
        billing_address: '',
        billing_gst_number: ''
    });
    const [items, setItems] = useState([emptyItem()]);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                setLoading(true);
                const requests = [
                    apiClient.get('/clients', { params: { limit: 200 } }),
                    apiClient.get('/production')
                ];

                if (isEditMode) {
                    requests.push(apiClient.get(`/invoices/records/${id}`));
                }

                const [clientsRes, ordersRes, invoiceRes] = await Promise.all(requests);
                setClients(clientsRes.data.data || []);
                setOrders(ordersRes.data.data || []);

                if (invoiceRes?.data?.data) {
                    const invoice = invoiceRes.data.data;
                    setFormData({
                        client_id: invoice.client_id ? String(invoice.client_id) : '',
                        source_id: invoice.source_id ? String(invoice.source_id) : '',
                        invoice_date: invoice.invoice_date ? String(invoice.invoice_date).split('T')[0] : todayPlus(0),
                        due_date: invoice.due_date ? String(invoice.due_date).split('T')[0] : '',
                        tax_rate: invoice.tax_rate ?? 0,
                        discount_amount: invoice.discount_amount ?? 0,
                        notes: invoice.notes || '',
                        billing_name: invoice.billing_name || '',
                        billing_company: invoice.billing_company || '',
                        billing_email: invoice.billing_email || '',
                        billing_phone: invoice.billing_phone || '',
                        billing_address: invoice.billing_address || '',
                        billing_gst_number: invoice.billing_gst_number || ''
                    });
                    setItems(invoice.items?.length ? invoice.items.map((item) => ({
                        description: item.description || '',
                        quantity: item.quantity ?? 1,
                        unit: item.unit || 'pcs',
                        unit_price: item.unit_price ?? 0,
                        item_type: item.item_type || 'custom'
                    })) : [emptyItem()]);
                }
            } catch (error) {
                console.error('Failed to load invoice form data:', error);
                toast.error('Failed to load invoice form');
            } finally {
                setLoading(false);
            }
        };

        loadOptions();
    }, [id, isEditMode]);

    const selectedClient = useMemo(
        () => clients.find(client => String(client.id) === String(formData.client_id)),
        [clients, formData.client_id]
    );

    const selectedOrder = useMemo(
        () => orders.find(order => String(order.id) === String(formData.source_id)),
        [orders, formData.source_id]
    );

    useEffect(() => {
        if (!selectedClient) return;

        setFormData(prev => ({
            ...prev,
            billing_name: selectedClient.name || '',
            billing_company: selectedClient.company || '',
            billing_email: selectedClient.email || '',
            billing_phone: selectedClient.phone || '',
            billing_address: selectedClient.address || ''
        }));
    }, [selectedClient]);

    const handleOrderSelect = (orderId) => {
        setFormData(prev => ({ ...prev, source_id: orderId }));

        const order = orders.find(entry => String(entry.id) === String(orderId));
        if (!order) return;

        setItems(prev => {
            const next = [...prev];
            const firstItem = next[0] || emptyItem();
            next[0] = {
                ...firstItem,
                description: `Production Order ${order.order_number} - ${order.product_name || 'Manufactured Product'}`,
                quantity: Number(order.produced_quantity) || Number(order.quantity) || 1,
                unit: 'units',
                item_type: 'production_order'
            };
            return next;
        });
    };

    const updateItem = (index, field, value) => {
        setItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
    };

    const addItem = () => setItems(prev => [...prev, emptyItem()]);
    const removeItem = (index) => setItems(prev => prev.length === 1 ? prev : prev.filter((_, idx) => idx !== index));

    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0);
        const discount = parseFloat(formData.discount_amount) || 0;
        const taxable = Math.max(0, subtotal - discount);
        const taxAmount = taxable * ((parseFloat(formData.tax_rate) || 0) / 100);
        const total = taxable + taxAmount;

        return { subtotal, discount, taxable, taxAmount, total };
    }, [items, formData.discount_amount, formData.tax_rate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.billing_name) {
            toast.error('Billing name is required');
            return;
        }

        if (items.some(item => !item.description)) {
            toast.error('Each invoice item needs a description');
            return;
        }

        try {
            setSaving(true);

            const payload = {
                industry_type: 'manufacturing',
                invoice_context: 'manufacturing',
                source_type: formData.source_id ? 'production_order' : null,
                source_id: formData.source_id || null,
                client_id: formData.client_id || null,
                title: selectedOrder ? `Factory Invoice for ${selectedOrder.order_number}` : 'Manufacturing Invoice',
                invoice_date: formData.invoice_date,
                due_date: formData.due_date,
                tax_rate: parseFloat(formData.tax_rate) || 0,
                discount_amount: parseFloat(formData.discount_amount) || 0,
                notes: formData.notes,
                billing_name: formData.billing_name,
                billing_company: formData.billing_company,
                billing_email: formData.billing_email,
                billing_phone: formData.billing_phone,
                billing_address: formData.billing_address,
                billing_gst_number: formData.billing_gst_number,
                meta: selectedOrder ? {
                    production_order_id: selectedOrder.id,
                    production_order_number: selectedOrder.order_number
                } : {},
                items: items.map(item => ({
                    description: item.description,
                    quantity: parseFloat(item.quantity) || 0,
                    unit: item.unit || 'pcs',
                    unit_price: parseFloat(item.unit_price) || 0,
                    item_type: item.item_type || 'custom'
                }))
            };

            const response = isEditMode
                ? await apiClient.put(`/invoices/records/${id}`, payload)
                : await apiClient.post('/invoices/records', payload);

            toast.success(isEditMode ? 'Invoice updated successfully' : 'Invoice created successfully');
            navigate(`/manufacturing-invoices/${response.data.data.id}`);
        } catch (error) {
            console.error('Failed to save manufacturing invoice:', error);
            toast.error(error.response?.data?.error || 'Failed to save invoice');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6" />
                <div className="card p-6 space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <ProHeader
                title={isEditMode ? 'Edit Manufacturing Invoice' : 'New Manufacturing Invoice'}
                subtitle="Create a reusable invoice record linked to production when needed"
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Manufacturing', to: '/production' },
                    { label: 'Invoices', to: '/manufacturing-invoices' },
                    { label: isEditMode ? 'Edit' : 'New' }
                ]}
                actions={<Link to="/manufacturing-invoices" className="btn-secondary flex items-center gap-2"><FiArrowLeft className="w-4 h-4" /> Back</Link>}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Invoice Setup</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client</label>
                            <select
                                value={formData.client_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Select client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}{client.company ? ` - ${client.company}` : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Production Order</label>
                            <select
                                value={formData.source_id}
                                onChange={(e) => handleOrderSelect(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                                <option value="">Optional production link</option>
                                {orders.map(order => (
                                    <option key={order.id} value={order.id}>{order.order_number} - {order.product_name || 'Product'}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Date</label>
                            <input
                                type="date"
                                value={formData.invoice_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Rate (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.tax_rate}
                                onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.discount_amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Billing Snapshot</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Name</label>
                            <input type="text" value={formData.billing_name} onChange={(e) => setFormData(prev => ({ ...prev, billing_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company</label>
                            <input type="text" value={formData.billing_company} onChange={(e) => setFormData(prev => ({ ...prev, billing_company: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input type="email" value={formData.billing_email} onChange={(e) => setFormData(prev => ({ ...prev, billing_email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                            <input type="text" value={formData.billing_phone} onChange={(e) => setFormData(prev => ({ ...prev, billing_phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GST Number</label>
                            <input type="text" value={formData.billing_gst_number} onChange={(e) => setFormData(prev => ({ ...prev, billing_gst_number: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                            <textarea value={formData.billing_address} onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Invoice Items</h2>
                        <button type="button" onClick={addItem} className="btn-secondary flex items-center gap-2">
                            <FiPlus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="md:col-span-5">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                                    <input type="text" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                                    <input type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
                                    <input type="text" value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Rate</label>
                                    <input type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div className="md:col-span-1 flex items-end">
                                    <button type="button" onClick={() => removeItem(index)} className="w-full px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center">
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card p-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                        <textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={6} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Payment terms, dispatch notes, warranty notes..." />
                    </div>

                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Totals</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-medium">₹{totals.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="font-medium">₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                            <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700 text-base font-semibold"><span>Total</span><span>₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link to="/manufacturing-invoices" className="btn-secondary">Cancel</Link>
                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Invoice' : 'Create Invoice')}
                    </button>
                </div>
            </form>
        </div>
    );
}
