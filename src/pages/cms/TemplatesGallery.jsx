import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiLayout } from 'react-icons/fi';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import WizardModal from '../../components/builder/wizard/WizardModal';

const TemplatesGallery = () => {
    const navigate = useNavigate();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreatePage = async (formData) => {
        setLoading(true);
        try {
            // Combine Header + Body + Footer into one structure
            const fullStructure = {
                id: 'root',
                type: 'Body',
                props: { className: 'min-h-screen bg-white flex flex-col' },
                children: [
                    formData.header.structure,
                    // If the selected layout is already a Body (like landing-sass), we need its children.
                    // If it's a Section (like blank-slate), we wrap it or use it.
                    // Simplified: We assume layout returns a 'Body' or 'Section' and we adapt.
                    // For now, let's assume 'layout.structure' is the Main Content Section(s).
                    ...(formData.layout.id === 'landing-sass' ? formData.layout.structure.children : [formData.layout.structure]),
                    formData.footer.structure
                ]
            };

            const payload = {
                title: formData.title,
                slug: formData.slug,
                content: fullStructure,
                status: 'draft',
                meta_title: formData.title,
                meta_description: `Created with NexBuilder`
            };

            await apiClient.post('/cms/pages', payload);
            toast.success('Page created successfully!');
            setIsWizardOpen(false);
            navigate(`/cms/builder/${formData.slug}`);

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Failed to create page');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-xl text-white">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Page Builder</h1>
                    <p className="text-indigo-100 max-w-xl">Create stunning pages for your store in minutes. Start with our intelligent wizard or build from scratch.</p>

                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <FiPlus size={20} />
                        Create New Page
                    </button>
                </div>
                <div className="hidden lg:block bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="flex gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="space-y-2 w-48 opacity-50">
                        <div className="h-4 bg-white rounded w-full"></div>
                        <div className="h-20 bg-white rounded w-full"></div>
                        <div className="h-4 bg-white rounded w-3/4"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group" onClick={() => setIsWizardOpen(true)}>
                    <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiPlus size={32} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">New Blank Page</h3>
                    <p className="text-sm text-slate-500 mt-2">Start fresh with our page wizard</p>
                </div>

                {/* We can re-add template cards here if we want a direct 'Quick Start' list later, 
                    but strictly speaking the Wizard handles selection now. 
                    Let's leave it clean for now. 
                */}
            </div>

            <WizardModal
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onFinish={handleCreatePage}
            />
        </div>
    );
};

export default TemplatesGallery;
