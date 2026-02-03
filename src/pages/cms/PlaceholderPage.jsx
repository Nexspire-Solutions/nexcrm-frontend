import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLayout, FiSidebar, FiImage, FiSettings } from 'react-icons/fi';

const QuickAction = ({ icon: Icon, title, desc, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
    >
        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Icon size={24} />
        </div>
        <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
    </div>
);

const PlaceholderPage = () => {
    const navigate = useNavigate();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">CMS Overview</h1>
                <p className="text-slate-500 mt-2">Manage your website content using the new Hybrid Logic Engine.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <QuickAction
                    icon={FiLayout}
                    title="Page Builder"
                    desc="Visually build pages with drag & drop or direct code editing."
                    onClick={() => navigate('/cms/builder')}
                />
                <QuickAction
                    icon={FiImage}
                    title="Banners"
                    desc="Manage homepage sliders and promotional banners."
                    onClick={() => navigate('/cms/banners')}
                />
                <QuickAction
                    icon={FiSidebar}
                    title="Menus"
                    desc="Configure header and footer navigation links."
                    onClick={() => navigate('/cms/menus')}
                />
                <QuickAction
                    icon={FiSettings}
                    title="Settings"
                    desc="Global site settings, SEO defaults, and themes."
                    onClick={() => navigate('/cms/settings')}
                />
            </div>

            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white">
                <div className="max-w-2xl">
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded text-white mb-4 inline-block">NEW FEATURE</span>
                    <h2 className="text-2xl font-bold mb-4">Hybrid Builder is Live! 🚀</h2>
                    <p className="text-indigo-200 mb-6">
                        Experience the power of our new internal engine. Switch seamlessly between Visual Mode and Code Mode to build pixel-perfect layouts.
                    </p>
                    <button
                        onClick={() => navigate('/cms/builder')}
                        className="bg-white text-indigo-900 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors"
                    >
                        Try Builder Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderPage;
