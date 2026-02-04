/**
 * Generic Industry CMS Management
 * 
 * Reusable CMS editor for all industries. Configure sections via props.
 */

import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import ProCard from '../../components/common/ProCard';
import Modal from '../../components/common/Modal';
import { FiEdit2, FiTrash2, FiPlus, FiSave, FiSettings, FiImage, FiMessageCircle, FiUsers, FiHelpCircle, FiBriefcase, FiBarChart2 } from 'react-icons/fi';

// Section configs per industry
const INDUSTRY_CONFIGS = {
    salon: {
        title: 'Salon CMS',
        sections: ['hero', 'stats', 'services', 'team', 'testimonials', 'packages', 'faqs']
    },
    healthcare: {
        title: 'Healthcare CMS',
        sections: ['hero', 'stats', 'departments', 'doctors', 'testimonials', 'whyChooseUs', 'faqs']
    },
    hospitality: {
        title: 'Hospitality CMS',
        sections: ['hero', 'stats', 'amenities', 'testimonials', 'faqs']
    },
    realestate: {
        title: 'Real Estate CMS',
        sections: ['hero', 'stats', 'services', 'testimonials', 'faqs']
    },
    fitness: {
        title: 'Fitness CMS',
        sections: ['hero', 'stats', 'benefits', 'testimonials', 'faqs']
    },
    restaurant: {
        title: 'Restaurant CMS',
        sections: ['hero', 'stats', 'features', 'testimonials', 'faqs']
    },
    logistics: {
        title: 'Logistics CMS',
        sections: ['hero', 'stats', 'services', 'testimonials', 'faqs']
    },
    manufacturing: {
        title: 'Manufacturing CMS',
        sections: ['hero', 'stats', 'services', 'testimonials', 'faqs']
    },
    education: {
        title: 'Education CMS',
        sections: ['hero', 'stats', 'features', 'testimonials', 'faqs']
    },
    travel: {
        title: 'Travel CMS',
        sections: ['hero', 'stats', 'whyChooseUs', 'testimonials', 'faqs']
    }
};

const SECTION_ICONS = {
    hero: FiImage,
    stats: FiBarChart2,
    services: FiBriefcase,
    team: FiUsers,
    doctors: FiUsers,
    departments: FiBriefcase,
    testimonials: FiMessageCircle,
    packages: FiBriefcase,
    faqs: FiHelpCircle,
    whyChooseUs: FiSettings,
    amenities: FiBriefcase,
    benefits: FiBriefcase,
    features: FiBriefcase
};

