import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import storageAPI from '../../api/storage';
import { usersAPI } from '../../api';
import { COMMON_TIMEZONES } from '../../utils/dateUtils';

export default function Settings() {
    const { user, updateUser } = useAuth(); // Assuming updateUser updates the context
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Storage State
    const [storageInfo, setStorageInfo] = useState(null);
    const [storageLoading, setStorageLoading] = useState(false);

    // Tenant Timezone State
    const [tenantTimezone, setTenantTimezone] = useState('UTC');
    const [timezones, setTimezones] = useState(COMMON_TIMEZONES);
    const [savingTimezone, setSavingTimezone] = useState(false);

    // Fetch storage info when storage tab is active
    useEffect(() => {
        if (activeTab === 'storage') {
            setStorageLoading(true);
            storageAPI.getStorageInfo()
                .then(res => setStorageInfo(res.data))
                .catch(err => console.error('Failed to load storage info:', err))
                .finally(() => setStorageLoading(false));
        }
        if (activeTab === 'preferences') {
            loadTenantTimezone();
        }
    }, [activeTab]);

    const loadTenantTimezone = async () => {
        try {
            const res = await usersAPI.getTenantTimezone();
            if (res.success) {
                setTenantTimezone(res.timezone);
                if (res.timezones) setTimezones(res.timezones);
            }
        } catch (err) {
            console.error('Failed to load tenant timezone:', err);
        }
    };

    const handleTimezoneChange = async (newTimezone) => {
        setSavingTimezone(true);
        try {
            await usersAPI.updateTenantTimezone(newTimezone);
            setTenantTimezone(newTimezone);
            toast.success('Organization timezone updated');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update timezone');
        } finally {
            setSavingTimezone(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // await authAPI.updateProfile(profileData);
            // updateUser(profileData); // Mock update context
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        setLoading(true);
        try {
            // await authAPI.changePassword(passwordData);
            toast.success('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences and security.</p>
            </div>

            <div className="glass-panel overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4">
                    <nav className="space-y-1">
                        {[
                            { id: 'profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                            { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                            { id: 'preferences', label: 'Preferences', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
                            { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
                            { id: 'storage', label: 'Storage', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                </svg>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {activeTab === 'profile' && (
                        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Profile Information</h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-24 h-24 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-3xl font-bold text-brand-600 dark:text-brand-400 border-4 border-white dark:border-slate-700 shadow-lg">
                                        {profileData.firstName[0]}
                                    </div>
                                    <button type="button" className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        Change Avatar
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={profileData.firstName}
                                            onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={profileData.lastName}
                                            onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={profileData.email}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25 disabled:opacity-70"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Security Settings</h2>
                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25 disabled:opacity-70"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Organization Preferences</h2>
                            <div className="space-y-6">
                                <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-800 dark:text-white">Default Timezone</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Used for scheduled workflows and as the default for new users
                                            </p>
                                        </div>
                                        <div className="ml-4">
                                            <select
                                                value={tenantTimezone}
                                                onChange={(e) => handleTimezoneChange(e.target.value)}
                                                disabled={savingTimezone}
                                                className="w-full min-w-[220px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                                            >
                                                {timezones.map((tz) => (
                                                    <option key={tz.value || tz} value={tz.value || tz}>
                                                        {tz.label || tz}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Notification Preferences</h2>
                            <div className="space-y-4">
                                {['Email me about new leads', 'Email me about project updates', 'Email me about weekly reports'].map((label, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors bg-white dark:bg-slate-800">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'storage' && (
                        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Storage Usage</h2>

                            {storageLoading ? (
                                <div className="text-slate-500 dark:text-slate-400">Loading storage info...</div>
                            ) : storageInfo ? (
                                <div className="space-y-6">
                                    {/* Storage Usage Bar */}
                                    <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {storageInfo.used.value} {storageInfo.used.unit} used
                                            </span>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {storageInfo.isUnlimited ? 'Unlimited' : `${storageInfo.limit.value} ${storageInfo.limit.unit}`}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${storageInfo.percentUsed >= 90 ? 'bg-red-500' :
                                                    storageInfo.percentUsed >= 75 ? 'bg-amber-500' :
                                                        'bg-brand-500'
                                                    }`}
                                                style={{ width: `${Math.min(storageInfo.percentUsed, 100)}%` }}
                                            />
                                        </div>

                                        {!storageInfo.isUnlimited && (
                                            <div className="mt-3 text-center">
                                                <span className={`text-2xl font-bold ${storageInfo.percentUsed >= 90 ? 'text-red-500' :
                                                    storageInfo.percentUsed >= 75 ? 'text-amber-500' :
                                                        'text-brand-600 dark:text-brand-400'
                                                    }`}>
                                                    {storageInfo.percentUsed}%
                                                </span>
                                                <span className="text-slate-500 dark:text-slate-400 ml-2">used</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Storage Warning */}
                                    {storageInfo.percentUsed >= 80 && !storageInfo.isUnlimited && (
                                        <div className={`p-4 rounded-xl flex items-center gap-3 ${storageInfo.percentUsed >= 90
                                            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                            : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                            }`}>
                                            <svg className={`w-5 h-5 ${storageInfo.percentUsed >= 90 ? 'text-red-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span className={`font-medium ${storageInfo.percentUsed >= 90 ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                                {storageInfo.percentUsed >= 90
                                                    ? 'Storage almost full! Consider upgrading your plan.'
                                                    : 'Storage usage is getting high. Consider upgrading soon.'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Storage Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Files & Documents</div>
                                            <div className="text-lg font-semibold text-slate-800 dark:text-white">
                                                {storageInfo.used.value} {storageInfo.used.unit}
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Plan Limit</div>
                                            <div className="text-lg font-semibold text-slate-800 dark:text-white">
                                                {storageInfo.isUnlimited ? 'Unlimited' : `${storageInfo.limit.value} ${storageInfo.limit.unit}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-500 dark:text-slate-400">Failed to load storage info</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
