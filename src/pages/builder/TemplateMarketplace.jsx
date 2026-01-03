import React, { useState } from 'react';
import { FiSearch, FiFilter, FiEye, FiDownload, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
    'All', 'Business', 'SaaS', 'Portfolio', 'E-commerce', 'Blog', 'Landing Page'
];

const TEMPLATES = [
    {
        id: 1,
        title: 'Modern SaaS Startup',
        category: 'SaaS',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        tags: ['Dark Mode', 'App', 'Tech'],
        installed: false
    },
    {
        id: 2,
        title: 'Minimal Portfolio',
        category: 'Portfolio',
        image: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        tags: ['Clean', 'Personal', 'Resume'],
        installed: true
    },
    {
        id: 3,
        title: 'Agency Corporate',
        category: 'Business',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        tags: ['Professional', 'Corporate', 'Services'],
        installed: false
    },
    {
        id: 4,
        title: 'Product Launch',
        category: 'Landing Page',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        tags: ['Marketing', 'One Page', 'Sales'],
        installed: false
    },
    {
        id: 5,
        title: 'Online Store',
        category: 'E-commerce',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        tags: ['Shop', 'Retail', 'Cart'],
        installed: false
    }
];

const TemplateMarketplace = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [search, setSearch] = useState('');

    const filteredTemplates = TEMPLATES.filter(t =>
        (selectedCategory === 'All' || t.category === selectedCategory) &&
        t.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Template Marketplace</h1>
                    <p className="text-slate-500">Kickstart your project with professionally designed templates.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <FiSearch className="absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 pb-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map(template => (
                    <div key={template.id} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                        <div className="h-48 relative overflow-hidden bg-slate-100">
                            <img src={template.image} alt={template.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 bg-white rounded-full text-slate-800 hover:text-indigo-600 transition-colors" title="Preview">
                                    <FiEye />
                                </button>
                            </div>
                            {template.installed && (
                                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                                    <FiCheck /> Installed
                                </div>
                            )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{template.title}</h3>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {template.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                                {template.installed ? (
                                    <button
                                        onClick={() => navigate('/cms/builder/new')}
                                        className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Use Template
                                    </button>
                                ) : (
                                    <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                        <FiDownload /> Install & Use
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateMarketplace;
