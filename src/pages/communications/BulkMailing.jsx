import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { leadsAPI, clientsAPI, templatesAPI } from '../../api';

export default function BulkMail() {
    const [step, setStep] = useState(1); // 1: Recipients, 2: Template, 3: Preview
    const [recipientType, setRecipientType] = useState('leads');
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [customSubject, setCustomSubject] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sendProgress, setSendProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Dynamic data from APIs
    const [leads, setLeads] = useState([]);
    const [clients, setClients] = useState([]);
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch leads, clients, and templates in parallel
            const [leadsRes, clientsRes, templatesRes] = await Promise.all([
                leadsAPI.getAll().catch(() => ({ leads: [] })),
                clientsAPI.getAll().catch(() => ({ clients: [] })),
                templatesAPI.getAll().catch(() => ({ data: [] }))
            ]);

            // Format leads with email
            const formattedLeads = (leadsRes.leads || [])
                .filter(l => l.email)
                .map(l => ({ id: l.id, name: l.contactName, email: l.email, type: 'lead' }));

            // Format clients with email
            const formattedClients = (Array.isArray(clientsRes) ? clientsRes : clientsRes.clients || [])
                .filter(c => c.email)
                .map(c => ({ id: c.id, name: c.name || c.contactName || `${c.firstName} ${c.lastName}`, email: c.email, type: 'client' }));

            setLeads(formattedLeads);
            setClients(formattedClients);
            setTemplates(templatesRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load recipients');
        } finally {
            setIsLoading(false);
        }
    };

    const recipients = recipientType === 'all'
        ? [...leads, ...clients]
        : recipientType === 'leads' ? leads : clients;

    const toggleRecipient = (recipient) => {
        setSelectedRecipients(prev => {
            const exists = prev.find(r => r.id === recipient.id && r.type === recipient.type);
            if (exists) {
                return prev.filter(r => !(r.id === recipient.id && r.type === recipient.type));
            }
            return [...prev, recipient];
        });
    };

    const selectAll = () => {
        setSelectedRecipients(recipients);
    };

    const clearAll = () => {
        setSelectedRecipients([]);
    };

    const handleSend = async () => {
        if (selectedRecipients.length === 0) {
            toast.error('Please select at least one recipient');
            return;
        }

        setSending(true);
        setSendProgress(0);

        // TODO: Implement actual email sending API
        // For now, simulate sending emails
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setSendProgress(i);
        }

        toast.success(`Successfully sent ${selectedRecipients.length} emails!`);
        setSending(false);
        setSendProgress(0);
        setStep(1);
        setSelectedRecipients([]);
        setSelectedTemplate(null);
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
                    <h1 className="page-title">Bulk Mail</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Send emails to multiple recipients at once
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="card p-4">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {[
                        { num: 1, label: 'Select Recipients' },
                        { num: 2, label: 'Choose Template' },
                        { num: 3, label: 'Preview & Send' },
                    ].map((s, idx) => (
                        <div key={s.num} className="flex items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.num
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {step > s.num ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : s.num}
                                </div>
                                <span className={`text-sm font-medium ${step >= s.num
                                    ? 'text-slate-900 dark:text-white'
                                    : 'text-slate-400 dark:text-slate-500'
                                    }`}>{s.label}</span>
                            </div>
                            {idx < 2 && (
                                <div className={`w-16 h-0.5 mx-4 ${step > s.num
                                    ? 'bg-indigo-600'
                                    : 'bg-slate-200 dark:bg-slate-700'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 1: Recipients */}
            {step === 1 && (
                <div className="card p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Select Recipients</h3>

                    {/* Recipient Type Tabs */}
                    <div className="flex gap-2 mb-4">
                        {[
                            { id: 'leads', label: 'Leads', count: leads.length },
                            { id: 'clients', label: 'Clients', count: clients.length },
                            { id: 'all', label: 'All', count: leads.length + clients.length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setRecipientType(tab.id); setSelectedRecipients([]); }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${recipientType === tab.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>

                    {/* Select All / Clear All */}
                    <div className="flex gap-2 mb-4">
                        <button onClick={selectAll} className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
                            Select All
                        </button>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <button onClick={clearAll} className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium">
                            Clear All
                        </button>
                        <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                            {selectedRecipients.length} selected
                        </span>
                    </div>

                    {/* Recipients List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                        {recipients.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                No {recipientType === 'all' ? 'recipients' : recipientType} with email addresses found
                            </div>
                        ) : (
                            recipients.map(recipient => (
                                <label
                                    key={`${recipient.type}-${recipient.id}`}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedRecipients.find(r => r.id === recipient.id && r.type === recipient.type)
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!selectedRecipients.find(r => r.id === recipient.id && r.type === recipient.type)}
                                        onChange={() => toggleRecipient(recipient)}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{recipient.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{recipient.email}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${recipient.type === 'lead'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                                        }`}>
                                        {recipient.type}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>

                    {/* Next Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setStep(2)}
                            disabled={selectedRecipients.length === 0}
                            className="btn-primary"
                        >
                            Next: Choose Template
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Template */}
            {step === 2 && (
                <div className="card p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Choose Email Template</h3>

                    {/* Template Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {templates.length === 0 ? (
                            <div className="col-span-2 text-center py-8 text-slate-500 dark:text-slate-400">
                                No templates found. Create templates in Communications → Email Templates
                            </div>
                        ) : (
                            templates.map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedTemplate?.id === template.id
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                            }`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{template.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{template.subject}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Custom Subject */}
                    <div className="mb-4">
                        <label className="label">Custom Subject (Optional)</label>
                        <input
                            type="text"
                            value={customSubject}
                            onChange={(e) => setCustomSubject(e.target.value)}
                            placeholder={selectedTemplate?.subject || 'Enter custom subject...'}
                            className="input"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between">
                        <button onClick={() => setStep(1)} className="btn-secondary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={!selectedTemplate && !customSubject}
                            className="btn-primary"
                        >
                            Next: Preview
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview & Send */}
            {step === 3 && (
                <div className="card p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Preview & Send</h3>

                    {/* Summary */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">Recipients</p>
                                <p className="font-medium text-slate-900 dark:text-white">{selectedRecipients.length} contacts</p>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">Template</p>
                                <p className="font-medium text-slate-900 dark:text-white">{selectedTemplate?.name || 'Custom'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-slate-500 dark:text-slate-400">Subject</p>
                                <p className="font-medium text-slate-900 dark:text-white">{customSubject || selectedTemplate?.subject}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recipients Preview */}
                    <div className="mb-6">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recipients:</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedRecipients.slice(0, 5).map(r => (
                                <span key={`${r.type}-${r.id}`} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-400">
                                    {r.email}
                                </span>
                            ))}
                            {selectedRecipients.length > 5 && (
                                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                    +{selectedRecipients.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar (shown while sending) */}
                    {sending && (
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600 dark:text-slate-400">Sending emails...</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{sendProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-300"
                                    style={{ width: `${sendProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-between">
                        <button onClick={() => setStep(2)} disabled={sending} className="btn-secondary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            className="btn-primary"
                        >
                            {sending ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Send {selectedRecipients.length} Emails
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
