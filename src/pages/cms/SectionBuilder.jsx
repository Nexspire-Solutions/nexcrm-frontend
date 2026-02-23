import { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

export default function SectionBuilder() {
    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const response = await apiClient.get('/cms/sections');
            setSections(response.data?.data || response.data?.sections || []);
        } catch (error) {
            console.error('Failed to fetch sections:', error);
            setSections([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            for (const section of sections) {
                await apiClient.post('/cms/sections', section);
            }
            toast.success('Sections saved successfully');
        } catch (error) {
            toast.error('Failed to save sections');
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Section Builder
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Build and arrange page sections
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Save Changes
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                {sections.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            No sections yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            Start building your page by adding sections
                        </p>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Add First Section
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sections.map((section, index) => (
                            <div
                                key={section.id || index}
                                className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {section.type || 'Section'} {index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 text-slate-400 hover:text-indigo-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-red-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
