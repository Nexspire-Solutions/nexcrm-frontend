import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

/**
 * Reports Dashboard - Analytics & Reports
 */
const ReportsPage = () => {
    const [activeReport, setActiveReport] = useState('sales');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchReport();
    }, [activeReport]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange.start_date) params.append('start_date', dateRange.start_date);
            if (dateRange.end_date) params.append('end_date', dateRange.end_date);

            const response = await apiClient.get(`/reports/${activeReport}?${params}`);
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const reports = [
        { id: 'sales', label: 'Sales Report' },
        { id: 'products', label: 'Product Performance' },
        { id: 'customers', label: 'Customer Analytics' },
        { id: 'inventory', label: 'Inventory Report' },
        { id: 'tax', label: 'Tax Report' },
        { id: 'profit-loss', label: 'Profit & Loss' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Business intelligence and insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={dateRange.start_date}
                        onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                        className="input text-sm"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                        type="date"
                        value={dateRange.end_date}
                        onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                        className="input text-sm"
                    />
                    <button onClick={fetchReport} className="btn-primary">Apply</button>
                </div>
            </div>

            {/* Report Tabs */}
            <div className="flex flex-wrap gap-2">
                {reports.map(report => (
                    <button
                        key={report.id}
                        onClick={() => setActiveReport(report.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeReport === report.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        {report.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Sales Report */}
                    {activeReport === 'sales' && data && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <SummaryCard title="Total Orders" value={data.summary?.total_orders || 0} iconType="orders" />
                                <SummaryCard title="Total Revenue" value={`₹${(data.summary?.total_revenue || 0).toLocaleString()}`} iconType="revenue" color="emerald" />
                                <SummaryCard title="Avg Order Value" value={`₹${Math.round(data.summary?.avg_order_value || 0).toLocaleString()}`} iconType="chart" color="blue" />
                                <SummaryCard title="Unique Customers" value={data.summary?.unique_customers || 0} iconType="users" color="purple" />
                            </div>

                            {/* Sales Table */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Sales by Period</h3>
                                </div>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3">Period</th>
                                            <th className="px-6 py-3">Orders</th>
                                            <th className="px-6 py-3">Revenue</th>
                                            <th className="px-6 py-3">Tax</th>
                                            <th className="px-6 py-3">Delivered</th>
                                            <th className="px-6 py-3">Cancelled</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {(data.data || []).slice(0, 30).map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{row.period}</td>
                                                <td className="px-6 py-3">{row.orders}</td>
                                                <td className="px-6 py-3 font-semibold text-emerald-600">₹{row.total?.toLocaleString()}</td>
                                                <td className="px-6 py-3 text-slate-500">₹{row.tax?.toLocaleString()}</td>
                                                <td className="px-6 py-3 text-emerald-600">{row.delivered || 0}</td>
                                                <td className="px-6 py-3 text-red-600">{row.cancelled || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Products Report */}
                    {activeReport === 'products' && data && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Product Performance</h3>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3">SKU</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Units Sold</th>
                                        <th className="px-6 py-3">Revenue</th>
                                        <th className="px-6 py-3">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {(data.data || []).map((product, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{product.name}</td>
                                            <td className="px-6 py-3"><code className="text-xs">{product.sku}</code></td>
                                            <td className="px-6 py-3 text-slate-500">{product.category || '-'}</td>
                                            <td className="px-6 py-3">{product.units_sold || 0}</td>
                                            <td className="px-6 py-3 font-semibold text-emerald-600">₹{(product.revenue || 0).toLocaleString()}</td>
                                            <td className="px-6 py-3">
                                                <span className={product.stock <= 10 ? 'text-red-600' : 'text-slate-600'}>{product.stock}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Customer Report */}
                    {activeReport === 'customers' && data && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <SummaryCard title="New Customers" value={data.data?.breakdown?.new_customers || 0} iconType="add" />
                                <SummaryCard title="Returning Customers" value={data.data?.breakdown?.returning_customers || 0} iconType="refresh" color="blue" />
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Top Customers</h3>
                                </div>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Orders</th>
                                            <th className="px-6 py-3">Total Spent</th>
                                            <th className="px-6 py-3">Last Order</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {(data.data?.topCustomers || []).map((customer, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{customer.name}</td>
                                                <td className="px-6 py-3 text-slate-500">{customer.email}</td>
                                                <td className="px-6 py-3">{customer.total_orders || 0}</td>
                                                <td className="px-6 py-3 font-semibold text-emerald-600">₹{(customer.total_spent || 0).toLocaleString()}</td>
                                                <td className="px-6 py-3 text-slate-500 text-xs">
                                                    {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Inventory Report */}
                    {activeReport === 'inventory' && data && (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                <SummaryCard title="Total Products" value={data.data?.summary?.total_products || 0} iconType="products" />
                                <SummaryCard title="Total Stock" value={data.data?.summary?.total_stock || 0} iconType="chart" color="blue" />
                                <SummaryCard title="Stock Value" value={`₹${(data.data?.summary?.stock_value || 0).toLocaleString()}`} iconType="revenue" color="emerald" />
                                <SummaryCard title="Low Stock" value={data.data?.summary?.low_stock || 0} iconType="warning" color="amber" />
                                <SummaryCard title="Out of Stock" value={data.data?.summary?.out_of_stock || 0} iconType="error" color="red" />
                            </div>

                            {data.data?.lowStockItems?.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Low Stock Items</h3>
                                    </div>
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500">
                                            <tr>
                                                <th className="px-6 py-3">Product</th>
                                                <th className="px-6 py-3">SKU</th>
                                                <th className="px-6 py-3">Category</th>
                                                <th className="px-6 py-3">Current Stock</th>
                                                <th className="px-6 py-3">Threshold</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {data.data.lowStockItems.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                                    <td className="px-6 py-3"><code className="text-xs">{item.sku}</code></td>
                                                    <td className="px-6 py-3 text-slate-500">{item.category || '-'}</td>
                                                    <td className="px-6 py-3">
                                                        <span className="text-red-600 font-semibold">{item.stock}</span>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-500">{item.low_stock_threshold}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {/* Tax Report */}
                    {activeReport === 'tax' && data && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <SummaryCard title="Taxable Amount" value={`₹${(data.summary?.total_taxable || 0).toLocaleString()}`} iconType="document" />
                                <SummaryCard title="Total Tax Collected" value={`₹${(data.summary?.total_tax || 0).toLocaleString()}`} iconType="revenue" color="emerald" />
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Tax by Month</h3>
                                </div>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3">Month</th>
                                            <th className="px-6 py-3">Orders</th>
                                            <th className="px-6 py-3">Taxable Amount</th>
                                            <th className="px-6 py-3">Tax Collected</th>
                                            <th className="px-6 py-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {(data.data || []).map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{row.month}</td>
                                                <td className="px-6 py-3">{row.orders}</td>
                                                <td className="px-6 py-3">₹{(row.taxable_amount || 0).toLocaleString()}</td>
                                                <td className="px-6 py-3 font-semibold text-indigo-600">₹{(row.tax_collected || 0).toLocaleString()}</td>
                                                <td className="px-6 py-3 font-semibold text-emerald-600">₹{(row.total_amount || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Profit & Loss */}
                    {activeReport === 'profit-loss' && data && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Revenue</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Product Sales</span>
                                        <span className="font-semibold text-emerald-600">₹{(data.data?.revenue || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Shipping Revenue</span>
                                        <span className="font-semibold text-emerald-600">₹{(data.data?.shipping_revenue || 0).toLocaleString()}</span>
                                    </div>
                                    <hr className="border-slate-200 dark:border-slate-700" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-900 dark:text-white">Total Revenue</span>
                                        <span className="font-bold text-2xl text-emerald-600">
                                            ₹{((data.data?.revenue || 0) + (data.data?.shipping_revenue || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Expenses</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Refunds</span>
                                        <span className="font-semibold text-red-600">₹{(data.data?.refunds || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600 dark:text-slate-400">Shipping Costs</span>
                                        <span className="font-semibold text-red-600">₹{(data.data?.shipping_costs || 0).toLocaleString()}</span>
                                    </div>
                                    <hr className="border-slate-200 dark:border-slate-700" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-slate-900 dark:text-white">Gross Profit</span>
                                        <span className="font-bold text-2xl text-indigo-600">
                                            ₹{(data.data?.gross_profit || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Summary Card Component with SVG Icons
 */
const SummaryCard = ({ title, value, iconType = 'chart', color = 'indigo' }) => {
    const colors = {
        indigo: 'from-indigo-500 to-indigo-600',
        emerald: 'from-emerald-500 to-emerald-600',
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        amber: 'from-amber-500 to-amber-600',
        red: 'from-red-500 to-red-600'
    };

    const icons = {
        orders: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        revenue: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        chart: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        users: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        add: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
        ),
        refresh: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        products: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        document: (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center`}>
                    {icons[iconType]}
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{title}</p>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
