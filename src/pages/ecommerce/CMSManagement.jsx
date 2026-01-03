import React, { useState, useEffect } from 'react';
import apiClient, { tenantUtils } from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

/**
 * CMS Management Page - Banners, Pages, Blog
 */
const CMSManagement = () => {
    const [activeTab, setActiveTab] = useState('banners');
    const [banners, setBanners] = useState([]);
    const [pages, setPages] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [showPageModal, setShowPageModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const mediaBaseUrl = tenantUtils.getMediaBaseUrl();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'banners') {
                const res = await apiClient.get('/cms/banners');
                setBanners(res.data.data || []);
            } else if (activeTab === 'pages') {
                const res = await apiClient.get('/cms/pages');
                setPages(res.data.data || []);
            } else if (activeTab === 'blog') {
                const res = await apiClient.get('/cms/blog');
                setPosts(res.data.data || []);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!confirm('Delete this banner?')) return;
        try {
            await apiClient.delete(`/cms/banners/${id}`);
            toast.success('Banner deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const tabs = [
        { id: 'banners', label: 'Banners' },
        { id: 'pages', label: 'Static Pages' },
        { id: 'blog', label: 'Blog' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent -mx-6 px-6 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Content Management</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage banners, pages, and blog posts</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        if (activeTab === 'banners') setShowBannerModal(true);
                        if (activeTab === 'pages') setShowPageModal(true);
                    }}
                    className="btn-primary flex items-center gap-2 shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add {activeTab === 'banners' ? 'Banner' : activeTab === 'pages' ? 'Page' : 'Post'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    {/* Banners Tab */}
                    {activeTab === 'banners' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {banners.map(banner => (
                                <div key={banner.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative">
                                        {banner.image && (
                                            <img
                                                src={banner.image.startsWith('http') ? banner.image : `${mediaBaseUrl}${banner.image}`}
                                                alt={banner.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${banner.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                                            }`}>
                                            {banner.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{banner.title || 'Untitled'}</h3>
                                        <p className="text-sm text-slate-500 mt-1">{banner.subtitle || 'No subtitle'}</p>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-xs text-slate-400">{banner.position}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingItem(banner); setShowBannerModal(true); }} className="text-indigo-600 text-sm">Edit</button>
                                                <button onClick={() => handleDeleteBanner(banner.id)} className="text-red-600 text-sm">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {banners.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No banners yet. Create your first banner!
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pages Tab */}
                    {activeTab === 'pages' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Slug</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Last Updated</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {pages.map(page => (
                                        <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{page.title}</td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">/{page.slug}</code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${page.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {page.is_active ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {new Date(page.updated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => { setEditingItem(page); setShowPageModal(true); }} className="text-indigo-600 text-sm">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {pages.length === 0 && (
                                <div className="text-center py-12 text-slate-500">No static pages yet</div>
                            )}
                        </div>
                    )}

                    {/* Blog Tab */}
                    {activeTab === 'blog' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {posts.map(post => (
                                <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="aspect-video bg-slate-100 dark:bg-slate-700">
                                        {post.featured_image && (
                                            <img
                                                src={post.featured_image.startsWith('http') ? post.featured_image : `${mediaBaseUrl}${post.featured_image}`}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${post.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                                                post.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>
                                                {post.status}
                                            </span>
                                            {post.category && (
                                                <span className="text-xs text-slate-500">{post.category}</span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{post.title}</h3>
                                        {post.excerpt && (
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{post.excerpt}</p>
                                        )}
                                        <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
                                            <span>{post.firstName} {post.lastName}</span>
                                            <span>{post.views || 0} views</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {posts.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No blog posts yet
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Banner Modal */}
            {showBannerModal && (
                <BannerModal
                    banner={editingItem}
                    onClose={() => setShowBannerModal(false)}
                    onSave={() => { setShowBannerModal(false); fetchData(); }}
                />
            )}

            {/* Page Modal */}
            {showPageModal && (
                <PageModal
                    page={editingItem}
                    onClose={() => setShowPageModal(false)}
                    onSave={() => { setShowPageModal(false); fetchData(); }}
                />
            )}
        </div>
    );
};

/**
 * Banner Modal
 */
const BannerModal = ({ banner, onClose, onSave }) => {
    const [form, setForm] = useState({
        title: banner?.title || '',
        subtitle: banner?.subtitle || '',
        image: banner?.image || '',
        link: banner?.link || '',
        position: banner?.position || 'home_hero',
        is_active: banner?.is_active !== false
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            if (banner) {
                await apiClient.put(`/cms/banners/${banner.id}`, form);
            } else {
                await apiClient.post('/cms/banners', form);
            }
            toast.success('Banner saved');
            onSave();
        } catch (error) {
            toast.error('Failed to save banner');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={banner ? 'Edit Banner' : 'Add Banner'}
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="label">Title</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
                </div>
                <div>
                    <label className="label">Subtitle</label>
                    <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input" />
                </div>
                <div>
                    <label className="label">Image URL</label>
                    <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" placeholder="/uploads/banners/..." />
                </div>
                <div>
                    <label className="label">Link</label>
                    <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input" placeholder="/products" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Position</label>
                        <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="select">
                            <option value="home_hero">Home Hero</option>
                            <option value="home_middle">Home Middle</option>
                            <option value="category">Category Page</option>
                            <option value="sidebar">Sidebar</option>
                        </select>
                    </div>
                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                            <span className="text-sm">Active</span>
                        </label>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

/**
 * Page Modal
 */
const PageModal = ({ page, onClose, onSave }) => {
    const [form, setForm] = useState({
        title: page?.title || '',
        slug: page?.slug || '',
        content: page?.content || '',
        meta_title: page?.meta_title || '',
        meta_description: page?.meta_description || '',
        is_active: page?.is_active !== false
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (!form.title || !form.slug) {
            toast.error('Title and slug are required');
            return;
        }
        setSaving(true);
        try {
            if (page) {
                await apiClient.put(`/cms/pages/${page.id}`, form);
            } else {
                await apiClient.post('/cms/pages', form);
            }
            toast.success('Page saved');
            onSave();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save page');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={page ? 'Edit Page' : 'Add Page'}
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">Title *</label>
                        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
                    </div>
                    <div>
                        <label className="label">Slug *</label>
                        <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="input" />
                    </div>
                </div>
                <div>
                    <label className="label">Content</label>
                    <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input" rows="8" />
                </div>
                <div>
                    <label className="label">Meta Title</label>
                    <input type="text" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className="input" />
                </div>
                <div>
                    <label className="label">Meta Description</label>
                    <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="input" rows="2" />
                </div>
                <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                        <span className="text-sm">Published</span>
                    </label>
                </div>
            </div>
        </Modal>
    );
};

export default CMSManagement;
