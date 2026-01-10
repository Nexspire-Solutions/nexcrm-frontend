import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import Modal from '../../../components/common/Modal';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import {
    FiArrowLeft, FiPackage, FiTruck, FiUser, FiMapPin, FiPhone, FiMail,
    FiCreditCard, FiCalendar, FiEdit2, FiCheckCircle, FiXCircle, FiClock,
    FiFileText, FiShoppingBag, FiDollarSign
} from 'react-icons/fi';

const statusVariants = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'indigo',
    shipped: 'purple',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'gray'
};

const paymentVariants = {
    pending: 'warning',
    paid: 'success',
    partial: 'info',
    refunded: 'purple',
    failed: 'error'
};

const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [internalNotes, setInternalNotes] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/orders/${id}`);
            setOrder(response.data.data);
            setNewStatus(response.data.data?.status || 'pending');
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            const payload = { status: newStatus };
            if (trackingNumber) payload.tracking_number = trackingNumber;
            if (internalNotes) payload.internal_notes = internalNotes;

            await apiClient.patch(`/orders/${id}/status`, payload);
            toast.success('Order status updated');
            setShowStatusModal(false);
            setTrackingNumber('');
            setInternalNotes('');
            fetchOrder();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handlePaymentUpdate = async (paymentStatus) => {
        try {
            await apiClient.patch(`/orders/${id}/payment`, { payment_status: paymentStatus });
            toast.success('Payment status updated');
            setShowPaymentModal(false);
            fetchOrder();
        } catch (error) {
            toast.error('Failed to update payment');
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${(parseFloat(amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    // Parse shipping address from JSON if needed
    const getShippingAddress = () => {
        if (order?.shipping_address && typeof order.shipping_address === 'object') {
            return order.shipping_address;
        }
        if (order?.shippingAddress) {
            try {
                return typeof order.shippingAddress === 'string'
                    ? JSON.parse(order.shippingAddress)
                    : order.shippingAddress;
            } catch {
                return {};
            }
        }
        return {
            address: order?.shipping_address,
            city: order?.shipping_city,
            state: order?.shipping_state,
            zip: order?.shipping_pincode
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <FiPackage size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Order not found</h2>
                <Link to="/ecommerce/orders" className="text-primary hover:underline mt-2 inline-block">
                    Back to Orders
                </Link>
            </div>
        );
    }

    const shippingAddr = getShippingAddress();
    const currentStatusIndex = statusFlow.indexOf(order.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/ecommerce/orders')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Order #{order.order_number || order.orderNumber}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Placed on {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} variant={statusVariants[order.status]} />
                    <button
                        onClick={() => setShowStatusModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                    >
                        <FiEdit2 size={16} />
                        Update Status
                    </button>
                </div>
            </div>

            {/* Status Timeline */}
            <ProCard>
                <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 dark:bg-slate-700" />
                    <div
                        className="absolute left-0 top-5 h-1 bg-primary transition-all"
                        style={{ width: `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%` }}
                    />
                    {statusFlow.map((status, index) => (
                        <div key={status} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStatusIndex
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                                }`}>
                                {index < currentStatusIndex ? (
                                    <FiCheckCircle size={20} />
                                ) : index === currentStatusIndex ? (
                                    <FiClock size={20} />
                                ) : (
                                    <span className="text-sm">{index + 1}</span>
                                )}
                            </div>
                            <span className="mt-2 text-xs font-medium capitalize">{status}</span>
                        </div>
                    ))}
                </div>
            </ProCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <ProCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FiShoppingBag />
                                Order Items
                            </h3>
                            <span className="text-sm text-slate-500">
                                {order.items?.length || 0} item(s)
                            </span>
                        </div>
                        <div className="divide-y dark:divide-slate-700">
                            {(order.items || []).map((item, idx) => (
                                <div key={idx} className="py-4 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                                        {item.image || item.product_images ? (
                                            <img
                                                src={item.image || (JSON.parse(item.product_images || '[]')[0])}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FiPackage className="text-gray-400" size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-slate-900 dark:text-white truncate">
                                            {item.name || item.productName || 'Product'}
                                        </h4>
                                        {item.sku && (
                                            <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                                        )}
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {formatCurrency(item.unit_price || item.price)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {formatCurrency(item.total || (item.unit_price || item.price) * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!order.items || order.items.length === 0) && (
                                <div className="py-8 text-center text-slate-500">
                                    <FiPackage size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No items found</p>
                                </div>
                            )}
                        </div>

                        {/* Order Totals */}
                        <div className="mt-4 pt-4 border-t dark:border-slate-700 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Tax</span>
                                <span>{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Shipping</span>
                                <span>{formatCurrency(order.shipping_cost || order.shipping || 0)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold pt-2 border-t dark:border-slate-700">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </ProCard>

                    {/* Notes */}
                    {(order.notes || order.internal_notes) && (
                        <ProCard>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <FiFileText />
                                Notes
                            </h3>
                            {order.notes && (
                                <div className="mb-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Customer Notes</p>
                                    <p className="text-slate-700 dark:text-slate-300">{order.notes}</p>
                                </div>
                            )}
                            {order.internal_notes && (
                                <div>
                                    <p className="text-xs text-slate-500 uppercase mb-1">Internal Notes</p>
                                    <pre className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-sans">
                                        {order.internal_notes}
                                    </pre>
                                </div>
                            )}
                        </ProCard>
                    )}
                </div>

                {/* Right Column - Customer & Payment Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <ProCard>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <FiUser />
                            Customer
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <FiUser className="text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {order.shipping_name || order.guest_name || order.client_name || 'Guest'}
                                    </p>
                                    {order.clientId && (
                                        <p className="text-xs text-slate-500">Customer ID: {order.clientId}</p>
                                    )}
                                </div>
                            </div>
                            {(order.guest_email || order.client_email) && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <FiMail size={14} />
                                    <span>{order.guest_email || order.client_email}</span>
                                </div>
                            )}
                            {(order.guest_phone || order.shipping_phone) && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <FiPhone size={14} />
                                    <span>{order.guest_phone || order.shipping_phone}</span>
                                </div>
                            )}
                        </div>
                    </ProCard>

                    {/* Shipping Address */}
                    <ProCard>
                        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <FiMapPin />
                            Shipping Address
                        </h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            {shippingAddr.address && <p>{shippingAddr.address}</p>}
                            {shippingAddr.apartment && <p>{shippingAddr.apartment}</p>}
                            <p>
                                {[shippingAddr.city, shippingAddr.state, shippingAddr.zip].filter(Boolean).join(', ')}
                            </p>
                            {shippingAddr.country && <p>{shippingAddr.country}</p>}
                        </div>
                    </ProCard>

                    {/* Payment Info */}
                    <ProCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FiCreditCard />
                                Payment
                            </h3>
                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="text-sm text-primary hover:underline"
                            >
                                Update
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Status</span>
                                <StatusBadge
                                    status={order.payment_status || 'pending'}
                                    variant={paymentVariants[order.payment_status] || 'warning'}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Method</span>
                                <span className="text-sm font-medium capitalize">
                                    {order.payment_method || 'COD'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Amount</span>
                                <span className="text-lg font-bold text-primary">
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                        </div>
                    </ProCard>

                    {/* Tracking Info */}
                    {(order.tracking_number || order.shipped_at) && (
                        <ProCard>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <FiTruck />
                                Shipping
                            </h3>
                            <div className="space-y-2 text-sm">
                                {order.tracking_number && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Tracking #</span>
                                        <span className="font-mono">{order.tracking_number}</span>
                                    </div>
                                )}
                                {order.shipped_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Shipped</span>
                                        <span>{formatDate(order.shipped_at)}</span>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Delivered</span>
                                        <span>{formatDate(order.delivered_at)}</span>
                                    </div>
                                )}
                            </div>
                        </ProCard>
                    )}
                </div>
            </div>

            {/* Status Update Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Update Order Status"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">New Status</label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    {newStatus === 'shipped' && (
                        <div>
                            <label className="block text-sm font-medium mb-2">Tracking Number</label>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                placeholder="Enter tracking number"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-2">Internal Notes (Optional)</label>
                        <textarea
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                            placeholder="Add internal notes..."
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowStatusModal(false)}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleStatusUpdate}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Update Status
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Payment Update Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Update Payment Status"
            >
                <div className="grid grid-cols-2 gap-3">
                    {['pending', 'paid', 'partial', 'refunded', 'failed'].map(status => (
                        <button
                            key={status}
                            onClick={() => handlePaymentUpdate(status)}
                            className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 capitalize ${order.payment_status === status ? 'border-primary bg-primary/5' : ''
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