const IndustryCMS = ({ industry = 'salon' }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('hero');
    const [data, setData] = useState({
        hero: { title: '', subtitle: '', badge: '' },
        stats: [],
        services: [],
        team: [],
        doctors: [],
        departments: [],
        testimonials: [],
        packages: [],
        faqs: [],
        whyChooseUs: [],
        amenities: [],
        benefits: [],
        features: []
    });

    const config = INDUSTRY_CONFIGS[industry] || INDUSTRY_CONFIGS.salon;

    useEffect(() => {
        fetchData();
    }, [industry]);

    const fetchData = async () => {
        try {
            const res = await apiClient.get(`/industry-cms/${industry}/settings`);
            if (res.data?.data) {
                setData(prev => ({ ...prev, ...res.data.data }));
            }
        } catch (error) {
            console.error('Failed to load CMS data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveData = async () => {
        setSaving(true);
        try {
            await apiClient.put(`/industry-cms/${industry}/settings`, data);
            toast.success('CMS content saved successfully!');
        } catch (error) {
            toast.error('Failed to save CMS content');
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateHero = (field, value) => {
        setData(prev => ({
            ...prev,
            hero: { ...prev.hero, [field]: value }
        }));
    };

    const addItem = (section, template = {}) => {
        setData(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), template]
        }));
    };

    const updateItem = (section, index, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const removeItem = (section, index) => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    const renderHeroEditor = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                <input
                    type="text"
                    value={data.hero?.badge || ''}
                    onChange={(e) => updateHero('badge', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Award-Winning Studio"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                <input
                    type="text"
                    value={data.hero?.title || ''}
                    onChange={(e) => updateHero('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Main headline"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                <textarea
                    value={data.hero?.subtitle || ''}
                    onChange={(e) => updateHero('subtitle', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Supporting text"
                />
            </div>
        </div>
    );

    const renderListEditor = (section, fields) => (
        <div className="space-y-4">
            {(data[section] || []).map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border relative">
                    <button
                        onClick={() => removeItem(section, idx)}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                        <FiTrash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                        {fields.map(field => (
                            <div key={field.key} className={field.fullWidth ? 'md:col-span-2' : ''}>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={item[field.key] || ''}
                                        onChange={(e) => updateItem(section, idx, field.key, e.target.value)}
                                        rows={2}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        placeholder={field.placeholder}
                                    />
                                ) : field.type === 'number' ? (
                                    <input
                                        type="number"
                                        value={item[field.key] || ''}
                                        onChange={(e) => updateItem(section, idx, field.key, e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        placeholder={field.placeholder}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={item[field.key] || ''}
                                        onChange={(e) => updateItem(section, idx, field.key, e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        placeholder={field.placeholder}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <button
                onClick={() => addItem(section, fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}))}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2"
            >
                <FiPlus /> Add Item
            </button>
        </div>
    );

    const getSectionFields = (section) => {
        const fieldConfigs = {
            stats: [
                { key: 'value', label: 'Value', placeholder: 'e.g., 500+' },
                { key: 'label', label: 'Label', placeholder: 'e.g., Happy Clients' }
            ],
            services: [
                { key: 'name', label: 'Name', placeholder: 'Service name' },
                { key: 'description', label: 'Description', placeholder: 'Brief description', type: 'textarea', fullWidth: true },
                { key: 'price', label: 'Price', placeholder: '99', type: 'number' },
                { key: 'image', label: 'Image URL', placeholder: 'https://...' }
            ],
            team: [
                { key: 'name', label: 'Name', placeholder: 'Full name' },
                { key: 'role', label: 'Role', placeholder: 'e.g., Lead Stylist' },
                { key: 'experience', label: 'Experience', placeholder: 'e.g., 10+ Years' },
                { key: 'image', label: 'Photo URL', placeholder: 'https://...' }
            ],
            doctors: [
                { key: 'name', label: 'Name', placeholder: 'Dr. Full Name' },
                { key: 'specialty', label: 'Specialty', placeholder: 'e.g., Cardiologist' },
                { key: 'experience', label: 'Experience', placeholder: 'e.g., 15+ Years' },
                { key: 'image', label: 'Photo URL', placeholder: 'https://...' }
            ],
            departments: [
                { key: 'name', label: 'Name', placeholder: 'Department name' },
                { key: 'description', label: 'Description', placeholder: 'Brief description' },
                { key: 'icon', label: 'Icon', placeholder: 'heart, activity, shield...' },
                { key: 'color', label: 'Color', placeholder: 'red, blue, green...' }
            ],
            testimonials: [
                { key: 'name', label: 'Client Name', placeholder: 'Full name' },
                { key: 'text', label: 'Testimonial', placeholder: 'What they said...', type: 'textarea', fullWidth: true },
                { key: 'rating', label: 'Rating (1-5)', placeholder: '5', type: 'number' },
                { key: 'image', label: 'Photo URL', placeholder: 'https://...' }
            ],
            packages: [
                { key: 'name', label: 'Package Name', placeholder: 'e.g., Premium' },
                { key: 'price', label: 'Price', placeholder: '199', type: 'number' },
                { key: 'features', label: 'Features (comma-separated)', placeholder: 'Feature 1, Feature 2', fullWidth: true }
            ],
            faqs: [
                { key: 'question', label: 'Question', placeholder: 'Common question?', fullWidth: true },
                { key: 'answer', label: 'Answer', placeholder: 'Detailed answer...', type: 'textarea', fullWidth: true }
            ],
            whyChooseUs: [
                { key: 'title', label: 'Title', placeholder: 'Benefit title' },
                { key: 'description', label: 'Description', placeholder: 'Brief explanation', type: 'textarea', fullWidth: true },
                { key: 'icon', label: 'Icon', placeholder: 'award, shield, heart...' }
            ],
            amenities: [
                { key: 'name', label: 'Amenity Name', placeholder: 'e.g., Free WiFi' },
                { key: 'icon', label: 'Icon', placeholder: 'wifi, pool, gym...' }
            ],
            benefits: [
                { key: 'title', label: 'Benefit Title', placeholder: 'Why join us' },
                { key: 'description', label: 'Description', placeholder: 'Details...', type: 'textarea', fullWidth: true }
            ],
            features: [
                { key: 'title', label: 'Feature Title', placeholder: 'Key feature' },
                { key: 'description', label: 'Description', placeholder: 'Details...', type: 'textarea', fullWidth: true },
                { key: 'icon', label: 'Icon', placeholder: 'star, check, award...' }
            ]
        };
        return fieldConfigs[section] || [];
    };

    const renderSectionContent = () => {
        if (activeSection === 'hero') {
            return renderHeroEditor();
        }
        return renderListEditor(activeSection, getSectionFields(activeSection));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
                    <p className="text-gray-500">Manage your storefront homepage content</p>
                </div>
                <button
                    onClick={saveData}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <FiSave size={18} />
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-48 space-y-1">
                    {config.sections.map(section => {
                        const Icon = SECTION_ICONS[section] || FiSettings;
                        return (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-left capitalize transition-colors ${activeSection === section
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={18} />
                                {section.replace(/([A-Z])/g, ' $1').trim()}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <ProCard title={activeSection.replace(/([A-Z])/g, ' $1').trim()} className="capitalize">
                        {renderSectionContent()}
                    </ProCard>
                </div>
            </div>
        </div>
    );
};

export default IndustryCMS;
