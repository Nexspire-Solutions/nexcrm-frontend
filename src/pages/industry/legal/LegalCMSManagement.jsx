/**
 * Legal CMS Management
 * 
 * Manage Legal storefront content:
 * - Practice Areas
 * - Client Testimonials
 * - Firm Statistics
 * - Hero Content
 * - Why Choose Us points
 */

import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import Modal from '../../../components/common/Modal';
import { FiBriefcase, FiMessageCircle, FiBarChart2, FiEdit2, FiTrash2, FiPlus, FiSave, FiSettings } from 'react-icons/fi';

const LegalCMSManagement = () => {
    const [activeTab, setActiveTab] = useState('practice-areas');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data states
    const [practiceAreas, setPracticeAreas] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [stats, setStats] = useState({});
    const [hero, setHero] = useState({});
    const [whyChoose, setWhyChoose] = useState([]);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editItem, setEditItem] = useState(null);

    const tabs = [
        { id: 'practice-areas', label: 'Practice Areas', icon: FiBriefcase },
        { id: 'testimonials', label: 'Testimonials', icon: FiMessageCircle },
        { id: 'stats', label: 'Statistics', icon: FiBarChart2 },
        { id: 'settings', label: 'Hero & Settings', icon: FiSettings }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [areasRes, testimonialsRes, statsRes, heroRes, whyRes] = await Promise.all([
                apiClient.get('/legal-cms/practice-areas').catch(() => ({ data: { data: [] } })),
                apiClient.get('/legal-cms/testimonials').catch(() => ({ data: { data: [] } })),
                apiClient.get('/legal-cms/stats').catch(() => ({ data: { data: {} } })),
                apiClient.get('/legal-cms/hero').catch(() => ({ data: { data: {} } })),
                apiClient.get('/legal-cms/why-choose').catch(() => ({ data: { data: [] } }))
            ]);

            setPracticeAreas(areasRes.data?.data || []);
            setTestimonials(testimonialsRes.data?.data || []);
            setStats(statsRes.data?.data || {});
            setHero(heroRes.data?.data || {});
            setWhyChoose(whyRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        setEditItem(item);
        setShowModal(true);
    };

    const handleSave = async (data) => {
        setSaving(true);
        try {
            if (modalType === 'practice-area') {
                if (editItem) {
                    await apiClient.put(`/legal-cms/practice-areas/${editItem.id}`, data);
                } else {
                    await apiClient.post('/legal-cms/practice-areas', data);
                }
            } else if (modalType === 'testimonial') {
                if (editItem) {
                    await apiClient.put(`/legal-cms/testimonials/${editItem.id}`, data);
                } else {
                    await apiClient.post('/legal-cms/testimonials', data);
                }
            }
            toast.success('Saved successfully');
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await apiClient.delete(`/legal-cms/${type}/${id}`);
            toast.success('Deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const saveStats = async () => {
        setSaving(true);
        try {
            await apiClient.put('/legal-cms/stats', stats);
            toast.success('Statistics saved');
        } catch (error) {
            toast.error('Failed to save statistics');
        } finally {
            setSaving(false);
        }
    };

    const saveHero = async () => {
        setSaving(true);
        try {
            await apiClient.put('/legal-cms/hero', hero);
            toast.success('Hero content saved');
        } catch (error) {
            toast.error('Failed to save hero content');
        } finally {
            setSaving(false);
        }
    };

    const saveWhyChoose = async () => {
        setSaving(true);
        try {
            await apiClient.put('/legal-cms/why-choose', { points: whyChoose });
            toast.success('Why Choose Us saved');
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const iconOptions = [
        { value: 'gavel', label: 'Gavel (Litigation)' },
        { value: 'shield', label: 'Shield (Defense)' },
        { value: 'briefcase', label: 'Briefcase (Corporate)' },
        { value: 'users', label: 'Users (Family)' },
        { value: 'home', label: 'Home (Real Estate)' },
        { value: 'lightbulb', label: 'Lightbulb (IP)' },
        { value: 'scale', label: 'Scale (General)' }
    ];

    return (
        <div className="p-6">
            <ProHeader
                title="Storefront CMS"
                subtitle="Manage your legal storefront content"
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Storefront CMS' }
                ]}
            />

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    {/* Practice Areas Tab */}
                    {activeTab === 'practice-areas' && (
                        <ProCard
                            title="Practice Areas"
                            subtitle="Services displayed on your storefront"
                            action={
                                <button
                                    onClick={() => openModal('practice-area')}
                                    className="btn btn-primary"
                                >
                                    <FiPlus size={16} /> Add Practice Area
                                </button>
                            }
                        >
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {practiceAreas.map(area => (
                                    <div key={area.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                                <FiBriefcase size={18} />
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal('practice-area', area)}
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                                >
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('practice-areas', area.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-slate-900">{area.name}</h4>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{area.description}</p>
                                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${area.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {area.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </div>
                                ))}
                                {practiceAreas.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-slate-500">
                                        No practice areas added yet. Add your first one!
                                    </div>
                                )}
                            </div>
                        </ProCard>
                    )}

                    {/* Testimonials Tab */}
                    {activeTab === 'testimonials' && (
                        <ProCard
                            title="Client Testimonials"
                            subtitle="Reviews displayed on your storefront"
                            action={
                                <button
                                    onClick={() => openModal('testimonial')}
                                    className="btn btn-primary"
                                >
                                    <FiPlus size={16} /> Add Testimonial
                                </button>
                            }
                        >
                            <div className="space-y-4">
                                {testimonials.map(item => (
                                    <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-4 group">
                                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                                            {item.client_name?.charAt(0) || 'C'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">{item.client_name}</h4>
                                                    <span className="text-xs text-amber-600">{item.case_type}</span>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => openModal('testimonial', item)}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                                    >
                                                        <FiEdit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete('testimonials', item.id)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-2">"{item.testimonial}"</p>
                                            <div className="flex mt-2">
                                                {[...Array(item.rating || 5)].map((_, i) => (
                                                    <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {testimonials.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        No testimonials added yet. Add your first one!
                                    </div>
                                )}
                            </div>
                        </ProCard>
                    )}

                    {/* Statistics Tab */}
                    {activeTab === 'stats' && (
                        <ProCard
                            title="Firm Statistics"
                            subtitle="Numbers displayed on your storefront"
                            action={
                                <button onClick={saveStats} disabled={saving} className="btn btn-primary">
                                    <FiSave size={16} /> {saving ? 'Saving...' : 'Save Statistics'}
                                </button>
                            }
                        >
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { key: 'cases_won', label: 'Cases Won', placeholder: '500+' },
                                    { key: 'years_experience', label: 'Years Experience', placeholder: '25+' },
                                    { key: 'success_rate', label: 'Success Rate', placeholder: '98%' },
                                    { key: 'settlements', label: 'Total Settlements', placeholder: '₹50Cr+' },
                                    { key: 'attorneys', label: 'Expert Attorneys', placeholder: '15+' },
                                    { key: 'support', label: 'Support Availability', placeholder: '24/7' }
                                ].map(stat => (
                                    <div key={stat.key}>
                                        <label className="label">{stat.label}</label>
                                        <input
                                            type="text"
                                            value={stats[stat.key] || ''}
                                            onChange={e => setStats({ ...stats, [stat.key]: e.target.value })}
                                            placeholder={stat.placeholder}
                                            className="input"
                                        />
                                    </div>
                                ))}
                            </div>
                        </ProCard>
                    )}

                    {/* Hero & Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <ProCard
                                title="Hero Section"
                                subtitle="Main banner content on homepage"
                                action={
                                    <button onClick={saveHero} disabled={saving} className="btn btn-primary">
                                        <FiSave size={16} /> {saving ? 'Saving...' : 'Save Hero'}
                                    </button>
                                }
                            >
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Badge Text</label>
                                        <input
                                            type="text"
                                            value={hero.badge_text || ''}
                                            onChange={e => setHero({ ...hero, badge_text: e.target.value })}
                                            placeholder="Trusted Legal Excellence"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Main Title</label>
                                        <input
                                            type="text"
                                            value={hero.title || ''}
                                            onChange={e => setHero({ ...hero, title: e.target.value })}
                                            placeholder="Your Rights, Our Priority"
                                            className="input"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">Subtitle</label>
                                        <textarea
                                            value={hero.subtitle || ''}
                                            onChange={e => setHero({ ...hero, subtitle: e.target.value })}
                                            placeholder="Expert legal counsel with a proven track record..."
                                            rows={3}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Primary CTA Text</label>
                                        <input
                                            type="text"
                                            value={hero.cta_primary || ''}
                                            onChange={e => setHero({ ...hero, cta_primary: e.target.value })}
                                            placeholder="Free Consultation"
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Secondary CTA Text</label>
                                        <input
                                            type="text"
                                            value={hero.cta_secondary || ''}
                                            onChange={e => setHero({ ...hero, cta_secondary: e.target.value })}
                                            placeholder="Our Practice Areas"
                                            className="input"
                                        />
                                    </div>
                                </div>
                            </ProCard>

                            <ProCard
                                title="Why Choose Us"
                                subtitle="Key selling points for your firm"
                                action={
                                    <button onClick={saveWhyChoose} disabled={saving} className="btn btn-primary">
                                        <FiSave size={16} /> {saving ? 'Saving...' : 'Save Points'}
                                    </button>
                                }
                            >
                                <div className="space-y-3">
                                    {whyChoose.map((point, index) => (
                                        <div key={index} className="flex gap-2">
                                            <span className="w-8 h-10 flex items-center justify-center text-sm text-slate-400">{index + 1}.</span>
                                            <input
                                                type="text"
                                                value={point}
                                                onChange={e => {
                                                    const newPoints = [...whyChoose];
                                                    newPoints[index] = e.target.value;
                                                    setWhyChoose(newPoints);
                                                }}
                                                className="input flex-1"
                                            />
                                            <button
                                                onClick={() => setWhyChoose(whyChoose.filter((_, i) => i !== index))}
                                                className="p-2 text-slate-400 hover:text-red-500"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setWhyChoose([...whyChoose, ''])}
                                        className="btn btn-secondary w-full"
                                    >
                                        <FiPlus size={16} /> Add Point
                                    </button>
                                </div>
                            </ProCard>
                        </div>
                    )}
                </>
            )}

            {/* Modal for Practice Area / Testimonial */}
            {showModal && (
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editItem ? `Edit ${modalType === 'practice-area' ? 'Practice Area' : 'Testimonial'}` : `Add ${modalType === 'practice-area' ? 'Practice Area' : 'Testimonial'}`}
                >
                    {modalType === 'practice-area' ? (
                        <PracticeAreaForm
                            item={editItem}
                            onSave={handleSave}
                            saving={saving}
                            iconOptions={iconOptions}
                        />
                    ) : (
                        <TestimonialForm
                            item={editItem}
                            onSave={handleSave}
                            saving={saving}
                        />
                    )}
                </Modal>
            )}
        </div>
    );
};

// Practice Area Form Component
const PracticeAreaForm = ({ item, onSave, saving, iconOptions }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        description: item?.description || '',
        icon: item?.icon || 'gavel',
        link: item?.link || '/contact',
        is_active: item?.is_active ?? true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label">Name *</label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Civil Litigation"
                />
            </div>
            <div>
                <label className="label">Description</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Brief description of this practice area"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Icon</label>
                    <select
                        value={formData.icon}
                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                        className="select"
                    >
                        {iconOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Link</label>
                    <input
                        type="text"
                        value={formData.link}
                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                        className="input"
                        placeholder="/contact"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm text-slate-600">Show on storefront</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Saving...' : 'Save Practice Area'}
                </button>
            </div>
        </form>
    );
};

// Testimonial Form Component
const TestimonialForm = ({ item, onSave, saving }) => {
    const [formData, setFormData] = useState({
        client_name: item?.client_name || '',
        testimonial: item?.testimonial || '',
        case_type: item?.case_type || '',
        rating: item?.rating || 5,
        is_active: item?.is_active ?? true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label">Client Name *</label>
                <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                    className="input"
                    placeholder="e.g., Rajesh Sharma"
                />
            </div>
            <div>
                <label className="label">Testimonial *</label>
                <textarea
                    required
                    value={formData.testimonial}
                    onChange={e => setFormData({ ...formData, testimonial: e.target.value })}
                    className="input"
                    rows={4}
                    placeholder="Client's feedback about your services"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Case Type</label>
                    <input
                        type="text"
                        value={formData.case_type}
                        onChange={e => setFormData({ ...formData, case_type: e.target.value })}
                        className="input"
                        placeholder="e.g., Civil Litigation"
                    />
                </div>
                <div>
                    <label className="label">Rating</label>
                    <select
                        value={formData.rating}
                        onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                        className="select"
                    >
                        {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="is_active_t"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active_t" className="text-sm text-slate-600">Show on storefront</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Saving...' : 'Save Testimonial'}
                </button>
            </div>
        </form>
    );
};

export default LegalCMSManagement;
