import React from 'react';

function formatCurrency(amount, symbol) {
    const safeSymbol = symbol && symbol !== 'â‚¹' ? symbol : 'Rs. ';
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

export default function InvoiceDocumentV2({ invoice }) {
    if (!invoice) return null;

    const currencySymbol = (invoice.currency_symbol && invoice.currency_symbol !== 'â‚¹')
        ? invoice.currency_symbol
        : ((invoice.company?.currency_symbol && invoice.company.currency_symbol !== 'â‚¹') ? invoice.company.currency_symbol : 'Rs. ');
    const company = invoice.company || {};
    const client = invoice.client || {};

    return (
        <div className="bg-white text-slate-900 shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-8 sm:p-10 border-b border-slate-200 bg-slate-50/80">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">Invoice</p>
                        <h1 className="text-3xl font-bold tracking-tight">{invoice.invoice_number}</h1>
                        <div className="mt-4 space-y-1 text-sm text-slate-600">
                            <p><span className="font-medium text-slate-900">Issue Date:</span> {formatDate(invoice.invoice_date)}</p>
                            <p><span className="font-medium text-slate-900">Due Date:</span> {formatDate(invoice.due_date)}</p>
                            <p><span className="font-medium text-slate-900">Status:</span> <span className="capitalize">{invoice.status}</span></p>
                            {invoice.source_type && (
                                <p><span className="font-medium text-slate-900">Source:</span> {invoice.source_type.replace(/_/g, ' ')}</p>
                            )}
                        </div>
                    </div>

                    <div className="text-sm md:text-right">
                        <h2 className="text-xl font-semibold">{company.name || 'Company'}</h2>
                        {company.address && <p className="mt-2 whitespace-pre-wrap text-slate-600">{company.address}</p>}
                        {company.email && <p className="mt-2 text-slate-600">{company.email}</p>}
                        {company.phone && <p className="text-slate-600">{company.phone}</p>}
                        {company.gst_number && <p className="mt-2 text-slate-600">GST: {company.gst_number}</p>}
                    </div>
                </div>
            </div>

            <div className="p-8 sm:p-10">
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Bill To</p>
                        <div className="space-y-1 text-sm text-slate-700">
                            <p className="text-lg font-semibold text-slate-900">{client.name || '-'}</p>
                            {client.company && <p>{client.company}</p>}
                            {client.address && <p className="whitespace-pre-wrap">{client.address}</p>}
                            {client.email && <p>{client.email}</p>}
                            {client.phone && <p>{client.phone}</p>}
                            {client.gst_number && <p>GST: {client.gst_number}</p>}
                        </div>
                    </div>

                    <div className="md:text-right">
                        {invoice.title && (
                            <>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Reference</p>
                                <p className="text-lg font-semibold text-slate-900">{invoice.title}</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left">
                                <th className="py-3 pr-4 font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                                <th className="py-3 px-4 font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                                <th className="py-3 px-4 font-semibold text-slate-500 uppercase tracking-wide">Unit</th>
                                <th className="py-3 px-4 font-semibold text-slate-500 uppercase tracking-wide text-right">Rate</th>
                                <th className="py-3 pl-4 font-semibold text-slate-500 uppercase tracking-wide text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(invoice.items || []).map(item => (
                                <tr key={item.id} className="border-b border-slate-100">
                                    <td className="py-4 pr-4 align-top">
                                        <p className="font-medium text-slate-900">{item.description}</p>
                                        {item.item_type && (
                                            <p className="text-xs uppercase tracking-wide text-slate-400 mt-1">{item.item_type.replace(/_/g, ' ')}</p>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 align-top">{item.quantity}</td>
                                    <td className="py-4 px-4 align-top">{item.unit || '-'}</td>
                                    <td className="py-4 px-4 align-top text-right">{formatCurrency(item.unit_price, currencySymbol)}</td>
                                    <td className="py-4 pl-4 align-top text-right font-medium">{formatCurrency(item.line_total, currencySymbol)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-10 flex justify-end">
                    <div className="w-full max-w-sm space-y-3 text-sm">
                        <div className="flex items-center justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span>{formatCurrency(invoice.subtotal, currencySymbol)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                            <span>Discount</span>
                            <span>{formatCurrency(invoice.discount_amount, currencySymbol)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                            <span>Tax ({parseFloat(invoice.tax_rate || 0).toLocaleString('en-IN')}%)</span>
                            <span>{formatCurrency(invoice.tax_amount, currencySymbol)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-base font-semibold text-slate-900">
                            <span>Total</span>
                            <span>{formatCurrency(invoice.total, currencySymbol)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                            <span>Paid</span>
                            <span>{formatCurrency(invoice.amount_paid, currencySymbol)}</span>
                        </div>
                        <div className="flex items-center justify-between text-base font-semibold text-red-600">
                            <span>Balance Due</span>
                            <span>{formatCurrency(invoice.balance_due, currencySymbol)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-200">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Payments</p>
                    {invoice.payments?.length ? (
                        <div className="space-y-3">
                            {invoice.payments.map((payment) => (
                                <div key={payment.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-slate-700">
                                    <div>
                                        <p className="font-medium text-slate-900">{formatDate(payment.payment_date)} | {(payment.payment_method || 'payment').replace(/_/g, ' ')}</p>
                                        {payment.reference_number && <p className="text-slate-500">Ref: {payment.reference_number}</p>}
                                        {payment.notes && <p className="text-slate-500 whitespace-pre-wrap">{payment.notes}</p>}
                                    </div>
                                    <div className="font-semibold text-slate-900">{formatCurrency(payment.amount, currencySymbol)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No payments recorded yet.</p>
                    )}
                </div>

                {invoice.notes && (
                    <div className="mt-10 pt-6 border-t border-slate-200">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">Notes</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
