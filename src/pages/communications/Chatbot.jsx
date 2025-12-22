import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

const mockResponses = [
    { id: 1, trigger: 'hello', response: 'Hello! How can I help you today?', category: 'Greeting' },
    { id: 2, trigger: 'pricing', response: 'Our pricing starts at $49/month. Would you like to know more about our plans?', category: 'Sales' },
    { id: 3, trigger: 'support', response: 'Please contact our support team at support@company.com or call us at 1-800-XXX-XXXX', category: 'Support' },
    { id: 4, trigger: 'demo', response: 'I\'d be happy to schedule a demo for you. What time works best?', category: 'Sales' },
];

export default function Chatbot() {
    const [responses, setResponses] = useState(mockResponses);
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

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (deleteTargetId) {
            setResponses(prev => prev.filter(r => r.id !== deleteTargetId));
            toast.success('Response deleted');
            setDeleteTargetId(null);
        }
    };

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
                <button onClick={() => toast.success('Settings saved')} className="btn-primary">
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
