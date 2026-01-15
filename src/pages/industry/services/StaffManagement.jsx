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
    calendar: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    user: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    star: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    )
};

export default function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        specialization: '',
        bio: '',
        experience_years: 0,
        is_accepting_bookings: true,
        is_active: true,
        assigned_services: []
    });

    useEffect(() => {
        fetchStaff();
        fetchServices();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await apiClient.get('/staff-specialists');
            setStaff(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await apiClient.get('/services', { params: { is_active: true } });
            setServices(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                assigned_services: formData.assigned_services.map(id => ({ service_id: id }))
            };

            if (editingStaff) {
                await apiClient.put(`/staff-specialists/${editingStaff.id}`, payload);
            } else {
                await apiClient.post('/staff-specialists', payload);
            }
            setShowModal(false);
            setEditingStaff(null);
            resetForm();
            fetchStaff();
        } catch (error) {
            console.error('Failed to save staff:', error);
            alert(error.response?.data?.error || 'Failed to save staff');
        }
    };

    const handleEdit = async (member) => {
        try {
            const response = await apiClient.get(`/staff-specialists/${member.id}`);
            const data = response.data?.data || member;

            setEditingStaff(data);
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || '',
                phone: data.phone || '',
                specialization: data.specialization || '',
                bio: data.bio || '',
                experience_years: data.experience_years || 0,
                is_accepting_bookings: data.is_accepting_bookings !== false,
                is_active: data.is_active !== false,
                assigned_services: (data.assigned_services || []).map(s => s.id)
            });
            setShowModal(true);
        } catch (error) {
            console.error('Failed to fetch staff details:', error);
        }
    };

    const handleToggleBookings = async (member) => {
        try {
            await apiClient.put(`/staff-specialists/${member.id}`, {
                is_accepting_bookings: !member.is_accepting_bookings
            });
            fetchStaff();
        } catch (error) {
            console.error('Failed to toggle booking status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            specialization: '',
            bio: '',
            experience_years: 0,
            is_accepting_bookings: true,
            is_active: true,
            assigned_services: []
        });
    };

    const toggleService = (serviceId) => {
        setFormData(prev => ({
            ...prev,
            assigned_services: prev.assigned_services.includes(serviceId)
                ? prev.assigned_services.filter(id => id !== serviceId)
                : [...prev.assigned_services, serviceId]
        }));
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Staff Management"
                subtitle={`${staff.length} team members`}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Services' },
                    { label: 'Staff' }
                ]}
                actions={
                    <button
                        onClick={() => { resetForm(); setEditingStaff(null); setShowModal(true); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        {Icons.plus}
                        Add Staff
                    </button>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <ProCard className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{staff.length}</p>
                    <p className="text-sm text-slate-500">Total Staff</p>
                </ProCard>
                <ProCard className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                        {staff.filter(s => s.is_accepting_bookings).length}
                    </p>
                    <p className="text-sm text-slate-500">Accepting Bookings</p>
                </ProCard>
                <ProCard className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                        {staff.reduce((sum, s) => sum + (s.today_appointments || 0), 0)}
                    </p>
                    <p className="text-sm text-slate-500">Today's Appointments</p>
                </ProCard>
                <ProCard className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                        {staff.reduce((sum, s) => sum + (s.services_count || 0), 0)}
                    </p>
                    <p className="text-sm text-slate-500">Service Assignments</p>
                </ProCard>
            </div>

            {/* Staff Grid */}
            {staff.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            {Icons.user}
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No staff members yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Add your team members to start managing appointments.</p>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            {Icons.plus}
                            Add First Staff Member
                        </button>
                    </div>
                </ProCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.map((member) => (
                        <ProCard key={member.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                {member.profile_image ? (
                                    <img
                                        src={member.profile_image}
                                        alt={member.first_name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                        {member.first_name?.[0]}{member.last_name?.[0]}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                            {member.first_name} {member.last_name}
                                        </h3>
                                        {member.is_active && (
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 truncate">
                                        {member.specialization || 'Staff Member'}
                                    </p>
                                    {member.experience_years > 0 && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {member.experience_years} years experience
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {member.services_count || 0}
                                    </p>
                                    <p className="text-xs text-slate-500">Services</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {member.today_appointments || 0}
                                    </p>
                                    <p className="text-xs text-slate-500">Today</p>
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <StatusBadge
                                    status={member.is_accepting_bookings ? 'Accepting' : 'Not Accepting'}
                                    variant={member.is_accepting_bookings ? 'success' : 'warning'}
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleBookings(member)}
                                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        title={member.is_accepting_bookings ? 'Pause Bookings' : 'Accept Bookings'}
                                    >
                                        {Icons.calendar}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(member)}
                                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        {Icons.edit}
                                    </button>
                                </div>
                            </div>
                        </ProCard>
                    ))}
                </div>
            )}

            {/* Staff Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingStaff(null); }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                                {Icons.close}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Specialization
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="e.g., Hair Stylist"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Experience (years)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.experience_years}
                                        onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    rows={3}
                                    placeholder="Brief bio for profile page"
                                />
                            </div>

                            {/* Service Assignments */}
                            {services.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Assigned Services
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                                        {services.map(service => (
                                            <label
                                                key={service.id}
                                                className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.assigned_services.includes(service.id)}
                                                    onChange={() => toggleService(service.id)}
                                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">{service.name}</span>
                                                <span className="text-xs text-slate-500 ml-auto">₹{service.price}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_accepting_bookings}
                                        onChange={(e) => setFormData({ ...formData, is_accepting_bookings: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Accepting Bookings</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingStaff(null); }}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    {editingStaff ? 'Update Staff' : 'Add Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
