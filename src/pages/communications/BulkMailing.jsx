import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BulkMailing() {
    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedRecipients, setSelectedRecipients] = useState('all_leads');
    const [scheduleType, setScheduleType] = useState('now');

    const templates = [
        { id: 1, name: 'Welcome Email', subject: 'Welcome to Our Platform' },
        { id: 2, name: 'Follow-up Reminder', subject: 'Following up on our conversation' },
        { id: 3, name: 'Meeting Confirmation', subject: 'Your meeting is confirmed' },
    ];

    const recipientOptions = [
        { id: 'all_leads', label: 'All Leads', count: 156 },
        { id: 'new_leads', label: 'New Leads (Last 7 days)', count: 23 },
        { id: 'qualified', label: 'Qualified Leads', count: 45 },
        { id: 'customers', label: 'All Customers', count: 78 },
        { id: 'inactive', label: 'Inactive Leads (30+ days)', count: 34 },
    ];

    const handleSend = () => {
        toast.success('Bulk mail scheduled successfully');
        setStep(1);
        setSelectedTemplate(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bulk Mailing</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Send emails to multiple recipients at once
                    </p>
                </div>
            </div>

            {/* Steps Progress */}
            <div className="card p-4">
                <div className="flex items-center gap-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                {s}
                            </div>
                            <span className={`text-sm font-medium ${step >= s ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                {s === 1 ? 'Select Template' : s === 2 ? 'Choose Recipients' : 'Schedule & Send'}
                            </span>
                            {s < 3 && <div className="w-12 h-px bg-slate-200 dark:bg-slate-700 mx-2"></div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="card p-6">
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Select Email Template</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template.id)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedTemplate === template.id
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <p className="font-medium text-slate-900 dark:text-white">{template.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.subject}</p>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <button onClick={() => setStep(2)} disabled={!selectedTemplate} className="btn-primary">
                                Next Step
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Choose Recipients</h3>
                        <div className="space-y-3">
                            {recipientOptions.map((option) => (
                                <label
                                    key={option.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRecipients === option.id
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="recipients"
                                            value={option.id}
                                            checked={selectedRecipients === option.id}
                                            onChange={(e) => setSelectedRecipients(e.target.value)}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <span className="font-medium text-slate-900 dark:text-white">{option.label}</span>
                                    </div>
                                    <span className="badge-primary">{option.count} recipients</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                            <button onClick={() => setStep(3)} className="btn-primary">
                                Next Step
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Schedule & Send</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${scheduleType === 'now' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <input type="radio" name="schedule" value="now" checked={scheduleType === 'now'} onChange={(e) => setScheduleType(e.target.value)} className="w-4 h-4 text-indigo-600" />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Send Now</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Emails will be sent immediately</p>
                                    </div>
                                </div>
                            </label>
                            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${scheduleType === 'schedule' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <input type="radio" name="schedule" value="schedule" checked={scheduleType === 'schedule'} onChange={(e) => setScheduleType(e.target.value)} className="w-4 h-4 text-indigo-600" />
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Schedule</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Choose date and time</p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {scheduleType === 'schedule' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Date</label>
                                    <input type="date" className="input" />
                                </div>
                                <div>
                                    <label className="label">Time</label>
                                    <input type="time" className="input" />
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Summary</h4>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                <li>Template: {templates.find(t => t.id === selectedTemplate)?.name}</li>
                                <li>Recipients: {recipientOptions.find(r => r.id === selectedRecipients)?.label}</li>
                                <li>Total emails: {recipientOptions.find(r => r.id === selectedRecipients)?.count}</li>
                            </ul>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                            <button onClick={handleSend} className="btn-primary">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                {scheduleType === 'now' ? 'Send Now' : 'Schedule'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
