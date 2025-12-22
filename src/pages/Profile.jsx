import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'user',
    });

    const handleSave = () => {
        // In production, this would call an API
        toast.success('Profile updated successfully');
        setIsEditing(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getRoleLabel = (role) => {
        const labels = {
            admin: 'Administrator',
            manager: 'Manager',
            sales_operator: 'Sales Operator',
            user: 'User'
        };
        return labels[role] || role;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account settings and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

                {/* Avatar and Name */}
                <div className="relative px-6 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                        <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 shadow-lg">
                            {formData.firstName?.[0]}{formData.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {formData.firstName} {formData.lastName}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{getRoleLabel(formData.role)}</p>
                        </div>
                        <div className="sm:mt-0 mt-4">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="input w-full"
                            />
                        ) : (
                            <p className="text-slate-900 dark:text-white">{formData.firstName || '—'}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="input w-full"
                            />
                        ) : (
                            <p className="text-slate-900 dark:text-white">{formData.lastName || '—'}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                        {isEditing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input w-full"
                            />
                        ) : (
                            <p className="text-slate-900 dark:text-white">{formData.email || '—'}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input w-full"
                                placeholder="+1 234 567 8900"
                            />
                        ) : (
                            <p className="text-slate-900 dark:text-white">{formData.phone || '—'}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                        <p className="text-slate-900 dark:text-white">{getRoleLabel(formData.role)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contact an admin to change your role</p>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Security</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Password</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Last changed: Never</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition">
                            Change Password
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">
                            Enable
                        </button>
                    </div>
                </div>
            </div>

            {/* Activity Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Activity</h3>

                <div className="space-y-3">
                    {[
                        { action: 'Logged in', time: 'Today, 9:30 AM', device: 'Chrome on Windows' },
                        { action: 'Updated profile', time: 'Yesterday, 3:45 PM', device: 'Chrome on Windows' },
                        { action: 'Logged in', time: 'Yesterday, 9:00 AM', device: 'Chrome on Windows' },
                    ].map((activity, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">{activity.action}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{activity.device}</p>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
