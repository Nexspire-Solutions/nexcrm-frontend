import React, { useState } from 'react';
import { FiX, FiArrowRight, FiCheck } from 'react-icons/fi';
import { HEADER_TEMPLATES, FOOTER_TEMPLATES, LAYOUT_TEMPLATES } from '../lib/layoutTemplates';

const STEPS = [
    { id: 'details', title: 'Page Details' },
    { id: 'header', title: 'Choose Header' },
    { id: 'footer', title: 'Choose Footer' },
    { id: 'layout', title: 'Choose Layout' }
];

const WizardModal = ({ isOpen, onClose, onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        header: HEADER_TEMPLATES[0],
        footer: FOOTER_TEMPLATES[0],
        layout: LAYOUT_TEMPLATES[0]
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onFinish(formData);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const updateData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const isStepValid = () => {
        if (currentStep === 0) return formData.title && formData.slug;
        return true;
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Summer Sale"
                                value={formData.title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                    setFormData(prev => ({ ...prev, title, slug }));
                                }}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
                            <div className="flex">
                                <span className="bg-slate-100 border border-r-0 border-slate-300 px-3 py-2 rounded-l-lg text-slate-500 text-sm">/</span>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500"
                                    value={formData.slug}
                                    onChange={(e) => updateData('slug', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {HEADER_TEMPLATES.map(t => (
                            <div
                                key={t.id}
                                onClick={() => updateData('header', t)}
                                className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${formData.header.id === t.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                <img src={t.thumbnail} alt={t.name} className="w-full h-32 object-cover bg-slate-50" />
                                <div className="p-3 bg-white flex justify-between items-center">
                                    <span className="font-medium text-sm">{t.name}</span>
                                    {formData.header.id === t.id && <FiCheck className="text-indigo-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {FOOTER_TEMPLATES.map(t => (
                            <div
                                key={t.id}
                                onClick={() => updateData('footer', t)}
                                className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${formData.footer.id === t.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                <img src={t.thumbnail} alt={t.name} className="w-full h-32 object-cover bg-slate-50" />
                                <div className="p-3 bg-white flex justify-between items-center">
                                    <span className="font-medium text-sm">{t.name}</span>
                                    {formData.footer.id === t.id && <FiCheck className="text-indigo-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 3:
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {LAYOUT_TEMPLATES.map(t => (
                            <div
                                key={t.id}
                                onClick={() => updateData('layout', t)}
                                className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${formData.layout.id === t.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                                <img src={t.thumbnail} alt={t.name} className="w-full h-32 object-cover bg-slate-50" />
                                <div className="p-3 bg-white">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-sm">{t.name}</span>
                                        {formData.layout.id === t.id && <FiCheck className="text-indigo-500" />}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Page</h2>
                        <p className="text-sm text-slate-500">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-100">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    {renderStepContent()}
                </div>

                {/* Footer buttons */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-white dark:bg-slate-900">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 text-white transition-all shadow-lg shadow-indigo-200 ${!isStepValid() ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'}`}
                    >
                        {currentStep === STEPS.length - 1 ? 'Build Page' : 'Next'}
                        {currentStep < STEPS.length - 1 && <FiArrowRight />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WizardModal;
