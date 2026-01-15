import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

// Icons
const Icons = {
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    edit: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    card: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    check: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
};

export default function MembershipPlans() {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration_months: 1,
        discount_percent: 0,
        benefits: [''],
        max_bookings_per_month: '',
        priority_booking: false,
        is_active: true
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await apiClient.get('/membership-plans');
            setPlans(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                benefits: formData.benefits.filter(b => b.trim()),
                max_bookings_per_month: formData.max_bookings_per_month || null
            };

            if (editingPlan) {
                await apiClient.put(`/membership-plans/${editingPlan.id}`, payload);
            } else {
                await apiClient.post('/membership-plans', payload);
            }
            setShowModal(false);
            setEditingPlan(null);
            resetForm();
            fetchPlans();
        } catch (error) {
            console.error('Failed to save plan:', error);
            alert(error.response?.data?.error || 'Failed to save plan');
        }
    };

    const handleEdit = async (plan) => {
        try {
            const response = await apiClient.get(`/membership-plans/${plan.id}`);
            const data = response.data?.data || plan;

            setEditingPlan(data);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                price: data.price || '',
                duration_months: data.duration_months || 1,
                discount_percent: data.discount_percent || 0,
                benefits: Array.isArray(data.benefits) ? [...data.benefits, ''] : [''],
                max_bookings_per_month: data.max_bookings_per_month || '',
                priority_booking: data.priority_booking || false,
                is_active: data.is_active !== false
            });
            setShowModal(true);
        } catch (error) {
            console.error('Failed to fetch plan:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            duration_months: 1,
            discount_percent: 0,
            benefits: [''],
            max_bookings_per_month: '',
            priority_booking: false,
            is_active: true
        });
    };

    const updateBenefit = (index, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        // Add empty field at end if typing in last field
        if (index === newBenefits.length - 1 && value) {
            newBenefits.push('');
        }
        setFormData({ ...formData, benefits: newBenefits });
    };

    const removeBenefit = (index) => {
        if (formData.benefits.length > 1) {
            setFormData({
                ...formData,
                benefits: formData.benefits.filter((_, i) => i !== index)
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Membership Plans"
                subtitle={`${plans.length} plans available`}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Services' },
                    { label: 'Memberships' }
                ]}
                actions={
                    <button
                        onClick={() => { resetForm(); setEditingPlan(null); setShowModal(true); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        {Icons.plus}
                        Create Plan
                    </button>
                }
            />

            {plans.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            {Icons.card}
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No membership plans</h3>
                        <p className="text-slate-500 dark:text-slate-400">Create subscription plans for your clients.</p>
                    </div>
                </ProCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const benefits = typeof plan.benefits === 'string'
                            ? JSON.parse(plan.benefits || '[]')
                            : (plan.benefits || []);

                        return (
                            <div
                                key={plan.id}
                                className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 overflow-hidden ${plan.is_featured ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                {plan.is_featured && (
                                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                                        Popular
                                    </div>
                                )}

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{plan.description || 'No description'}</p>

                                    <div className="mb-6">
                                        <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                                            ₹{parseFloat(plan.price || 0).toLocaleString()}
                                        </span>
                                        <span className="text-slate-500">/{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</span>
                                    </div>

                                    {plan.discount_percent > 0 && (
                                        <div className="mb-4 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full inline-block">
                                            {plan.discount_percent}% off all services
                                        </div>
                                    )}

                                    <div className="space-y-2 mb-6">
                                        {benefits.slice(0, 5).map((benefit, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <span className="text-green-500">{Icons.check}</span>
                                                {benefit}
                                            </div>
                                        ))}
                                        {plan.max_bookings_per_month && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <span className="text-green-500">{Icons.check}</span>
                                                {plan.max_bookings_per_month} bookings/month
                                            </div>
                                        )}
                                        {plan.priority_booking && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <span className="text-green-500">{Icons.check}</span>
                                                Priority booking access
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-sm text-slate-500">
                                            {plan.active_members || 0} active members
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge
                                                status={plan.is_active ? 'Active' : 'Inactive'}
                                                variant={plan.is_active ? 'success' : 'warning'}
                                            />
                                            <button
                                                onClick={() => handleEdit(plan)}
                                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                                            >
                                                {Icons.edit}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Plan Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingPlan ? 'Edit Plan' : 'Create Plan'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingPlan(null); }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                                {Icons.close}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Plan Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    placeholder="e.g., Premium Membership"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Duration (months)
                                    </label>
                                    <select
                                        value={formData.duration_months}
                                        onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    >
                                        <option value={1}>1 Month</option>
                                        <option value={3}>3 Months</option>
                                        <option value={6}>6 Months</option>
                                        <option value={12}>12 Months</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Discount %
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discount_percent}
                                        onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Max Bookings/Month
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_bookings_per_month}
                                        onChange={(e) => setFormData({ ...formData, max_bookings_per_month: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        min="1"
                                        placeholder="Unlimited"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Benefits
                                </label>
                                {formData.benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={benefit}
                                            onChange={(e) => updateBenefit(idx, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                            placeholder="e.g., Free monthly facial"
                                        />
                                        {formData.benefits.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeBenefit(idx)}
                                                className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                {Icons.close}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.priority_booking}
                                        onChange={(e) => setFormData({ ...formData, priority_booking: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Priority Booking</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Active</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingPlan(null); }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
