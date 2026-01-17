/**
 * Invoice Form Component - Legal Module
 * 
 * Create and edit invoices with:
 * - Client and case selection
 * - Unbilled time entries and expenses
 * - Manual line items
 * - Tax calculation (GST)
 * - Discounts
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiClock, FiDollarSign, FiFileText, FiCalendar, FiPercent } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';

export default function InvoiceForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [clients, setClients] = useState([]);
    const [cases, setCases] = useState([]);
    const [unbilledTimeEntries, setUnbilledTimeEntries] = useState([]);
    const [unbilledExpenses, setUnbilledExpenses] = useState([]);

    const [formData, setFormData] = useState({
        client_id: '',
        case_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billing_period_start: '',
        billing_period_end: '',
        discount_type: 'amount',
        discount_value: 0,
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 0,
        payment_terms: 'Net 30 days',
        notes: ''
    });

    const [selectedTimeEntries, setSelectedTimeEntries] = useState([]);
    const [selectedExpenses, setSelectedExpenses] = useState([]);
    const [manualItems, setManualItems] = useState([]);

    useEffect(() => {
        fetchClients();
        if (isEditing) {
            loadInvoice();
        }
    }, [id]);

    useEffect(() => {
        if (formData.client_id) {
            fetchClientCases(formData.client_id);
        }
    }, [formData.client_id]);

    useEffect(() => {
        if (formData.case_id) {
            fetchUnbilledItems(formData.case_id);
        } else {
            setUnbilledTimeEntries([]);
            setUnbilledExpenses([]);
        }
    }, [formData.case_id]);

    const fetchClients = async () => {
        try {
            const response = await apiClient.get('/legal-clients');
            setClients(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch clients');
        }
    };

    const fetchClientCases = async (clientId) => {
        try {
            const response = await apiClient.get(`/cases?client_id=${clientId}`);
            setCases(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch cases');
        }
    };

    const fetchUnbilledItems = async (caseId) => {
        try {
            // Fetch unbilled time entries
            const timeResponse = await apiClient.get(`/time-entries?case_id=${caseId}&billed=false`);
            setUnbilledTimeEntries(timeResponse.data.data || []);

            // Fetch unbilled expenses (if endpoint exists)
            try {
                const expenseResponse = await apiClient.get(`/legal-billing/expenses?case_id=${caseId}&billed=false`);
                setUnbilledExpenses(expenseResponse.data.data || []);
            } catch {
                setUnbilledExpenses([]);
            }
        } catch (error) {
            console.error('Failed to fetch unbilled items');
        }
    };

    const loadInvoice = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/legal-billing/invoices/${id}`);
            const invoice = response.data.data;

            setFormData({
                client_id: invoice.client_id || '',
                case_id: invoice.case_id || '',
                invoice_date: invoice.invoice_date?.split('T')[0] || '',
                due_date: invoice.due_date?.split('T')[0] || '',
                billing_period_start: invoice.billing_period_start?.split('T')[0] || '',
                billing_period_end: invoice.billing_period_end?.split('T')[0] || '',
                discount_type: invoice.discount_type || 'amount',
                discount_value: invoice.discount_value || 0,
                cgst_rate: invoice.cgst_rate || 9,
                sgst_rate: invoice.sgst_rate || 9,
                igst_rate: invoice.igst_rate || 0,
                payment_terms: invoice.payment_terms || '',
                notes: invoice.notes || ''
            });

            // Load existing items as manual items
            if (invoice.items?.length) {
                setManualItems(invoice.items.map(item => ({
                    id: item.id,
                    item_type: item.item_type || 'flat_fee',
                    description: item.description,
                    quantity: item.quantity || 1,
                    rate: item.rate || 0,
                    amount: item.amount || 0
                })));
            }
        } catch (error) {
            toast.error('Failed to load invoice');
            navigate('/legal-invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleTimeEntry = (entry) => {
        setSelectedTimeEntries(prev => {
            const exists = prev.find(e => e.id === entry.id);
            if (exists) {
                return prev.filter(e => e.id !== entry.id);
            }
            return [...prev, entry];
        });
    };

    const toggleExpense = (expense) => {
        setSelectedExpenses(prev => {
            const exists = prev.find(e => e.id === expense.id);
            if (exists) {
                return prev.filter(e => e.id !== expense.id);
            }
            return [...prev, expense];
        });
    };

    const addManualItem = () => {
        setManualItems(prev => [...prev, {
            id: Date.now(),
            item_type: 'flat_fee',
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0
        }]);
    };

    const updateManualItem = (id, field, value) => {
        setManualItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    updated.amount = (parseFloat(updated.quantity) || 0) * (parseFloat(updated.rate) || 0);
                }
                return updated;
            }
            return item;
        }));
    };

    const removeManualItem = (id) => {
        setManualItems(prev => prev.filter(item => item.id !== id));
    };

    // Calculate totals
    const calculateTotals = () => {
        const timeCharges = selectedTimeEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const expenseCharges = selectedExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const flatFeeCharges = manualItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

        const subtotal = timeCharges + expenseCharges + flatFeeCharges;

        const discountAmount = formData.discount_type === 'percentage'
            ? (subtotal * (parseFloat(formData.discount_value) || 0) / 100)
            : (parseFloat(formData.discount_value) || 0);

        const taxableAmount = subtotal - discountAmount;

        const cgstRate = parseFloat(formData.cgst_rate) || 0;
        const sgstRate = parseFloat(formData.sgst_rate) || 0;
        const igstRate = parseFloat(formData.igst_rate) || 0;

        const cgstAmount = taxableAmount * cgstRate / 100;
        const sgstAmount = taxableAmount * sgstRate / 100;
        const igstAmount = taxableAmount * igstRate / 100;

        const total = taxableAmount + cgstAmount + sgstAmount + igstAmount;

        return {
            timeCharges,
            expenseCharges,
            flatFeeCharges,
            subtotal,
            discountAmount,
            taxableAmount,
            cgstAmount,
            sgstAmount,
            igstAmount,
            total
        };
    };

    const totals = calculateTotals();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.client_id) {
            toast.error('Please select a client');
            return;
        }

        if (selectedTimeEntries.length === 0 && selectedExpenses.length === 0 && manualItems.length === 0) {
            toast.error('Please add at least one item to the invoice');
            return;
        }

        try {
            setSaving(true);

            // Build items array
            const items = [
                ...selectedTimeEntries.map(e => ({
                    item_type: 'time',
                    description: e.description,
                    quantity: e.hours,
                    rate: e.hourly_rate,
                    amount: e.amount,
                    time_entry_id: e.id
                })),
                ...selectedExpenses.map(e => ({
                    item_type: 'expense',
                    description: e.description,
                    quantity: e.quantity || 1,
                    rate: e.unit_price || e.amount,
                    amount: e.amount,
                    expense_id: e.id
                })),
                ...manualItems.map(i => ({
                    item_type: i.item_type,
                    description: i.description,
                    quantity: i.quantity,
                    rate: i.rate,
                    amount: i.amount
                }))
            ];

            const payload = {
                ...formData,
                items
            };

            if (isEditing) {
                await apiClient.put(`/legal-billing/invoices/${id}`, payload);
                toast.success('Invoice updated successfully');
            } else {
                await apiClient.post('/legal-billing/invoices', payload);
                toast.success('Invoice created successfully');
            }

            navigate('/legal-invoices');
        } catch (error) {
            console.error('Save invoice error:', error);
            toast.error(error.response?.data?.error || 'Failed to save invoice');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${(parseFloat(amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="card p-6 space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <ProHeader
                title={isEditing ? 'Edit Invoice' : 'Create Invoice'}
                subtitle={isEditing ? 'Modify invoice details' : 'Generate a new invoice for a client'}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Invoices', to: '/legal-invoices' },
                    { label: isEditing ? 'Edit' : 'New' }
                ]}
                actions={
                    <Link to="/legal-invoices" className="btn-secondary flex items-center gap-2">
                        <FiArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                }
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client & Case Selection */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Client & Case</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Client <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="client_id"
                                value={formData.client_id}
                                onChange={handleChange}
                                className="input"
                                required
                            >
                                <option value="">Select Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Case (Optional)
                            </label>
                            <select
                                name="case_id"
                                value={formData.case_id}
                                onChange={handleChange}
                                className="input"
                                disabled={!formData.client_id}
                            >
                                <option value="">No specific case</option>
                                {cases.map(c => (
                                    <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Invoice Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Invoice Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="invoice_date"
                                value={formData.invoice_date}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Billing Period Start
                            </label>
                            <input
                                type="date"
                                name="billing_period_start"
                                value={formData.billing_period_start}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Billing Period End
                            </label>
                            <input
                                type="date"
                                name="billing_period_end"
                                value={formData.billing_period_end}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Unbilled Time Entries */}
                {formData.case_id && unbilledTimeEntries.length > 0 && (
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiClock className="w-5 h-5 text-indigo-600" />
                            Unbilled Time Entries
                        </h3>
                        <div className="space-y-2">
                            {unbilledTimeEntries.map(entry => (
                                <label
                                    key={entry.id}
                                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${selectedTimeEntries.find(e => e.id === entry.id)
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!selectedTimeEntries.find(e => e.id === entry.id)}
                                        onChange={() => toggleTimeEntry(entry)}
                                        className="rounded border-slate-300"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {entry.description}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(entry.entry_date).toLocaleDateString()} • {entry.hours}h @ {formatCurrency(entry.hourly_rate)}/hr
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {formatCurrency(entry.amount)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Unbilled Expenses */}
                {formData.case_id && unbilledExpenses.length > 0 && (
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiDollarSign className="w-5 h-5 text-amber-600" />
                            Unbilled Expenses
                        </h3>
                        <div className="space-y-2">
                            {unbilledExpenses.map(expense => (
                                <label
                                    key={expense.id}
                                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${selectedExpenses.find(e => e.id === expense.id)
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!selectedExpenses.find(e => e.id === expense.id)}
                                        onChange={() => toggleExpense(expense)}
                                        className="rounded border-slate-300"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {expense.description}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(expense.expense_date).toLocaleDateString()} • {expense.category}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {formatCurrency(expense.amount)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Manual Items */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiFileText className="w-5 h-5 text-emerald-600" />
                            Additional Items
                        </h3>
                        <button
                            type="button"
                            onClick={addManualItem}
                            className="btn-secondary text-sm flex items-center gap-1"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    {manualItems.length === 0 ? (
                        <p className="text-slate-500 text-sm">No additional items added. Click "Add Item" to add flat fees, adjustments, etc.</p>
                    ) : (
                        <div className="space-y-3">
                            {manualItems.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => updateManualItem(item.id, 'description', e.target.value)}
                                                className="input text-sm"
                                            />
                                        </div>
                                        <div>
                                            <select
                                                value={item.item_type}
                                                onChange={(e) => updateManualItem(item.id, 'item_type', e.target.value)}
                                                className="input text-sm"
                                            >
                                                <option value="flat_fee">Flat Fee</option>
                                                <option value="retainer">Retainer</option>
                                                <option value="adjustment">Adjustment</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => updateManualItem(item.id, 'quantity', e.target.value)}
                                                className="input text-sm w-16"
                                                min="1"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Rate"
                                                value={item.rate}
                                                onChange={(e) => updateManualItem(item.id, 'rate', e.target.value)}
                                                className="input text-sm flex-1"
                                                min="0"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {formatCurrency(item.amount)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeManualItem(item.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Discount & Taxes */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Discount & Taxes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Discount Type
                            </label>
                            <select
                                name="discount_type"
                                value={formData.discount_type}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="amount">Fixed Amount</option>
                                <option value="percentage">Percentage</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Discount {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                            </label>
                            <input
                                type="number"
                                name="discount_value"
                                value={formData.discount_value}
                                onChange={handleChange}
                                className="input"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                CGST (%)
                            </label>
                            <input
                                type="number"
                                name="cgst_rate"
                                value={formData.cgst_rate}
                                onChange={handleChange}
                                className="input"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                SGST (%)
                            </label>
                            <input
                                type="number"
                                name="sgst_rate"
                                value={formData.sgst_rate}
                                onChange={handleChange}
                                className="input"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                        <FiPercent className="inline w-4 h-4 mr-1" />
                        For inter-state billing, set CGST and SGST to 0 and use IGST instead.
                    </div>
                </div>

                {/* Notes */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notes & Terms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Payment Terms
                            </label>
                            <input
                                type="text"
                                name="payment_terms"
                                value={formData.payment_terms}
                                onChange={handleChange}
                                className="input"
                                placeholder="e.g., Net 30 days"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Notes (appears on invoice)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="input"
                                rows={3}
                                placeholder="Any additional notes..."
                            />
                        </div>
                    </div>
                </div>

                {/* Totals Summary */}
                <div className="card p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Invoice Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Time Charges</span>
                            <span className="font-medium">{formatCurrency(totals.timeCharges)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Expense Charges</span>
                            <span className="font-medium">{formatCurrency(totals.expenseCharges)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Other Charges</span>
                            <span className="font-medium">{formatCurrency(totals.flatFeeCharges)}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                            </div>
                        </div>
                        {totals.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>Discount</span>
                                <span>-{formatCurrency(totals.discountAmount)}</span>
                            </div>
                        )}
                        {totals.cgstAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">CGST ({formData.cgst_rate}%)</span>
                                <span className="font-medium">{formatCurrency(totals.cgstAmount)}</span>
                            </div>
                        )}
                        {totals.sgstAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">SGST ({formData.sgst_rate}%)</span>
                                <span className="font-medium">{formatCurrency(totals.sgstAmount)}</span>
                            </div>
                        )}
                        <div className="border-t border-slate-300 dark:border-slate-600 pt-3 mt-3">
                            <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                                <span>Total</span>
                                <span>{formatCurrency(totals.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                    <Link to="/legal-invoices" className="btn-secondary">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiFileText className="w-4 h-4" />
                                {isEditing ? 'Update Invoice' : 'Create Invoice'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
