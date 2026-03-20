import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEdit2, FiPrinter, FiSend, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../../../api/axios';
import ProHeader from '../../../components/common/ProHeader';
import InvoiceDocument from '../../../components/invoices/InvoiceDocumentV2';

export default function ManufacturingInvoiceView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const recordPayment = async () => {
        const amount = window.prompt('Payment amount', invoice?.balance_due || invoice?.total || 0);
        if (amount === null) return;
        const paymentMethod = window.prompt('Payment method', 'bank_transfer');
        if (paymentMethod === null) return;
        const referenceNumber = window.prompt('Reference number', '') ?? '';
        const notes = window.prompt('Payment notes', '') ?? '';
        const paymentDate = window.prompt('Payment date (YYYY-MM-DD)', new Date().toISOString().split('T')[0]);
        if (paymentDate === null) return;

        try {
            await apiClient.post(`/invoices/records/${id}/payments`, {
                amount: Number(amount || 0),
                payment_date: paymentDate,
                payment_method: paymentMethod || 'bank_transfer',
                reference_number: referenceNumber,
                notes
            });
            toast.success('Payment recorded');
            fetchInvoice();
        } catch (error) {
            console.error('Failed to record invoice payment:', error);
            toast.error(error.response?.data?.error || 'Failed to record payment');
        }
    };

    const editPayment = async (payment) => {
        const amount = window.prompt('Payment amount', payment.amount || 0);
        if (amount === null) return;
        const paymentMethod = window.prompt('Payment method', payment.payment_method || 'bank_transfer');
        if (paymentMethod === null) return;
        const referenceNumber = window.prompt('Reference number', payment.reference_number || '') ?? '';
        const notes = window.prompt('Payment notes', payment.notes || '') ?? '';
        const paymentDate = window.prompt('Payment date (YYYY-MM-DD)', payment.payment_date || new Date().toISOString().split('T')[0]);
        if (paymentDate === null) return;

        try {
            await apiClient.put(`/invoices/records/${id}/payments/${payment.id}`, {
                amount: Number(amount || 0),
                payment_date: paymentDate,
                payment_method: paymentMethod || 'bank_transfer',
                reference_number: referenceNumber,
                notes
            });
            toast.success('Payment updated');
            fetchInvoice();
        } catch (error) {
            console.error('Failed to update invoice payment:', error);
            toast.error(error.response?.data?.error || 'Failed to update payment');
        }
    };

    const deletePayment = async (payment) => {
        if (!window.confirm(`Delete payment of ${payment.amount}?`)) return;

        try {
            await apiClient.delete(`/invoices/records/${id}/payments/${payment.id}`);
            toast.success('Payment deleted');
            fetchInvoice();
        } catch (error) {
            console.error('Failed to delete invoice payment:', error);
            toast.error(error.response?.data?.error || 'Failed to delete payment');
        }
    };

    const formatMoney = (amount, symbol = invoice?.currency_symbol || 'Rs. ') => (
        `${symbol}${(parseFloat(amount) || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`
    );

    const deleteInvoice = async () => {
        if (!window.confirm('Delete this invoice?')) return;

        try {
            await apiClient.delete(`/invoices/records/${id}`);
            toast.success('Invoice deleted');
            navigate('/manufacturing-invoices');
        } catch (error) {
            console.error('Failed to delete invoice:', error);
            toast.error(error.response?.data?.error || 'Failed to delete invoice');
        }
    };

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

        // Collect all stylesheets from the current page
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
                            <button onClick={recordPayment} className="btn-secondary flex items-center gap-2">
                                Record Payment
                            </button>
                        )}
                        <button onClick={deleteInvoice} className="btn-secondary flex items-center gap-2 text-red-600">
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
                                        onClick={() => editPayment(payment)}
                                        className="btn-secondary flex items-center gap-2"
                                    >
                                        <FiEdit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deletePayment(payment)}
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
        </div>
    );
}
