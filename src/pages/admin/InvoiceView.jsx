import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoicesAPI } from '../../api';
import toast from 'react-hot-toast';

export default function InvoiceView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            setIsLoading(true);
            const response = await invoicesAPI.getById(id.replace('INV-', ''));
            setInvoice(response.invoice);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error('Failed to load invoice');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Invoice Not Found</h3>
                <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Action Bar (Hidden on Print) */}
            <div className="flex justify-between items-center print:hidden bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back
                </button>
                <div className="flex items-center gap-3">
                    <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print / Download PDF
                    </button>
                </div>
            </div>

            {/* The Invoice Document */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none print:m-0">
                {/* Header Tape / Design Element */}
                <div className="h-4 bg-indigo-600 w-full print:bg-indigo-600"></div>

                <div className="p-8 sm:p-12">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between pb-8 border-b border-slate-200">
                        <div>
                            {/* Company Logo/Name Placeholder */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center print:bg-indigo-600">
                                    <span className="text-white font-bold text-xl">NEX</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 m-0">Nexspire Solutions</h1>
                                    <p className="text-slate-500 text-sm">Technology & Services</p>
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 space-y-1">
                                <p>123 Business Avenue, Suite 100</p>
                                <p>Mumbai, Maharashtra 400001, India</p>
                                <p>hello@nexspiresolutions.com</p>
                            </div>
                        </div>

                        <div className="mt-8 sm:mt-0 text-left sm:text-right">
                            <h2 className="text-3xl sm:text-4xl font-light text-slate-800 tracking-wider uppercase mb-4">Invoice</h2>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-medium text-slate-600 mr-2">Invoice Number:</span> <span className="font-semibold text-slate-900">{invoice.id}</span></p>
                                <p><span className="font-medium text-slate-600 mr-2">Date of Issue:</span> <span className="text-slate-900">{new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                                <p><span className="font-medium text-slate-600 mr-2">Due Date:</span> <span className="text-slate-900 font-medium">{new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Billed To */}
                    <div className="py-8">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Billed To</h3>
                        <div className="text-slate-800 space-y-1">
                            {invoice.client.company && <p className="font-bold text-lg">{invoice.client.company}</p>}
                            <p className={!invoice.client.company ? 'font-bold text-lg' : 'font-medium'}>{invoice.client.name}</p>
                            {invoice.client.address && <p className="text-slate-600 whitespace-pre-wrap mt-2">{invoice.client.address}</p>}
                            <p className="text-slate-600 mt-2">{invoice.client.email}</p>
                            {invoice.client.phone && <p className="text-slate-600">{invoice.client.phone}</p>}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mt-8">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-800 text-sm font-semibold text-slate-800">
                                    <th className="py-3 px-2 w-[50%]">Description</th>
                                    <th className="py-3 px-2 text-center">Qty</th>
                                    <th className="py-3 px-2 text-right">Unit Price</th>
                                    <th className="py-3 px-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-200 text-slate-700">
                                        <td className="py-4 px-2">
                                            <p className="font-medium">{item.description}</p>
                                        </td>
                                        <td className="py-4 px-2 text-center">{item.quantity}</td>
                                        <td className="py-4 px-2 text-right">₹{parseFloat(item.unitPrice).toLocaleString()}</td>
                                        <td className="py-4 px-2 text-right font-medium text-slate-900">₹{parseFloat(item.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-8 flex justify-end">
                        <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3">
                            <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100">
                                <span>Subtotal</span>
                                <span>₹{parseFloat(invoice.subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100">
                                <span>Tax (18%)</span>
                                <span>₹{parseFloat(invoice.tax).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl text-slate-900 pt-2">
                                <span>Total Due</span>
                                <span>₹{parseFloat(invoice.total).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Footer */}
                    <div className="mt-16 pt-8 border-t border-slate-200">
                        <div className="text-slate-500 text-sm flex flex-col sm:flex-row justify-between">
                            <div className="mb-4 sm:mb-0 max-w-sm">
                                <h4 className="font-semibold text-slate-700 mb-1">Notes</h4>
                                <p>{invoice.notes}</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <h4 className="font-semibold text-slate-700 mb-1">Payment Instructions</h4>
                                <p>Please make checks payable to Nexspire Solutions.</p>
                                <p>Bank: HDFC Bank, Acct: XXXX-XXXX-XXXX-1234, IFSC: HDFC0000001</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
