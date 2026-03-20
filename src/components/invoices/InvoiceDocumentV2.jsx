import React from 'react';

function formatCurrency(amount, symbol) {
    const safeSymbol = symbol || '\u20B9';
    return `${safeSymbol}${(parseFloat(amount) || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

const printStyles = `
@media print {
    /* Hide everything on the page */
    body, html { margin: 0 !important; padding: 0 !important; background: white !important; overflow: visible !important; height: auto !important; }

    /* Hide all direct children of body and common layout elements */
    aside, header, nav, footer { display: none !important; }

    /* The invoice print area is the only thing shown — handled by global index.css */
}
`;

export default function InvoiceDocumentV2({ invoice }) {
    if (!invoice) return null;

    const currencySymbol = invoice.currency_symbol || invoice.company?.currency_symbol || '\u20B9';
    const company = invoice.company || {};
    const client = invoice.client || {};
    const balanceColor = Number(invoice.balance_due) > 0 ? 'text-red-600 invoice-balance-due' : 'text-emerald-600 invoice-balance-paid';

    return (
        <>
            <style>{printStyles}</style>
            <div className="invoice-print-area">
                <div className="invoice-doc bg-white text-slate-900 shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                    {/* Header band */}
                    <div className="invoice-header-band p-8 sm:p-10" style={{ backgroundColor: '#263B61' }}>
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div>
                                <p className="invoice-header-label text-xs uppercase tracking-[0.25em] mb-2" style={{ color: '#c8cfe0' }}>Invoice</p>
                                <h1 className="text-3xl font-bold tracking-tight text-white">{invoice.invoice_number}</h1>
                            </div>

                            <div className="md:text-right">
                                <h2 className="text-xl font-semibold text-white">{company.name || 'Company'}</h2>
                                {company.address && <p className="invoice-header-label mt-2 whitespace-pre-wrap text-sm" style={{ color: '#c8cfe0' }}>{company.address}</p>}
                                {company.email && <p className="invoice-header-label text-sm" style={{ color: '#c8cfe0' }}>{company.email}</p>}
                                {company.phone && <p className="invoice-header-label text-sm" style={{ color: '#c8cfe0' }}>{company.phone}</p>}
                                {company.gst_number && <p className="invoice-header-label text-sm mt-1" style={{ color: '#c8cfe0' }}>GST: {company.gst_number}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10">
                        {/* Meta row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 pb-8 border-b border-slate-200">
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">Issue Date</p>
                                <p className="text-sm font-semibold text-slate-900">{formatDate(invoice.invoice_date)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">Due Date</p>
                                <p className="text-sm font-semibold text-slate-900">{formatDate(invoice.due_date)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">Status</p>
                                <span className={`invoice-status-badge inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                    invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                                    invoice.status === 'overdue' ? 'bg-red-50 text-red-700' :
                                    invoice.status === 'partial' ? 'bg-amber-50 text-amber-700' :
                                    invoice.status === 'sent' ? 'bg-blue-50 text-blue-700' :
                                    invoice.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                    {invoice.status}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-1">Amount Due</p>
                                <p className={`text-lg font-bold ${balanceColor}`}>
                                    {formatCurrency(invoice.balance_due, currencySymbol)}
                                </p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-10">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-medium mb-3">Bill To</p>
                            <div className="space-y-1 text-sm text-slate-700">
                                <p className="text-base font-semibold text-slate-900">{client.name || '-'}</p>
                                {client.company && <p className="font-medium text-slate-700">{client.company}</p>}
                                {client.address && <p className="whitespace-pre-wrap text-slate-600">{client.address}</p>}
                                <div className="flex gap-6 pt-1">
                                    {client.email && <p className="text-slate-600">{client.email}</p>}
                                    {client.phone && <p className="text-slate-600">{client.phone}</p>}
                                </div>
                                {client.gst_number && <p className="text-slate-500 text-xs mt-1">GST: {client.gst_number}</p>}
                            </div>
                        </div>

                        {/* Items table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="invoice-table-head bg-slate-50 border-y border-slate-200">
                                        <th className="py-3 px-4 text-left font-semibold text-[11px] uppercase tracking-wider text-slate-500">#</th>
                                        <th className="py-3 px-4 text-left font-semibold text-[11px] uppercase tracking-wider text-slate-500">Description</th>
                                        <th className="py-3 px-4 text-center font-semibold text-[11px] uppercase tracking-wider text-slate-500">Qty</th>
                                        <th className="py-3 px-4 text-center font-semibold text-[11px] uppercase tracking-wider text-slate-500">Unit</th>
                                        <th className="py-3 px-4 text-right font-semibold text-[11px] uppercase tracking-wider text-slate-500">Rate</th>
                                        <th className="py-3 px-4 text-right font-semibold text-[11px] uppercase tracking-wider text-slate-500">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(invoice.items || []).map((item, idx) => (
                                        <tr key={item.id || idx} className="border-b border-slate-100">
                                            <td className="py-3.5 px-4 text-slate-400 text-xs">{idx + 1}</td>
                                            <td className="py-3.5 px-4 align-top">
                                                <p className="font-medium text-slate-900">{item.description}</p>
                                            </td>
                                            <td className="py-3.5 px-4 text-center text-slate-700">{item.quantity}</td>
                                            <td className="py-3.5 px-4 text-center text-slate-500">{item.unit || '-'}</td>
                                            <td className="py-3.5 px-4 text-right text-slate-700">{formatCurrency(item.unit_price, currencySymbol)}</td>
                                            <td className="py-3.5 px-4 text-right font-semibold text-slate-900">{formatCurrency(item.line_total, currencySymbol)}</td>
                                        </tr>
                                    ))}
                                    {(!invoice.items || invoice.items.length === 0) && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-400">No items</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="mt-8 flex justify-end">
                            <div className="w-full max-w-xs space-y-2.5 text-sm">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{formatCurrency(invoice.subtotal, currencySymbol)}</span>
                                </div>
                                {Number(invoice.discount_amount) > 0 && (
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span>Discount</span>
                                        <span className="font-medium">- {formatCurrency(invoice.discount_amount, currencySymbol)}</span>
                                    </div>
                                )}
                                {Number(invoice.tax_rate) > 0 && (
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span>Tax ({parseFloat(invoice.tax_rate || 0).toLocaleString('en-IN')}%)</span>
                                        <span className="font-medium">{formatCurrency(invoice.tax_amount, currencySymbol)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between pt-3 border-t-2 border-slate-800 text-base font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>{formatCurrency(invoice.total, currencySymbol)}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Paid</span>
                                    <span className="font-medium text-emerald-600 invoice-paid-text">{formatCurrency(invoice.amount_paid, currencySymbol)}</span>
                                </div>
                                <div className={`flex items-center justify-between pt-2 border-t border-slate-200 text-base font-bold ${balanceColor}`}>
                                    <span>Balance Due</span>
                                    <span>{formatCurrency(invoice.balance_due, currencySymbol)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payments */}
                        <div className="mt-10 pt-6 border-t border-slate-200">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-medium mb-4">Payment History</p>
                            {invoice.payments?.length ? (
                                <div className="space-y-3">
                                    {invoice.payments.map((payment) => (
                                        <div key={payment.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-slate-700 py-2 border-b border-slate-100 last:border-b-0">
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {formatDate(payment.payment_date)}
                                                    <span className="mx-2 text-slate-300">|</span>
                                                    <span className="capitalize text-slate-600">{(payment.payment_method || 'payment').replace(/_/g, ' ')}</span>
                                                </p>
                                                {payment.reference_number && <p className="text-xs text-slate-500 mt-0.5">Ref: {payment.reference_number}</p>}
                                                {payment.notes && <p className="text-xs text-slate-500 whitespace-pre-wrap mt-0.5">{payment.notes}</p>}
                                            </div>
                                            <div className="font-bold text-slate-900">{formatCurrency(payment.amount, currencySymbol)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No payments recorded yet.</p>
                            )}
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-medium mb-3">Notes</p>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-10 pt-4 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400 italic">Thank you for your business.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
