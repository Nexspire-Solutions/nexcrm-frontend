import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEdit2, FiPrinter, FiSend, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../../../api/axios';
import ProHeader from '../../../components/common/ProHeader';
import InvoiceDocument from '../../../components/invoices/InvoiceDocumentV2';
import Modal from '../../../components/common/Modal';
import ConfirmModal from '../../../components/common/ConfirmModal';

const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'upi', label: 'UPI' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'other', label: 'Other' },
];

const emptyPaymentForm = {
    amount: '',
    payment_method: 'bank_transfer',
    reference_number: '',
    notes: '',
    payment_date: new Date().toISOString().split('T')[0],
};

export default function ManufacturingInvoiceView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    // Payment modal state (shared for record + edit)
    const [paymentModal, setPaymentModal] = useState({ open: false, mode: 'record', paymentId: null, form: emptyPaymentForm, submitting: false });

    // Confirm modal state (shared for delete payment + delete invoice)
    const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/invoices/records/${id}`);
            setInvoice(response.data.data);
        } catch (error) {
            console.error('Failed to load invoice:', error);
            toast.error('Invoice not found');
            navigate('/manufacturing-invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const markAsSent = async () => {
        try {
            await apiClient.put(`/invoices/records/${id}/status`, { status: 'sent' });
            toast.success('Invoice marked as sent');
            fetchInvoice();
        } catch (error) {
            console.error('Failed to mark invoice as sent:', error);
            toast.error('Failed to update invoice');
        }
    };

    // ── Payment Modal helpers ──────────────────────────────────────────────

    const openRecordPayment = () => {
        setPaymentModal({
            open: true,
            mode: 'record',
            paymentId: null,
            form: { ...emptyPaymentForm, amount: invoice?.balance_due || invoice?.total || '' },
            submitting: false,
        });
    };

    const openEditPayment = (payment) => {
        setPaymentModal({
            open: true,
            mode: 'edit',
            paymentId: payment.id,
            form: {
                amount: payment.amount || '',
                payment_method: payment.payment_method || 'bank_transfer',
                reference_number: payment.reference_number || '',
                notes: payment.notes || '',
                payment_date: payment.payment_date
                    ? String(payment.payment_date).split('T')[0]
                    : new Date().toISOString().split('T')[0],
            },
            submitting: false,
        });
    };

    const closePaymentModal = () => {
        setPaymentModal(prev => ({ ...prev, open: false }));
    };

    const handlePaymentFormChange = (e) => {
        const { name, value } = e.target;
        setPaymentModal(prev => ({ ...prev, form: { ...prev.form, [name]: value } }));
    };

    const handlePaymentSubmit = async () => {
        const { mode, paymentId, form } = paymentModal;
        const amount = Number(form.amount);
        if (!form.amount || isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid payment amount.');
            return;
        }
        if (!form.payment_date) {
            toast.error('Please enter a payment date.');
            return;
        }

        setPaymentModal(prev => ({ ...prev, submitting: true }));
        const payload = {
            amount,
            payment_date: form.payment_date,
            payment_method: form.payment_method || 'bank_transfer',
            reference_number: form.reference_number,
            notes: form.notes,
        };

        try {
            if (mode === 'record') {
                await apiClient.post(`/invoices/records/${id}/payments`, payload);
                toast.success('Payment recorded');
            } else {
                await apiClient.put(`/invoices/records/${id}/payments/${paymentId}`, payload);
                toast.success('Payment updated');
            }
            closePaymentModal();
            fetchInvoice();
        } catch (error) {
            console.error('Failed to save payment:', error);
            toast.error(error.response?.data?.error || 'Failed to save payment');
            setPaymentModal(prev => ({ ...prev, submitting: false }));
        }
    };

    // ── Confirm modal helpers ──────────────────────────────────────────────

    const confirmDeletePayment = (payment) => {
        setConfirmModal({
            open: true,
            title: 'Delete Payment',
            message: `Delete payment of ${formatMoney(payment.amount)}? This cannot be undone.`,
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/invoices/records/${id}/payments/${payment.id}`);
                    toast.success('Payment deleted');
                    fetchInvoice();
                } catch (error) {
                    console.error('Failed to delete payment:', error);
                    toast.error(error.response?.data?.error || 'Failed to delete payment');
                }
            },
        });
    };

    const confirmDeleteInvoice = () => {
        setConfirmModal({
            open: true,
            title: 'Delete Invoice',
            message: 'Permanently delete this invoice? This cannot be undone.',
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/invoices/records/${id}`);
                    toast.success('Invoice deleted');
                    navigate('/manufacturing-invoices');
                } catch (error) {
                    console.error('Failed to delete invoice:', error);
                    toast.error(error.response?.data?.error || 'Failed to delete invoice');
                }
            },
        });
    };

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, open: false }));

    // ── Utilities ──────────────────────────────────────────────────────────

    const formatMoney = (amount, symbol = invoice?.currency_symbol || 'Rs. ') => (
        `${symbol}${(parseFloat(amount) || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`
    );

    const downloadPdf = async () => {
        try {
            const response = await apiClient.get(`/invoices/records/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `${invoice?.invoice_number || `invoice-${id}`}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download invoice PDF:', error);
            toast.error('Failed to download PDF');
        }
    };

    const handlePrint = () => {
        const printArea = document.querySelector('.invoice-print-area');
        if (!printArea) { window.print(); return; }

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) { window.print(); return; }

        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map(el => el.outerHTML)
            .join('\n');

        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>${invoice?.invoice_number || 'Invoice'}</title>
    ${styles}
    <style>
        body { margin: 0; padding: 20px; background: white; }
        .invoice-doc { box-shadow: none; border: none; border-radius: 12px; max-width: 900px; margin: 0 auto; }
        .invoice-header-band { background-color: #263B61 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .invoice-header-band * { color: white !important; }
        .invoice-header-band .invoice-header-label { color: #c8cfe0 !important; }
        .invoice-table-head { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .invoice-balance-due { color: #dc2626 !important; }
        .invoice-balance-paid { color: #16a34a !important; }
        .invoice-paid-text { color: #16a34a !important; }
        @media print {
            body { padding: 0; }
            .invoice-doc { border-radius: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
    </style>
</head>
<body>
    ${printArea.innerHTML}
</body>
</html>`);
        printWindow.document.close();
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 300);
        };
    };

    // ── Render ─────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-56 animate-pulse mb-6" />
                <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!invoice) return null;

    return (
        <div className="p-6 max-w-6xl mx-auto print:p-0">
            <ProHeader
                title={invoice.invoice_number}
                subtitle="Printable manufacturing invoice"
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Manufacturing', to: '/production' },
                    { label: 'Invoices', to: '/manufacturing-invoices' },
                    { label: invoice.invoice_number }
                ]}
                actions={
                    <div className="flex gap-2 print:hidden">
                        <Link to="/manufacturing-invoices" className="btn-secondary flex items-center gap-2">
                            <FiArrowLeft className="w-4 h-4" />
                            Back
                        </Link>
                        <Link to={`/manufacturing-invoices/${id}/edit`} className="btn-secondary flex items-center gap-2">
                            <FiEdit2 className="w-4 h-4" />
                            Edit
                        </Link>
                        {invoice.status === 'draft' && (
                            <button onClick={markAsSent} className="btn-secondary flex items-center gap-2">
                                <FiSend className="w-4 h-4" />
                                Mark Sent
                            </button>
                        )}
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <button onClick={openRecordPayment} className="btn-secondary flex items-center gap-2">
                                Record Payment
                            </button>
                        )}
                        <button onClick={confirmDeleteInvoice} className="btn-secondary flex items-center gap-2 text-red-600">
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                        </button>
                        <button onClick={downloadPdf} className="btn-secondary flex items-center gap-2">
                            <FiDownload className="w-4 h-4" />
                            PDF
                        </button>
                        <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                            <FiPrinter className="w-4 h-4" />
                            Print
                        </button>
                    </div>
                }
            />

            <InvoiceDocument invoice={invoice} />

            <div className="card mt-6 p-5 print:hidden">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Payment Ledger</h2>
                        <p className="text-sm text-slate-500">Every payment recorded against this invoice.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Collected</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {formatMoney(invoice.amount_paid)}
                        </p>
                    </div>
                </div>

                {invoice.payments?.length ? (
                    <div className="space-y-3">
                        {invoice.payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col md:flex-row md:items-center gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {formatMoney(payment.amount)}
                                        </span>
                                        <span className="text-sm text-slate-500">
                                            {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 capitalize">
                                            {String(payment.payment_method || 'payment').replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    {payment.reference_number && (
                                        <p className="text-sm text-slate-500 mt-1">Ref: {payment.reference_number}</p>
                                    )}
                                    {payment.notes && (
                                        <p className="text-sm text-slate-500 mt-1">{payment.notes}</p>
                                    )}
                                    {payment.created_by_name && (
                                        <p className="text-xs text-slate-400 mt-1">Recorded by {payment.created_by_name}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditPayment(payment)}
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDeletePayment(payment)}
                                        className="btn-secondary flex items-center gap-2 text-red-600"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-slate-500">
                        No payment entries recorded yet.
                    </div>
                )}
            </div>

            {/* ── Record / Edit Payment Modal ───────────────────────────────── */}
            <Modal
                isOpen={paymentModal.open}
                onClose={closePaymentModal}
                title={paymentModal.mode === 'record' ? 'Record Payment' : 'Edit Payment'}
                footer={
                    <>
                        <button
                            onClick={closePaymentModal}
                            disabled={paymentModal.submitting}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePaymentSubmit}
                            disabled={paymentModal.submitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {paymentModal.submitting
                                ? 'Saving...'
                                : paymentModal.mode === 'record' ? 'Record Payment' : 'Save Changes'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={paymentModal.form.amount}
                            onChange={handlePaymentFormChange}
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            autoFocus
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Payment Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Payment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="payment_date"
                            value={paymentModal.form.payment_date}
                            onChange={handlePaymentFormChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Payment Method
                        </label>
                        <select
                            name="payment_method"
                            value={paymentModal.form.payment_method}
                            onChange={handlePaymentFormChange}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {PAYMENT_METHODS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reference Number */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Reference Number
                        </label>
                        <input
                            type="text"
                            name="reference_number"
                            value={paymentModal.form.reference_number}
                            onChange={handlePaymentFormChange}
                            placeholder="Transaction / cheque number"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={paymentModal.form.notes}
                            onChange={handlePaymentFormChange}
                            rows={3}
                            placeholder="Optional payment notes"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                    </div>
                </div>
            </Modal>

            {/* ── Confirm Delete Modal ──────────────────────────────────────── */}
            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
