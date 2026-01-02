import React from 'react';
import { FiMail, FiSend } from 'react-icons/fi';

const AtomForm = ({ content, style }) => {
    return (
        <section className="py-12 px-8 bg-white border border-dashed border-slate-300 rounded-lg text-center" style={style}>
            <div className="max-w-md mx-auto pointer-events-none select-none">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{content.title || 'Contact Us'}</h2>
                    <p className="text-slate-500">{content.subtitle || 'Send us a message...'}</p>
                </div>

                <div className="space-y-4 text-left opacity-60">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-10 bg-slate-100 rounded border border-slate-200"></div>
                        <div className="h-10 bg-slate-100 rounded border border-slate-200"></div>
                    </div>
                    <div className="h-10 bg-slate-100 rounded border border-slate-200"></div>
                    <div className="h-24 bg-slate-100 rounded border border-slate-200"></div>

                    <button className="w-full py-3 bg-indigo-600 text-white rounded font-medium flex items-center justify-center gap-2">
                        {content.buttonText || 'Send Message'} <FiSend />
                    </button>
                </div>

                <div className="mt-4 text-orange-500 text-xs font-mono bg-orange-50 inline-block px-2 py-1 rounded">
                    ★ Form Widget: Active on live site
                </div>
            </div>
        </section>
    );
};

export default AtomForm;
