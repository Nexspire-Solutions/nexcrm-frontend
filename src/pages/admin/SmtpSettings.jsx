import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { smtpAPI } from '../../api';

export default function SmtpSettings() {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        display_name: '',
        daily_limit: 500,
        hourly_limit: 50,
        is_default: false
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await smtpAPI.getAll();
            setAccounts(res.data || []);
        } catch (error) {
            console.error('Failed to fetch SMTP accounts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            host: '',
            port: 587,
            secure: false,
            username: '',
            password: '',
            display_name: '',
            daily_limit: 500,
            hourly_limit: 50,
            is_default: false
        });
        setEditingAccount(null);
    };

    const handleTest = async () => {
        if (!formData.host || !formData.username || !formData.password) {
            toast.error('Host, username, and password are required');
            return;
        }
        setTesting(true);
        try {
            const res = await smtpAPI.test({
                host: formData.host,
                port: formData.port,
                secure: formData.secure,
                username: formData.username,
                password: formData.password
            });
            toast.success(res.message || 'Connection successful!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Connection failed');
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        if (!formData.host || !formData.username || !formData.password) {
            toast.error('Host, username, and password are required');
            return;
        }
        setSaving(true);
        try {
            if (editingAccount) {
                await smtpAPI.update(editingAccount.id, formData);
                toast.success('Account updated');
            } else {
                await smtpAPI.create(formData);
                toast.success('Account added');
            }
            setShowModal(false);
            resetForm();
            fetchAccounts();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (account) => {
        setFormData({
            name: account.name || '',
            host: account.host || '',
            port: account.port || 587,
            secure: account.secure || false,
            username: account.username || '',
            password: '', // Don't prefill password
            display_name: account.display_name || '',
            daily_limit: account.daily_limit || 500,
            hourly_limit: account.hourly_limit || 50,
            is_default: account.is_default || false
        });
        setEditingAccount(account);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId) {
            try {
                await smtpAPI.delete(deleteTargetId);
                toast.success('Account deleted');
                fetchAccounts();
            } catch (error) {
                toast.error('Failed to delete');
            }
            setDeleteTargetId(null);
        }
    };

    // Common SMTP presets
    const presets = [
        { name: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false },
        { name: 'GoDaddy', host: 'smtpout.secureserver.net', port: 465, secure: true },
        { name: 'Outlook', host: 'smtp.office365.com', port: 587, secure: false },
        { name: 'Zoho', host: 'smtp.zoho.com', port: 587, secure: false },
        { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, secure: false },
        { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587, secure: false },
    ];

    const applyPreset = (preset) => {
        setFormData(prev => ({
            ...prev,
            name: preset.name,
            host: preset.host,
            port: preset.port,
            secure: preset.secure
        }));
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="card p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">SMTP Settings</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Configure email accounts for sending campaigns
                    </p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Account
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium mb-1">Multiple accounts recommended</p>
                        <p className="text-blue-600 dark:text-blue-400">Add multiple SMTP accounts to rotate between them and avoid hitting daily limits. The system automatically switches when one account reaches its limit.</p>
                    </div>
                </div>
            </div>

            {/* Accounts List */}
            <div className="card overflow-hidden">
                {accounts.length === 0 ? (
                    <div className="p-8 text-center">
                        <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400 mb-2">No SMTP accounts configured</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">Add your email accounts to start sending campaigns</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Server</th>
                                <th>Daily Limit</th>
                                <th>Today's Usage</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(account => (
                                <tr key={account.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{account.name || account.username}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{account.username}</p>
                                            </div>
                                            {account.is_default && (
                                                <span className="badge-primary text-xs">Default</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-sm text-slate-600 dark:text-slate-400">
                                        {account.host}:{account.port}
                                        {account.secure && (
                                            <svg className="w-4 h-4 inline ml-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="SSL/TLS">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        )}
                                    </td>
                                    <td className="text-slate-600 dark:text-slate-400">
                                        {account.daily_limit}/day
                                        <span className="text-xs text-slate-400 ml-1">({account.hourly_limit}/hr)</span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    style={{ width: `${Math.min((account.usage_today / account.daily_limit) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {account.usage_today || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={account.is_active ? 'badge-success' : 'badge-gray'}>
                                            {account.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleEdit(account)} className="btn-ghost btn-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(account.id)} className="btn-ghost btn-sm text-red-500 hover:text-red-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title={editingAccount ? 'Edit SMTP Account' : 'Add SMTP Account'}
                size="lg"
                footer={
                    <>
                        <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary" disabled={saving}>
                            Cancel
                        </button>
                        <button onClick={handleTest} className="btn-secondary" disabled={testing || saving}>
                            {testing ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button onClick={handleSave} className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (editingAccount ? 'Update' : 'Add Account')}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Quick Presets */}
                    <div>
                        <label className="label">Quick Presets</label>
                        <div className="flex flex-wrap gap-2">
                            {presets.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => applyPreset(preset)}
                                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Account Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Marketing Email"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Display Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Your Store Name"
                                value={formData.display_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="label">SMTP Host *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="smtp.gmail.com"
                                value={formData.host}
                                onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Port</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.port}
                                onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Username/Email *</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="label">Password *</label>
                            <input
                                type="password"
                                className="input"
                                placeholder={editingAccount ? '(leave blank to keep)' : 'App password'}
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Daily Limit</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.daily_limit}
                                onChange={(e) => setFormData(prev => ({ ...prev, daily_limit: parseInt(e.target.value) || 500 }))}
                            />
                        </div>
                        <div>
                            <label className="label">Hourly Limit</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.hourly_limit}
                                onChange={(e) => setFormData(prev => ({ ...prev, hourly_limit: parseInt(e.target.value) || 50 }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.secure}
                                onChange={(e) => setFormData(prev => ({ ...prev, secure: e.target.checked }))}
                                className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Use SSL/TLS (port 465)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_default}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                                className="w-4 h-4 text-indigo-600 rounded"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Set as default</span>
                        </label>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete SMTP Account"
                message="Are you sure you want to delete this email account? This cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}
