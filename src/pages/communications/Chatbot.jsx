import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { chatbotAPI } from '../../api';

export default function Chatbot() {
    const [responses, setResponses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState({
        enabled: true,
        welcomeMessage: 'Hi there! I\'m your virtual assistant. How can I help you today?',
        fallbackMessage: 'I\'m sorry, I didn\'t understand that. Would you like to speak with a human agent?',
        businessHoursOnly: false,
        collectLeadInfo: true
    });
    const [showModal, setShowModal] = useState(false);
    const [editingResponse, setEditingResponse] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [responsesRes, settingsRes] = await Promise.all([
                chatbotAPI.getResponses().catch(() => ({ data: [] })),
                chatbotAPI.getSettings().catch(() => ({ data: {} }))
            ]);
            setResponses(responsesRes.data || []);
            if (settingsRes.data) {
                setSettings(prev => ({
                    ...prev,
                    enabled: settingsRes.data.enabled ?? true,
                    welcomeMessage: settingsRes.data.welcome_message || prev.welcomeMessage,
                    fallbackMessage: settingsRes.data.fallback_message || prev.fallbackMessage,
                    businessHoursOnly: settingsRes.data.business_hours_only ?? false,
                    collectLeadInfo: settingsRes.data.collect_lead_info ?? true
                }));
            }
        } catch (error) {
            console.error('Failed to fetch chatbot data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchResponses = () => fetchData();

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId) {
            try {
                await chatbotAPI.deleteResponse(deleteTargetId);
                toast.success('Response deleted');
                fetchResponses();
            } catch (error) {
                toast.error('Failed to delete response');
            }
            setDeleteTargetId(null);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await chatbotAPI.updateSettings({
                enabled: settings.enabled,
                welcome_message: settings.welcomeMessage,
                fallback_message: settings.fallbackMessage,
                business_hours_only: settings.businessHoursOnly,
                collect_lead_info: settings.collectLeadInfo
            });
            toast.success('Settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Chatbot Configuration</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Configure automated responses and chatbot settings
                    </p>
                </div>
                <button onClick={handleSaveSettings} className="btn-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="card p-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Chatbot Status</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Enable Chatbot</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Activate chatbot on your website</p>
                            </div>
                            <button
                                onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                                className={`relative w-12 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${settings.enabled ? 'left-6' : 'left-0.5'}`}></span>
                            </button>
                        </div>
                    </div>

                    {/* General Settings */}
                    <div className="card p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">General Settings</h3>

                        <div>
                            <label className="label">Welcome Message</label>
                            <textarea
                                value={settings.welcomeMessage}
                                onChange={(e) => setSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                                className="input min-h-20"
                            />
                        </div>

                        <div>
                            <label className="label">Fallback Message</label>
                            <textarea
                                value={settings.fallbackMessage}
                                onChange={(e) => setSettings(prev => ({ ...prev, fallbackMessage: e.target.value }))}
                                className="input min-h-20"
                            />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-slate-700 dark:text-slate-300">Business hours only</span>
                            <input
                                type="checkbox"
                                checked={settings.businessHoursOnly}
                                onChange={(e) => setSettings(prev => ({ ...prev, businessHoursOnly: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                            />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-slate-700 dark:text-slate-300">Collect lead information</span>
                            <input
                                type="checkbox"
                                checked={settings.collectLeadInfo}
                                onChange={(e) => setSettings(prev => ({ ...prev, collectLeadInfo: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Responses */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Automated Responses</h3>
                            <button onClick={() => { setEditingResponse(null); setShowModal(true); }} className="btn-primary btn-sm">
                                Add Response
                            </button>
                        </div>

                        {responses.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <p className="text-slate-500 dark:text-slate-400">No automated responses configured</p>
                                <p className="text-sm text-slate-400 mt-1">Add responses to automate common queries</p>
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Trigger</th>
                                        <th>Response</th>
                                        <th>Category</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {responses.map(response => (
                                        <tr key={response.id}>
                                            <td>
                                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{response.trigger}</code>
                                            </td>
                                            <td className="max-w-xs truncate text-slate-600 dark:text-slate-400">{response.response}</td>
                                            <td><span className="badge-gray">{response.category}</span></td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => { setEditingResponse(response); setShowModal(true); }} className="btn-ghost btn-sm">Edit</button>
                                                    <button onClick={() => handleDelete(response.id)} className="btn-ghost btn-sm text-red-600">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Response Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingResponse ? 'Edit Response' : 'Add Response'}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                        <button onClick={() => { setShowModal(false); toast.success('Response saved'); }} className="btn-primary">Save</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">Trigger Keyword</label>
                        <input type="text" className="input" defaultValue={editingResponse?.trigger} placeholder="e.g., pricing" />
                    </div>
                    <div>
                        <label className="label">Category</label>
                        <select className="select" defaultValue={editingResponse?.category || 'Sales'}>
                            <option value="Greeting">Greeting</option>
                            <option value="Sales">Sales</option>
                            <option value="Support">Support</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Response</label>
                        <textarea className="input min-h-24" defaultValue={editingResponse?.response} placeholder="Bot response..."></textarea>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Response"
                message="Are you sure you want to delete this response?"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}
