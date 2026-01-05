import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { usersAPI, activitiesAPI } from '../../api';

export default function EmployeeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Form state for editing
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        department: '',
        position: '',
        status: 'active',
        bio: ''
    });

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    useEffect(() => {
        if (employee) {
            setFormData({
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                phone: employee.phone || '',
                department: employee.department || '',
                position: employee.position || '',
                status: employee.status || 'active',
                bio: employee.bio || ''
            });
        }
    }, [employee]);

    const fetchEmployee = async () => {
        try {
            const [userResponse, activitiesResponse] = await Promise.all([
                usersAPI.getById(id),
                activitiesAPI.getByEntity('user', id).catch(() => ({ data: [] }))
            ]);

            setEmployee(userResponse.data || null);
            const userActivities = (activitiesResponse.data || []).slice(0, 5);
            setActivities(userActivities);
        } catch (error) {
            console.error('Failed to fetch employee:', error);
            setEmployee(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEmployee = async () => {
        if (!formData.firstName) {
            toast.error('First name is required');
            return;
        }

        setIsSaving(true);
        try {
            await usersAPI.update(id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                department: formData.department,
                position: formData.position,
                status: formData.status,
                bio: formData.bio,
                role: employee.role
            });
            toast.success('Employee updated successfully');
            setShowEditModal(false);
            fetchEmployee();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update employee');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPassword = async () => {
        setIsResetting(true);
        try {
            // Create a new password by calling the create endpoint with special flag
            const response = await usersAPI.resetPassword(id);
            toast.success(response.message || 'New password sent to employee email');
            setShowResetPasswordModal(false);
        } catch (error) {
            // Fallback: If resetPassword API doesn't exist, show manual instruction
            if (error.response?.status === 404) {
                toast.error('Password reset not available. Please update password manually in database.');
            } else {
                toast.error(error.response?.data?.error || 'Failed to reset password');
            }
        } finally {
            setIsResetting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse"></div>
                <div className="card p-6 space-y-4">
                    <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="empty-state">
                <h3 className="empty-state-title">Employee not found</h3>
                <Link to="/employees" className="btn-primary mt-4">Back to Employees</Link>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const styles = { active: 'badge-success', inactive: 'badge-gray', on_leave: 'badge-warning' };
        const labels = { active: 'Active', inactive: 'Inactive', on_leave: 'On Leave' };
        return <span className={styles[status] || 'badge-gray'}>{labels[status] || status || 'Active'}</span>;
    };

    const displayName = employee.firstName ? `${employee.firstName} ${employee.lastName || ''}`.trim() : employee.name || 'Unknown';
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/employees" className="btn-ghost p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="flex-1">
                    <h1 className="page-title">{displayName}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{employee.position || employee.role || '-'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowResetPasswordModal(true)}
                        className="btn-ghost text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Reset Password
                    </button>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="btn-primary"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="card p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold mb-4">
                            {initials}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {displayName}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{employee.position || employee.role || '-'}</p>
                        <div className="mt-2">{getStatusBadge(employee.status)}</div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{employee.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{employee.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-sm text-slate-700 dark:text-slate-300">{employee.department || '-'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                {employee.created_at ? `Joined ${new Date(employee.created_at).toLocaleDateString()}` : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Activity & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">About</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {employee.bio || 'No bio available.'}
                        </p>
                    </div>

                    {/* Recent Activity */}
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {activities.length > 0 ? (
                                activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{activity.description || activity.type}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : '-'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Employee"
                footer={
                    <>
                        <button onClick={() => setShowEditModal(false)} className="btn-secondary" disabled={isSaving}>
                            Cancel
                        </button>
                        <button onClick={handleSaveEmployee} className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                className="input"
                                value={formData.firstName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="label">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                className="input"
                                value={formData.lastName}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input bg-slate-100 dark:bg-slate-800"
                            value={employee.email}
                            disabled
                        />
                        <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                        <label className="label">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            className="input"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Department</label>
                            <select
                                name="department"
                                className="select"
                                value={formData.department}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Department</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Support">Support</option>
                                <option value="Development">Development</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Position</label>
                            <input
                                type="text"
                                name="position"
                                className="input"
                                value={formData.position}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select
                            name="status"
                            className="select"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_leave">On Leave</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Bio</label>
                        <textarea
                            name="bio"
                            className="input min-h-[80px]"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Brief description about the employee..."
                        />
                    </div>
                </div>
            </Modal>

            {/* Reset Password Confirmation Modal */}
            <ConfirmModal
                isOpen={showResetPasswordModal}
                onClose={() => setShowResetPasswordModal(false)}
                onConfirm={handleResetPassword}
                title="Reset Password"
                message={`Are you sure you want to reset the password for ${displayName}? A new password will be generated and sent to their email address (${employee.email}).`}
                confirmText={isResetting ? 'Resetting...' : 'Reset Password'}
                cancelText="Cancel"
                variant="warning"
            />
        </div>
    );
}

