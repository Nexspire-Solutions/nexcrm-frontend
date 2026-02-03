import React, { useState } from 'react';
import { FiGlobe, FiAlertCircle } from 'react-icons/fi';

const SEOPanel = ({ data, onUpdate }) => {
    const [title, setTitle] = useState(data?.title || '');
    const [description, setDescription] = useState(data?.description || '');
    const [slug, setSlug] = useState(data?.slug || '');

    // SERP Preview Logic
    const displayText = description.length > 160 ? description.substring(0, 160) + '...' : description;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiGlobe className="text-indigo-600" />
                SEO Settings
            </h3>

            <div className="space-y-4">
                {/* SERP Preview */}
                <div className="bg-white p-4 border rounded-lg shadow-sm">
                    <span className="text-xs text-slate-500 block mb-1">Google Search Preview</span>
                    <div className="font-sans antialiased">
                        <div className="text-[#1a0dab] text-xl cursor-pointer hover:underline truncate">
                            {title || 'Page Title'}
                        </div>
                        <div className="text-[#006621] text-sm truncate">
                            https://yoursite.com/{slug || 'page-slug'}
                        </div>
                        <div className="text-[#545454] text-sm leading-snug">
                            {displayText || 'Analysis of the page meta description...'}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Meta Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full form-input border-slate-300 rounded-md text-sm"
                        placeholder="e.g. Best CRM Software for Small Business"
                        maxLength={60}
                    />
                    <div className="flex justify-between mt-1 text-xs">
                        <span className={`${title.length > 60 ? 'text-red-500' : 'text-slate-400'}`}>{title.length}/60</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Meta Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full form-input border-slate-300 rounded-md text-sm h-24"
                        placeholder="Brief summary of your page content..."
                        maxLength={160}
                    />
                    <div className="flex justify-between mt-1 text-xs">
                        <span className={`${description.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>{description.length}/160</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Canonical URL</label>
                    <input
                        type="text"
                        className="w-full form-input border-slate-300 rounded-md text-sm"
                        placeholder="https://..."
                    />
                </div>
            </div>

            <div className="mt-6 flex items-start gap-2 p-3 bg-amber-50 text-amber-700 rounded text-sm">
                <FiAlertCircle className="mt-0.5 shrink-0" />
                <p>Ensure your focus keyword appears in both the title and description for better ranking.</p>
            </div>
        </div>
    );
};

export default SEOPanel;
