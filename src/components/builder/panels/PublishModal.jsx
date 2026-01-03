import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiGlobe, FiLoader } from 'react-icons/fi';

const PublishModal = ({ isOpen, onClose, onPublish }) => {
    const [step, setStep] = useState(1);
    const [isPublishing, setIsPublishing] = useState(false);

    if (!isOpen) return null;

    const handlePublish = async () => {
        setIsPublishing(true);
        // Simulate publish delay
        setTimeout(() => {
            setIsPublishing(false);
            setStep(2);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <FiX size={20} />
                </button>

                {step === 1 && (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                            <FiGlobe />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ready to Go Live?</h2>
                            <p className="text-slate-500 mt-2">Your site will be published to the following domain:</p>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg font-mono text-sm text-center border border-slate-200 dark:border-slate-700">
                            https://mysite.nexbuilder.com
                        </div>

                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            {isPublishing ? (
                                <>
                                    <FiLoader className="animate-spin" /> Publishing...
                                </>
                            ) : (
                                'Publish Now'
                            )}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
                            <FiCheckCircle />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Published Successfully!</h2>
                            <p className="text-emerald-600 font-medium mt-2">Your site is now live worldwide.</p>
                        </div>

                        <div className="space-y-3">
                            <a
                                href="#"
                                className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                            >
                                View Live Site
                            </a>
                            <button
                                onClick={onClose}
                                className="block w-full py-3 text-slate-500 hover:text-slate-700 font-bold"
                            >
                                Back to Editor
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublishModal;
