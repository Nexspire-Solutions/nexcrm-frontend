import React, { useState, useEffect } from 'react';
import apiClient, { tenantUtils } from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/**
 * Reviews List Page - Reviews & Ratings Management
 */
const ReviewsList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [stats, setStats] = useState({});
    const mediaBaseUrl = tenantUtils.getMediaBaseUrl();

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [status]);

    const fetchReviews = async () => {
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);

            const response = await apiClient.get(`/reviews?${params}`);
            setReviews(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiClient.get('/reviews/stats');
            setStats(response.data.stats || {});
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleStatusChange = async (reviewId, newStatus) => {
        try {
            await apiClient.patch(`/reviews/${reviewId}/status`, { status: newStatus });
            toast.success('Review status updated');
            fetchReviews();
            fetchStats();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reviews & Ratings</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage product reviews</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total || 0}</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Reviews</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-2xl font-bold text-amber-600">{stats.pending || 0}</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Pending</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-2xl font-bold text-emerald-600">{stats.approved || 0}</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Approved</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-2xl font-bold text-red-600">{stats.flagged || 0}</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Flagged</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-yellow-500">{(stats.avg_rating || 0).toFixed(1)}</p>
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Avg Rating</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="select">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="flagged">Flagged</option>
                </select>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No reviews yet</h3>
                            <p className="text-slate-500">Reviews will appear here when customers leave feedback</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        {/* Product Image */}
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0 overflow-hidden">
                                            {review.product_images?.[0] ? (
                                                <img src={`${mediaBaseUrl}${review.product_images[0]}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{review.product_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex">{renderStars(review.rating)}</div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${review.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    review.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        review.status === 'flagged' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}>
                                                    {review.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {review.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleStatusChange(review.id, 'approved')} className="btn-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                                                    Approve
                                                </button>
                                                <button onClick={() => handleStatusChange(review.id, 'rejected')} className="btn-sm bg-red-100 text-red-700 hover:bg-red-200">
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {review.status !== 'flagged' && (
                                            <button onClick={() => handleStatusChange(review.id, 'flagged')} className="btn-sm bg-amber-100 text-amber-700 hover:bg-amber-200">
                                                Flag
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-medium text-slate-900 dark:text-white">{review.customer_name || 'Anonymous'}</span>
                                        <span className="mx-2">•</span>
                                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                        {review.is_verified_purchase && (
                                            <span className="ml-2 text-emerald-600 inline-flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Verified Purchase
                                            </span>
                                        )}
                                    </p>
                                    {review.title && (
                                        <p className="font-medium text-slate-900 dark:text-white mt-2">{review.title}</p>
                                    )}
                                    <p className="text-slate-600 dark:text-slate-400 mt-1">{review.review}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewsList;
