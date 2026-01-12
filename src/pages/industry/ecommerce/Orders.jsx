import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import StatusBadge from '../../../components/common/StatusBadge';
import ProCard from '../../../components/common/ProCard';
import Modal from '../../../components/common/Modal';
import apiClient, { tenantUtils } from '../../../api/axios';
import toast from 'react-hot-toast';

const statusVariants = {
    pending: 'warning',
    processing: 'info',
    shipped: 'indigo',
    delivered: 'success',
    cancelled: 'error'
};

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
];

const paymentOptions = [
    { value: '', label: 'All Payments' },
    { value: 'pending', label: 'Payment Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' }
];

const dateOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
];

export default function OrderList() {
    const [viewMode, setViewMode] = useState('list');
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [draggingOrder, setDraggingOrder] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const navigate = useNavigate();

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/orders');
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Client-side filtering for immediate response
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(order =>
                order.order_number?.toLowerCase().includes(query) ||
                order.shipping_name?.toLowerCase().includes(query) ||
                order.shipping_email?.toLowerCase().includes(query) ||
                order.shipping_phone?.includes(query)
            );
        }

        // Status filter
        if (statusFilter) {
            result = result.filter(order => order.status === statusFilter);
        }

        // Payment filter
        if (paymentFilter) {
            result = result.filter(order => order.payment_status === paymentFilter);
        }

        // Date filter
        if (dateFilter) {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            result = result.filter(order => {
                const orderDate = new Date(order.created_at);
                switch (dateFilter) {
                    case 'today':
                        return orderDate >= startOfDay;
                    case 'week':
                        const startOfWeek = new Date(startOfDay);
                        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                        return orderDate >= startOfWeek;
                    case 'month':
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        return orderDate >= startOfMonth;
                    case 'quarter':
                        const quarter = Math.floor(now.getMonth() / 3);
                        const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
                        return orderDate >= startOfQuarter;
                    default:
                        return true;
                }
            });
        }

        return result;
    }, [orders, searchQuery, statusFilter, paymentFilter, dateFilter]);

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setPaymentFilter('');
        setDateFilter('');
    };

    const hasActiveFilters = searchQuery || statusFilter || paymentFilter || dateFilter;

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
            // Update local state immediately for better UX
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
            toast.success(`Order moved to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update order status:', error);
            toast.error('Failed to update order status');
            // Refetch orders to restore correct state
            fetchOrders();
        }
    };

    const handleDragStart = (e, order) => {
        setDraggingOrder(order);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', order.id);
        // Add a slight delay to show the dragging effect
        setTimeout(() => {
            e.target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggingOrder(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, status) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(status);
    };

    const handleDragLeave = (e) => {
        // Only clear if leaving the column entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverColumn(null);
        }
    };

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (draggingOrder && draggingOrder.status !== newStatus) {
            updateOrderStatus(draggingOrder.id, newStatus);
        }
        setDraggingOrder(null);
    };

    const columns = [
        { header: 'Order ID', accessor: 'order_number', className: 'font-medium text-slate-900 dark:text-white', render: (row) => row.order_number || row.orderNumber || '-' },
        { header: 'Customer', accessor: 'guest_name', render: (row) => row.guest_name || row.shipping_name || row.client_name || 'Guest' },
        { header: 'Date', accessor: 'created_at', className: 'text-slate-500', render: (row) => new Date(row.created_at).toLocaleDateString() },
        { header: 'Items', accessor: 'items', align: 'right', render: (row) => row.items?.length || row.item_count || '-' },
        { header: 'Amount', accessor: 'total', align: 'right', className: 'font-medium', render: (row) => `₹${(row.total || 0).toLocaleString()}` },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => <StatusBadge status={row.status} variant={statusVariants[row.status]} />
        },
        {
            header: '',
            align: 'right',
            render: (row) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${row.id}`);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-xs"
                >
                    View
                </button>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Orders"
                subtitle="Manage and track customer orders"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'E-Commerce' }, { label: 'Orders' }]}
                actions={
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                        >
                            Kanban
                        </button>
                    </div>
                }
            />

            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by order ID, customer name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {/* Payment Filter */}
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {paymentOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {/* Date Filter */}
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {dateOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Results count */}
                {hasActiveFilters && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-medium text-slate-700 dark:text-slate-300">{filteredOrders.length}</span> of{' '}
                            <span className="font-medium text-slate-700 dark:text-slate-300">{orders.length}</span> orders
                        </p>
                    </div>
                )}
            </div>

            {filteredOrders.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">
                            {hasActiveFilters ? 'No orders match your filters' : 'No orders found'}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                </ProCard>
            ) : viewMode === 'list' ? (
                <ProCard noPadding>
                    <ProTable
                        columns={columns}
                        data={filteredOrders}
                        onRowClick={(row) => setSelectedOrder(row)}
                    />
                </ProCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {['pending', 'processing', 'shipped', 'delivered'].map(status => (
                        <div
                            key={status}
                            onDragOver={(e) => handleDragOver(e, status)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status)}
                            className={`bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border-2 min-h-[500px] transition-all duration-200 ${dragOverColumn === status
                                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg'
                                : 'border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-4 flex justify-between items-center">
                                {status}
                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-0.5 px-2 rounded-full text-xs">
                                    {filteredOrders.filter(o => o.status === status).length}
                                </span>
                            </h3>
                            <div className="space-y-3">
                                {filteredOrders.filter(o => o.status === status).map(order => (
                                    <div
                                        key={order.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, order)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => !draggingOrder && setSelectedOrder(order)}
                                        className={`bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all duration-200 ${draggingOrder?.id === order.id ? 'opacity-50 scale-95' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium text-slate-900 dark:text-white text-sm">{order.order_number}</span>
                                            <span className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{order.shipping_name}</p>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                                            <span className="text-xs text-slate-500">{order.items?.length || 0} Items</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">₹{(order.total || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {filteredOrders.filter(o => o.status === status).length === 0 && (
                                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        {hasActiveFilters ? 'No matching orders' : 'Drop orders here'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}

/**
 * Order Detail Modal - Enhanced with items list, payment breakdown, and tabs
 */
const OrderDetailModal = ({ order: initialOrder, onClose }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [fullOrder, setFullOrder] = useState(initialOrder);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/orders/${initialOrder.id}`);
                setFullOrder(response.data.data);
            } catch (error) {
                console.error('Failed to fetch order details:', error);
                toast.error('Failed to load full order details');
            } finally {
                setLoading(false);
            }
        };

        if (initialOrder.id) {
            fetchOrderDetails();
        }
    }, [initialOrder.id]);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
            shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };

    const getPaymentColor = (status) => {
        const colors = {
            paid: 'bg-emerald-100 text-emerald-800',
            pending: 'bg-amber-100 text-amber-800',
            failed: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-slate-100 text-slate-800';
    };

    // Parse shipping address from JSON if needed
    const getShippingAddress = (orderData) => {
        // If shipping_address is a JSON string, parse it
        if (orderData?.shipping_address && typeof orderData.shipping_address === 'string') {
            try {
                const parsed = JSON.parse(orderData.shipping_address);
                return parsed;
            } catch {
                // Not JSON, treat as plain text address
                return {
                    address: orderData.shipping_address,
                    city: orderData?.shipping_city,
                    state: orderData?.shipping_state,
                    zip: orderData?.shipping_pincode
                };
            }
        }
        // If already an object
        if (orderData?.shipping_address && typeof orderData.shipping_address === 'object') {
            return orderData.shipping_address;
        }
        // Fallback for camelCase
        if (orderData?.shippingAddress) {
            try {
                return typeof orderData.shippingAddress === 'string'
                    ? JSON.parse(orderData.shippingAddress)
                    : orderData.shippingAddress;
            } catch {
                return {};
            }
        }
        // Build from individual fields
        return {
            address: orderData?.shipping_address,
            city: orderData?.shipping_city,
            state: orderData?.shipping_state,
            zip: orderData?.shipping_pincode
        };
    };

    const shippingAddr = getShippingAddress(fullOrder);

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'items', label: `Items (${fullOrder.items?.length || 0})` },
        { id: 'shipping', label: 'Shipping' }
    ];

    if (loading) {
        return (
            <Modal isOpen={true} onClose={onClose} title="Loading Order...">
                <div className="flex items-center justify-center p-12">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <span>Order {fullOrder.order_number || fullOrder.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fullOrder.status)}`}>
                        {fullOrder.status}
                    </span>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 -mx-6 px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Order Date</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {new Date(fullOrder.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Payment Status</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(fullOrder.payment_status)}`}>
                                    {fullOrder.payment_status || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Customer
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2">
                                <p className="font-medium text-slate-900 dark:text-white">{fullOrder.shipping_name || fullOrder.client_name || 'Guest'}</p>
                                {fullOrder.shipping_phone && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{fullOrder.shipping_phone}</p>
                                )}
                                {fullOrder.shipping_email && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{fullOrder.shipping_email}</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Breakdown */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Payment Breakdown
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                                    <span className="text-slate-900 dark:text-white">₹{(fullOrder.subtotal || fullOrder.total || 0).toLocaleString()}</span>
                                </div>
                                {Number(fullOrder.discount) > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount {fullOrder.coupon_code ? `(${fullOrder.coupon_code})` : ''}</span>
                                        <span>-₹{Number(fullOrder.discount).toLocaleString()}</span>
                                    </div>
                                )}
                                {fullOrder.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Tax</span>
                                        <span className="text-slate-900 dark:text-white">₹{fullOrder.tax.toLocaleString()}</span>
                                    </div>
                                )}
                                {(Number(fullOrder.shipping_cost) > 0 || Number(fullOrder.shipping) > 0) && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                                        <span className="text-slate-900 dark:text-white">₹{(Number(fullOrder.shipping_cost) || Number(fullOrder.shipping) || 0).toLocaleString()}</span>
                                    </div>
                                )}
                                <hr className="border-slate-200 dark:border-slate-700 my-2" />
                                <div className="flex justify-between font-semibold text-base">
                                    <span className="text-slate-900 dark:text-white">Total</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">₹{(fullOrder.total || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {fullOrder.notes && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Notes</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                    {fullOrder.notes}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Items Tab */}
                {activeTab === 'items' && (
                    <div className="space-y-3">
                        {fullOrder.items?.length > 0 ? (
                            fullOrder.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {(() => {
                                            // Try to get image from various sources
                                            let imgSrc = null;
                                            if (item.image) {
                                                imgSrc = item.image;
                                            } else if (item.product_images) {
                                                // Handle both array and JSON string
                                                try {
                                                    const images = typeof item.product_images === 'string'
                                                        ? JSON.parse(item.product_images || '[]')
                                                        : item.product_images;
                                                    if (Array.isArray(images) && images.length > 0) {
                                                        imgSrc = images[0];
                                                    }
                                                } catch (e) {
                                                    console.warn('Failed to parse product images:', e);
                                                }
                                            }

                                            if (imgSrc) {
                                                // Use tenantUtils to get base URL
                                                const baseUrl = tenantUtils.getMediaBaseUrl();
                                                const fullSrc = imgSrc.startsWith('http') ? imgSrc : `${baseUrl}${imgSrc}`;
                                                return (
                                                    <img
                                                        src={fullSrc}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>'; }}
                                                    />
                                                );
                                            }

                                            return (
                                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">
                                            {item.current_product_name || item.product_name || item.name || item.productName || 'Product Item'}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {item.variant && `${item.variant} • `}Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-indigo-600 dark:text-indigo-400">₹{(item.total || (item.unit_price * item.quantity)).toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">₹{item.unit_price || item.price} × {item.quantity}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p>No items in this order</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Shipping Tab */}
                {activeTab === 'shipping' && (
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Shipping Address
                            </h3>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-1 text-sm">
                                {shippingAddr?.address ? (
                                    <>
                                        <p className="font-medium text-slate-900 dark:text-white">{fullOrder.shipping_name}</p>
                                        <p className="text-slate-600 dark:text-slate-400">{shippingAddr.address}</p>
                                        {shippingAddr.apartment && <p className="text-slate-600 dark:text-slate-400">{shippingAddr.apartment}</p>}
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {[shippingAddr.city, shippingAddr.state, shippingAddr.zip].filter(Boolean).join(', ')}
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-400">Phone: {fullOrder.shipping_phone}</p>
                                    </>
                                ) : (
                                    <p className="italic text-slate-400">No shipping address provided</p>
                                )}
                            </div>
                        </div>

                        {/* Tracking Info */}
                        {fullOrder.tracking_number && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                    </svg>
                                    Tracking
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <code className="text-sm bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                            {fullOrder.tracking_number}
                                        </code>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(fullOrder.tracking_number); }}
                                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shipping Provider */}
                        {fullOrder.shipping_provider && (
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Shipping Provider</p>
                                <p className="font-medium text-slate-900 dark:text-white">{fullOrder.shipping_provider}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
