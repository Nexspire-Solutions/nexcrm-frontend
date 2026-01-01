import React, { useState, useEffect } from 'react';
import apiClient, { tenantUtils } from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

/**
 * Enhanced CMS Management Page
 * Manages: Banners, Homepage Sections, Static Pages, Blog Posts
 */
const CMSManagement = ({ activeTab: routeTab }) => {
    const [activeTab, setActiveTab] = useState(routeTab || 'banners');
    const [banners, setBanners] = useState([]);
    const [sections, setSections] = useState([]);
    const [pages, setPages] = useState([]);
    const [posts, setPosts] = useState([]);
    const [themeConfig, setThemeConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const mediaBaseUrl = tenantUtils.getMediaBaseUrl();

    const tabs = [
        { id: 'banners', label: 'Hero Banners', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'sections', label: 'Homepage Sections', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
        { id: 'pages', label: 'Static Pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'blog', label: 'Blog Posts', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
        { id: 'theme', label: 'Theme Settings', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
        { id: 'seo', label: 'SEO Settings', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' }
    ];

    useEffect(() => {
        if (routeTab) {
            setActiveTab(routeTab);
        }
    }, [routeTab]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'banners') {
                const res = await apiClient.get('/cms/banners');
                setBanners(res.data.data || []);
            } else if (activeTab === 'sections') {
                const res = await apiClient.get('/cms/sections').catch(() => ({ data: { data: [] } }));
                setSections(res.data.data || []);
            } else if (activeTab === 'pages') {
                const res = await apiClient.get('/cms/pages');
                setPages(res.data.data || []);
            } else if (activeTab === 'blog') {
                const res = await apiClient.get('/cms/blog');
                setPosts(res.data.data || []);
            } else if (activeTab === 'theme' || activeTab === 'seo') {
                const res = await apiClient.get('/config/storefront');
                setThemeConfig(res.data || {});
            }
        } catch (error) {
            console.error('CMS fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        try {
            await apiClient.delete(`/cms/${activeTab}/${deleteItem.id}`);
            toast.success('Deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
        setDeleteItem(null);
    };

    const getStatusBadge = (isActive) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-900/20 dark:to-transparent -mx-6 px-6 py-4 rounded-xl">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Content Management
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Customize your storefront banners, sections, pages & blog
                    </p>
                </div>
                <button
                    onClick={() => openModal(activeTab)}
                    className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add {activeTab === 'banners' ? 'Banner' : activeTab === 'sections' ? 'Section' : activeTab === 'pages' ? 'Page' : activeTab === 'blog' ? 'Post' : 'Setting'}
                </button>
            </div>

            {/* Enhanced Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                        </svg>
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <>
                    {/* ========== BANNERS TAB ========== */}
                    {activeTab === 'banners' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">{banners.length} banner(s) configured</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {banners.map(banner => (
                                    <div key={banner.id} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden">
                                            {banner.image ? (
                                                <img
                                                    src={banner.image.startsWith('http') ? banner.image : `${mediaBaseUrl}${banner.image}`}
                                                    alt={banner.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">{getStatusBadge(banner.is_active)}</div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openModal('banners', banner)} className="px-3 py-1.5 bg-white/90 rounded-lg text-sm font-medium text-slate-900 hover:bg-white">Edit</button>
                                                    <button onClick={() => { setDeleteItem(banner); setDeleteConfirm(true); }} className="px-3 py-1.5 bg-red-500/90 rounded-lg text-sm font-medium text-white hover:bg-red-500">Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{banner.title || 'Untitled Banner'}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{banner.subtitle || 'No subtitle'}</p>
                                            <div className="flex items-center justify-between mt-3 text-xs">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">{banner.position || 'home_hero'}</span>
                                                {banner.link && <span className="text-indigo-600 truncate max-w-[100px]">{banner.link}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {banners.length === 0 && (
                                    <div className="col-span-full text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-slate-500 dark:text-slate-400 mb-2">No banners yet</p>
                                        <button onClick={() => openModal('banners')} className="text-indigo-600 font-medium hover:underline">Create your first banner</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========== HOMEPAGE SECTIONS TAB ========== */}
                    {activeTab === 'sections' && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-medium text-amber-800 dark:text-amber-300">Homepage Customization</h4>
                                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                            Configure categories, deals, and collection sections displayed on your storefront homepage.
                                            Changes appear immediately on your store.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section Types */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { type: 'categories', title: 'Category Showcase', desc: 'Display category tiles with images', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                                    { type: 'deals', title: 'Deals & Offers', desc: 'Highlight special promotions', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
                                    { type: 'collections', title: 'Featured Collections', desc: 'Curated product collections', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
                                ].map(section => {
                                    const existing = sections.find(s => s.section_type === section.type);
                                    return (
                                        <div key={section.type} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={section.icon} />
                                                    </svg>
                                                </div>
                                                {existing && getStatusBadge(existing.active)}
                                            </div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white mt-3">{section.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{section.desc}</p>
                                            <button
                                                onClick={() => openModal('sections', { type: section.type, ...existing })}
                                                className="mt-4 w-full btn-secondary text-sm py-2"
                                            >
                                                {existing ? 'Edit Section' : 'Configure'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ========== STATIC PAGES TAB ========== */}
                    {activeTab === 'pages' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Page</th>
                                        <th className="px-6 py-4">URL Slug</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Last Updated</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {pages.map(page => (
                                        <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-900 dark:text-white">{page.title}</p>
                                                {page.meta_title && <p className="text-xs text-slate-400 mt-0.5">SEO: {page.meta_title}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded font-mono">/{page.slug}</code>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(page.is_active)}</td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openModal('pages', page)} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Edit</button>
                                                    <button onClick={() => { setDeleteItem(page); setDeleteConfirm(true); }} className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {pages.length === 0 && (
                                <div className="text-center py-12 text-slate-500">
                                    <p>No static pages yet</p>
                                    <button onClick={() => openModal('pages')} className="text-indigo-600 font-medium hover:underline mt-1">Create your first page</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========== BLOG TAB ========== */}
                    {activeTab === 'blog' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {posts.map(post => (
                                <article key={post.id} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 relative">
                                        {post.featured_image ? (
                                            <img
                                                src={post.featured_image.startsWith('http') ? post.featured_image : `${mediaBaseUrl}${post.featured_image}`}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${post.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                post.status === 'draft' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                                                }`}>
                                                {post.status}
                                            </span>
                                            {post.category && (
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{post.category}</span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{post.title}</h3>
                                        {post.excerpt && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{post.excerpt}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                                            <span className="text-xs text-slate-400">{post.views || 0} views</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => openModal('blog', post)} className="text-indigo-600 text-sm font-medium hover:underline">Edit</button>
                                                <button onClick={() => { setDeleteItem(post); setDeleteConfirm(true); }} className="text-red-600 text-sm font-medium hover:underline">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                            {posts.length === 0 && (
                                <div className="col-span-full text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                    <p className="text-slate-500 dark:text-slate-400 mb-2">No blog posts yet</p>
                                    <button onClick={() => openModal('blog')} className="text-indigo-600 font-medium hover:underline">Write your first post</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========== THEME TAB ========== */}
                    {activeTab === 'theme' && themeConfig && <ThemeSettingsForm initialConfig={themeConfig} mediaBaseUrl={mediaBaseUrl} onSave={fetchData} activeSection="theme" />}
                    {/* ========== SEO TAB ========== */}
                    {activeTab === 'seo' && themeConfig && <ThemeSettingsForm initialConfig={themeConfig} mediaBaseUrl={mediaBaseUrl} onSave={fetchData} activeSection="seo" />}
                </>
            )}

            {/* Unified Modal */}
            {showModal && (
                <CMSModal
                    type={modalType}
                    item={editingItem}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchData(); }}
                    mediaBaseUrl={mediaBaseUrl}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Item"
                message="Are you sure you want to delete this item? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

/**
 * Unified CMS Modal
 */
const CMSModal = ({ type, item, onClose, onSave, mediaBaseUrl }) => {
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({});
    const [sectionItems, setSectionItems] = useState([]);

    // Recommended aspect ratios for different positions
    const aspectRatios = {
        home_hero: { ratio: '16:9', width: 1920, height: 1080, desc: 'Full-width hero slider' },
        home_middle: { ratio: '2:1', width: 1200, height: 600, desc: 'Mid-page promotional' },
        category: { ratio: '3:1', width: 1200, height: 400, desc: 'Category header' },
        sidebar: { ratio: '1:1', width: 400, height: 400, desc: 'Square sidebar ad' },
        popup: { ratio: '4:3', width: 800, height: 600, desc: 'Popup modal' }
    };

    // Handle image upload
    const handleImageUpload = async (e, field = 'image') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'cms');

            const res = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.url) {
                setForm({ ...form, [field]: res.data.url });
                toast.success('Image uploaded');
            }
        } catch (error) {
            toast.error('Upload failed. Try using a URL instead.');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (type === 'banners') {
            setForm({
                title: item?.title || '',
                subtitle: item?.subtitle || '',
                image: item?.image || '',
                link: item?.link || '',
                position: item?.position || 'home_hero',
                cta_text: item?.cta_text || 'Shop Now',
                is_active: item?.is_active !== false
            });
        } else if (type === 'sections') {
            setForm({
                section_type: item?.type || 'categories',
                title: item?.title || '',
                subtitle: item?.subtitle || '',
                active: item?.active !== false
            });
            setSectionItems(item?.items ? JSON.parse(item.items) : []);
        } else if (type === 'pages') {
            setForm({
                title: item?.title || '',
                slug: item?.slug || '',
                content: item?.content || '',
                meta_title: item?.meta_title || '',
                meta_description: item?.meta_description || '',
                is_active: item?.is_active !== false
            });
        } else if (type === 'blog') {
            setForm({
                title: item?.title || '',
                slug: item?.slug || '',
                excerpt: item?.excerpt || '',
                content: item?.content || '',
                featured_image: item?.featured_image || '',
                category: item?.category || '',
                tags: item?.tags || '',
                status: item?.status || 'draft'
            });
        }
    }, [type, item]);

    const handleSubmit = async () => {
        setSaving(true);
        try {
            let endpoint = `/cms/${type}`;
            let payload = { ...form };

            if (type === 'sections') {
                payload.items = JSON.stringify(sectionItems);
            }

            if (item?.id) {
                await apiClient.put(`${endpoint}/${item.id}`, payload);
            } else {
                await apiClient.post(endpoint, payload);
            }
            toast.success('Saved successfully');
            onSave();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const addSectionItem = () => {
        setSectionItems([...sectionItems, { id: Date.now(), label: '', image: '', link: '' }]);
    };

    const updateSectionItem = (index, field, value) => {
        const updated = [...sectionItems];
        updated[index][field] = value;
        setSectionItems(updated);
    };

    const removeSectionItem = (index) => {
        setSectionItems(sectionItems.filter((_, i) => i !== index));
    };

    const getModalTitle = () => {
        const action = item?.id ? 'Edit' : 'Add';
        const labels = { banners: 'Banner', sections: 'Section', pages: 'Page', blog: 'Post' };
        return `${action} ${labels[type] || 'Item'}`;
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={getModalTitle()}
            size={type === 'sections' || type === 'blog' ? 'lg' : 'md'}
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary" disabled={saving}>Cancel</button>
                    <button onClick={handleSubmit} className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </>
            }
        >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* ========== BANNER FORM ========== */}
                {type === 'banners' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Title</label>
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Summer Sale" />
                            </div>
                            <div>
                                <label className="label">Subtitle</label>
                                <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input" placeholder="Up to 50% Off" />
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-3">
                            <label className="label">Banner Image</label>

                            {/* Aspect Ratio Guidance */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-800 dark:text-blue-300">
                                            Recommended: {aspectRatios[form.position]?.ratio || '16:9'} ratio
                                        </p>
                                        <p className="text-blue-700 dark:text-blue-400 text-xs mt-0.5">
                                            {aspectRatios[form.position]?.width || 1920} x {aspectRatios[form.position]?.height || 1080}px
                                            <span className="ml-1 opacity-75">({aspectRatios[form.position]?.desc || 'Hero slider'})</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Upload or URL Options */}
                            <div className="flex gap-2">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                                    ${uploading ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'image')}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <>
                                            <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            <span className="text-sm text-indigo-600 dark:text-indigo-400">Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Click to upload image</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            {/* OR URL Input */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 uppercase">or paste URL</span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                            </div>
                            <input
                                type="text"
                                value={form.image}
                                onChange={(e) => setForm({ ...form, image: e.target.value })}
                                className="input"
                                placeholder="https://images.unsplash.com/..."
                            />

                            {/* Image Preview */}
                            {form.image && (
                                <div className="relative group">
                                    <img
                                        src={form.image.startsWith('http') ? form.image : `${mediaBaseUrl}${form.image}`}
                                        alt="Preview"
                                        className="w-full h-40 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, image: '' })}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Link URL</label>
                                <input type="text" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input" placeholder="/products" />
                            </div>
                            <div>
                                <label className="label">CTA Button Text</label>
                                <input type="text" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="input" placeholder="Shop Now" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Position</label>
                                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="select">
                                    <option value="home_hero">Home Hero (Main Slider)</option>
                                    <option value="home_middle">Home Middle Section</option>
                                    <option value="category">Category Page</option>
                                    <option value="sidebar">Sidebar</option>
                                    <option value="popup">Popup Banner</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
                                    <span className="text-sm font-medium">Active</span>
                                </label>
                            </div>
                        </div>
                    </>
                )}

                {/* ========== SECTIONS FORM ========== */}
                {type === 'sections' && (
                    <>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-400">
                            Configure the <strong className="text-slate-900 dark:text-white capitalize">{form.section_type}</strong> section items that appear on your storefront homepage.
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Section Title</label>
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Shop by Category" />
                            </div>
                            <div>
                                <label className="label">Subtitle</label>
                                <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input" placeholder="Find what you love" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="label mb-0">Section Items</label>
                            <button type="button" onClick={addSectionItem} className="text-sm text-indigo-600 font-medium hover:underline">+ Add Item</button>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {sectionItems.map((item, idx) => (
                                <div key={item.id || idx} className="flex gap-2 items-start p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex-1 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" value={item.label} onChange={(e) => updateSectionItem(idx, 'label', e.target.value)} className="input text-sm" placeholder="Label (e.g., Men)" />
                                            <input type="text" value={item.link} onChange={(e) => updateSectionItem(idx, 'link', e.target.value)} className="input text-sm" placeholder="Link (e.g., /products?cat=men)" />
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input type="text" value={item.image} onChange={(e) => updateSectionItem(idx, 'image', e.target.value)} className="input text-sm flex-1" placeholder="Image URL or upload" />
                                            <label className={`shrink-0 flex items-center gap-1.5 px-3 py-2 border rounded-lg cursor-pointer text-sm transition-colors
                                                ${uploading ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setUploading(true);
                                                        try {
                                                            const formData = new FormData();
                                                            formData.append('file', file);
                                                            formData.append('folder', 'cms');
                                                            const res = await apiClient.post('/upload', formData, {
                                                                headers: { 'Content-Type': 'multipart/form-data' }
                                                            });
                                                            if (res.data.url) {
                                                                updateSectionItem(idx, 'image', res.data.url);
                                                                toast.success('Image uploaded');
                                                            }
                                                        } catch (error) {
                                                            toast.error('Upload failed');
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }}
                                                    className="hidden"
                                                    disabled={uploading}
                                                />
                                                {uploading ? (
                                                    <svg className="w-4 h-4 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                                <span className="text-slate-600 dark:text-slate-400">Upload</span>
                                            </label>
                                        </div>
                                        {item.image && (
                                            <img src={item.image.startsWith('http') ? item.image : `${mediaBaseUrl}${item.image}`} alt="" className="h-12 w-20 object-cover rounded" onError={(e) => e.target.style.display = 'none'} />
                                        )}
                                    </div>
                                    <button type="button" onClick={() => removeSectionItem(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {sectionItems.length === 0 && (
                                <p className="text-center py-4 text-slate-400 text-sm">No items yet. Click "Add Item" above.</p>
                            )}
                        </div>
                        <div className="flex items-center pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
                                <span className="text-sm font-medium">Active</span>
                            </label>
                        </div>
                    </>
                )}

                {/* ========== PAGES FORM ========== */}
                {type === 'pages' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Page Title *</label>
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="About Us" />
                            </div>
                            <div>
                                <label className="label">URL Slug *</label>
                                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="input" placeholder="about-us" />
                            </div>
                        </div>
                        <div>
                            <label className="label">Page Content (HTML supported)</label>
                            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input font-mono text-sm" rows="10" placeholder="<h2>About Our Company</h2><p>...</p>" />
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">SEO Settings</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="label">Meta Title</label>
                                    <input type="text" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className="input" placeholder="About Us | Your Store Name" />
                                </div>
                                <div>
                                    <label className="label">Meta Description</label>
                                    <textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="input" rows="2" placeholder="Learn about our company, mission, and values..." />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
                                <span className="text-sm font-medium">Published</span>
                            </label>
                        </div>
                    </>
                )}

                {/* ========== BLOG FORM ========== */}
                {type === 'blog' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Post Title *</label>
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="How to Style Your Summer Wardrobe" />
                            </div>
                            <div>
                                <label className="label">URL Slug *</label>
                                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="input" placeholder="summer-wardrobe-tips" />
                            </div>
                        </div>
                        <div>
                            <label className="label">Featured Image URL</label>
                            <input type="text" value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} className="input" placeholder="https://..." />
                            {form.featured_image && (
                                <img src={form.featured_image.startsWith('http') ? form.featured_image : `${mediaBaseUrl}${form.featured_image}`} alt="Preview" className="mt-2 h-24 w-auto rounded-lg object-cover" />
                            )}
                        </div>
                        <div>
                            <label className="label">Excerpt</label>
                            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input" rows="2" placeholder="Short summary for listing pages..." />
                        </div>
                        <div>
                            <label className="label">Content (HTML supported)</label>
                            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input font-mono text-sm" rows="8" placeholder="<p>Your blog post content...</p>" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="label">Category</label>
                                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" placeholder="Fashion" />
                            </div>
                            <div>
                                <label className="label">Tags</label>
                                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="summer, style, tips" />
                            </div>
                            <div>
                                <label className="label">Status</label>
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

/**
 * Theme Settings Form
 */
const ThemeSettingsForm = ({ initialConfig, mediaBaseUrl, onSave, activeSection }) => {
    // Parse initial JSON fields
    const parseJSON = (str, fallback = []) => {
        try {
            return str ? JSON.parse(str) : fallback;
        } catch (e) {
            return fallback;
        }
    };

    // Helper to parse boolean from string/number/boolean
    const parseBoolean = (val, defaultVal = true) => {
        if (val === undefined || val === null) return defaultVal;
        if (val === 'true' || val === '1' || val === 1 || val === true) return true;
        if (val === 'false' || val === '0' || val === 0 || val === false) return false;
        return defaultVal;
    };

    const [form, setForm] = useState({
        ...initialConfig,
        logo_width: initialConfig.logo_width || 120,
        logo_enabled: parseBoolean(initialConfig.logo_enabled, true),
        font_family: initialConfig.font_family || 'Inter, sans-serif',
        text_color: initialConfig.text_color || '#374151',
        heading_color: initialConfig.heading_color || '#111827',
        link_color: initialConfig.link_color || '#2563eb',
        meta_title: initialConfig.meta_title || '',
        meta_description: initialConfig.meta_description || '',
        meta_keywords: initialConfig.meta_keywords || '',
        og_image: initialConfig.og_image || '',
        favicon: initialConfig.favicon || '',
        ga_id: initialConfig.ga_id || '',
        pixel_id: initialConfig.pixel_id || '',
        header_scripts: initialConfig.header_scripts || '',
        footer_scripts: initialConfig.footer_scripts || '',
        store_locations: parseJSON(initialConfig.store_locations),
        social_links: parseJSON(initialConfig.social_links)
    });

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Initial parsing check when config changes (if parent refreshes)
    useEffect(() => {
        setForm(prev => ({
            ...prev,
            ...initialConfig,
            store_locations: parseJSON(initialConfig.store_locations),
            social_links: parseJSON(initialConfig.social_links)
        }));
    }, [initialConfig]);

    // Handle image upload
    const handleImageUpload = async (e, field) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'theme');

            const res = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.url) {
                setForm(prev => ({ ...prev, [field]: res.data.url }));
                toast.success('Image uploaded');
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // --- Dynamic List Handlers ---

    // Locations
    const addLocation = () => {
        setForm(prev => ({
            ...prev,
            store_locations: [
                ...prev.store_locations,
                { id: Date.now(), name: '', address: '', phone: '', email: '', active: true }
            ]
        }));
    };

    const updateLocation = (index, field, value) => {
        const updated = [...form.store_locations];
        updated[index][field] = value;
        setForm({ ...form, store_locations: updated });
    };

    const removeLocation = (index) => {
        setForm({ ...form, store_locations: form.store_locations.filter((_, i) => i !== index) });
    };

    // Socials
    const addSocial = () => {
        setForm(prev => ({
            ...prev,
            social_links: [
                ...prev.social_links,
                { id: Date.now(), platform: 'facebook', url: '', active: true }
            ]
        }));
    };

    const updateSocial = (index, field, value) => {
        const updated = [...form.social_links];
        updated[index][field] = value;
        setForm({ ...form, social_links: updated });
    };

    const removeSocial = (index) => {
        setForm({ ...form, social_links: form.social_links.filter((_, i) => i !== index) });
    };


    const handleSubmit = async () => {
        setSaving(true);
        try {
            // Prepare payload: stringify JSON fields
            const payload = {
                ...form,
                store_locations: JSON.stringify(form.store_locations),
                social_links: JSON.stringify(form.social_links)
            };

            await apiClient.put('/config/storefront', payload);
            toast.success('Theme settings saved');
            onSave();
        } catch (error) {
            toast.error('Failed to save settings');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const socialPlatforms = [
        { id: 'facebook', label: 'Facebook' },
        { id: 'instagram', label: 'Instagram' },
        { id: 'twitter', label: 'Twitter/X' },
        { id: 'linkedin', label: 'LinkedIn' },
        { id: 'youtube', label: 'YouTube' },
        { id: 'tiktok', label: 'TikTok' },
        { id: 'pinterest', label: 'Pinterest' }
    ];



    const fontOptions = [
        { id: 'Inter, sans-serif', label: 'Inter (Clean Modern)' },
        { id: 'Roboto, sans-serif', label: 'Roboto (Google Standard)' },
        { id: '\'Open Sans\', sans-serif', label: 'Open Sans (Friendly)' },
        { id: 'Lato, sans-serif', label: 'Lato (Professional)' },
        { id: 'Montserrat, sans-serif', label: 'Montserrat (Bold/Geometric)' },
        { id: '\'Playfair Display\', serif', label: 'Playfair Display (Elegant Serif)' },
        { id: 'ui-sans-serif, system-ui, sans-serif', label: 'System Default' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            {/* Branding Settings (Theme Tab) */}
            {activeSection === 'theme' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Brand Identity
                        </h3>

                        {/* ... Logo/Name form content ... */}
                        <div className="space-y-4">
                            <div>
                                <label className="label">Store Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.company_name || ''}
                                    onChange={e => setForm({ ...form, company_name: e.target.value })}
                                    placeholder="My Amazing Store"
                                />
                            </div>

                            <div>
                                <label className="label">Store Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600 relative">
                                        {form.logo ? (
                                            <img
                                                src={form.logo.startsWith('http') ? form.logo : `${mediaBaseUrl}${form.logo}`}
                                                alt="Logo"
                                                className={`object-contain p-1 ${!form.logo_enabled ? 'opacity-25 grayscale' : ''}`}
                                                style={{ width: `${Math.min(form.logo_width || 100, 90)}px` }}
                                            />
                                        ) : (
                                            <span className="text-xs text-slate-400">No Logo</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <label className="btn-secondary btn-sm cursor-pointer inline-flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                {form.logo ? 'Change Logo' : 'Upload Logo'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => handleImageUpload(e, 'logo')}
                                                    disabled={uploading}
                                                />
                                            </label>

                                            {form.logo && (
                                                <button
                                                    onClick={() => setForm({ ...form, logo: '' })}
                                                    className="btn-danger btn-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded border border-red-200"
                                                    title="Remove Logo"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Logo</span>
                                                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.logo_enabled}
                                                        onChange={e => setForm({ ...form, logo_enabled: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-indigo-600 transition-colors"></div>
                                                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                                                </div>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Logo Size (Width: {form.logo_width}px)</label>
                                            <input
                                                type="range"
                                                min="30"
                                                max="300"
                                                value={form.logo_width || 120}
                                                onChange={e => setForm({ ...form, logo_width: parseInt(e.target.value) })}
                                                className="w-full"
                                                disabled={!form.logo_enabled}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            Typography & Colors
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Font Family</label>
                                <select
                                    value={form.font_family || 'Inter, sans-serif'}
                                    onChange={e => setForm({ ...form, font_family: e.target.value })}
                                    className="select"
                                >
                                    {fontOptions.map(font => (
                                        <option key={font.id} value={font.id}>{font.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="label text-xs">Primary</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={form.primary_color || '#3b82f6'} onChange={e => setForm({ ...form, primary_color: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                                        <input type="text" value={form.primary_color || '#3b82f6'} onChange={e => setForm({ ...form, primary_color: e.target.value })} className="input py-1 text-sm font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label text-xs">Secondary</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={form.secondary_color || '#10b981'} onChange={e => setForm({ ...form, secondary_color: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                                        <input type="text" value={form.secondary_color || '#10b981'} onChange={e => setForm({ ...form, secondary_color: e.target.value })} className="input py-1 text-sm font-mono" />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-700 my-2" />

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="label text-xs">Body Text</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={form.text_color || '#374151'} onChange={e => setForm({ ...form, text_color: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                                        <input type="text" value={form.text_color || '#374151'} onChange={e => setForm({ ...form, text_color: e.target.value })} className="input py-1 text-sm font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label text-xs">Headings & Titles</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={form.heading_color || '#111827'} onChange={e => setForm({ ...form, heading_color: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                                        <input type="text" value={form.heading_color || '#111827'} onChange={e => setForm({ ...form, heading_color: e.target.value })} className="input py-1 text-sm font-mono" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label text-xs">Links & Buttons</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={form.link_color || '#2563eb'} onChange={e => setForm({ ...form, link_color: e.target.value })} className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0" />
                                        <input type="text" value={form.link_color || '#2563eb'} onChange={e => setForm({ ...form, link_color: e.target.value })} className="input py-1 text-sm font-mono" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Locations */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Store Locations
                        </h3>

                        {/* General Support (Global) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div>
                                <label className="label text-xs">General Support Email</label>
                                <input type="email" value={form.support_email || ''} onChange={(e) => setForm({ ...form, support_email: e.target.value })} className="input text-sm" placeholder="support@store.com" />
                            </div>
                            <div>
                                <label className="label text-xs">General Support Phone</label>
                                <input type="text" value={form.support_phone || ''} onChange={(e) => setForm({ ...form, support_phone: e.target.value })} className="input text-sm" placeholder="+1..." />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {form.store_locations.map((loc, idx) => (
                                <div key={idx} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg relative group">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <input type="text" value={loc.name} onChange={(e) => updateLocation(idx, 'name', e.target.value)} className="input text-sm font-medium" placeholder="Location Name (e.g. HQ)" />
                                        <div className="flex items-center justify-end gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={loc.active} onChange={(e) => updateLocation(idx, 'active', e.target.checked)} className="rounded text-indigo-600" />
                                                <span className={`text-xs font-medium ${loc.active ? 'text-emerald-600' : 'text-slate-400'}`}>{loc.active ? 'Active' : 'Inactive'}</span>
                                            </label>
                                            <button onClick={() => removeLocation(idx)} className="text-red-500 hover:text-red-600 p-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <input type="text" value={loc.address} onChange={(e) => updateLocation(idx, 'address', e.target.value)} className="input text-sm mb-2" placeholder="Full Address" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" value={loc.phone} onChange={(e) => updateLocation(idx, 'phone', e.target.value)} className="input text-sm" placeholder="Phone (Optional)" />
                                        <input type="text" value={loc.email} onChange={(e) => updateLocation(idx, 'email', e.target.value)} className="input text-sm" placeholder="Email (Optional)" />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addLocation} className="btn-secondary w-full text-sm py-2 border-dashed">+ Add Location</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Column */}
            {activeSection === 'theme' && (
                <div className="space-y-6">
                    {/* Social Media */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Social Profiles
                        </h3>

                        <div className="space-y-3">
                            {form.social_links.map((social, idx) => (
                                <div key={idx} className="flex gap-3 items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg group">
                                    <select value={social.platform} onChange={(e) => updateSocial(idx, 'platform', e.target.value)} className="select text-sm w-32 shrink-0">
                                        {socialPlatforms.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                    </select>
                                    <input type="text" value={social.url} onChange={(e) => updateSocial(idx, 'url', e.target.value)} className="input text-sm flex-1" placeholder="https://..." />

                                    <label className="cursor-pointer" title="Toggle visibility">
                                        <input type="checkbox" checked={social.active} onChange={(e) => updateSocial(idx, 'active', e.target.checked)} className="rounded text-indigo-600" />
                                    </label>

                                    <button onClick={() => removeSocial(idx)} className="text-red-400 hover:text-red-500 p-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addSocial} className="btn-secondary w-full text-sm py-2 border-dashed">+ Add Social Profile</button>
                        </div>
                    </div>

                    {/* Hero Settings */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Global Hero (Fallback)
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Default hero content when no banners are active.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Hero Title</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.hero_title || ''}
                                    onChange={e => setForm({ ...form, hero_title: e.target.value })}
                                    placeholder="Welcome to our store"
                                />
                            </div>
                            <div>
                                <label className="label">Hero Subtitle</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.hero_subtitle || ''}
                                    onChange={e => setForm({ ...form, hero_subtitle: e.target.value })}
                                    placeholder="Discover amazing products"
                                />
                            </div>
                            <div>
                                <label className="label">Hero Image</label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input flex-1"
                                            value={form.hero_image || ''}
                                            onChange={e => setForm({ ...form, hero_image: e.target.value })}
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                        <label className="btn-secondary btn-sm cursor-pointer whitespace-nowrap">
                                            Upload
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => handleImageUpload(e, 'hero_image')}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                    {form.hero_image && (
                                        <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                                            <img
                                                src={form.hero_image.startsWith('http') ? form.hero_image : `${mediaBaseUrl}${form.hero_image}`}
                                                alt="Hero Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => setForm({ ...form, hero_image: '' })}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEO Settings (SEO Tab) */}
            {activeSection === 'seo' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        SEO Settings
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="label">Meta Title</label>
                            <input
                                type="text"
                                className="input"
                                value={form.meta_title || ''}
                                onChange={e => setForm({ ...form, meta_title: e.target.value })}
                                placeholder="Store Name | Best Products Online"
                            />
                        </div>
                        <div>
                            <label className="label">Meta Description</label>
                            <textarea
                                className="input h-24"
                                value={form.meta_description || ''}
                                onChange={e => setForm({ ...form, meta_description: e.target.value })}
                                placeholder="A brief description of your store for search engines..."
                            />
                        </div>
                        <div>
                            <label className="label">Meta Keywords</label>
                            <input
                                type="text"
                                className="input"
                                value={form.meta_keywords || ''}
                                onChange={e => setForm({ ...form, meta_keywords: e.target.value })}
                                placeholder="fashion, electronics, sale, best prices"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Favicon */}
                            <div>
                                <label className="label">Favicon</label>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="w-24 h-24 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden relative group shrink-0">
                                        {form.favicon ? (
                                            <a href={form.favicon.startsWith('http') ? form.favicon : `${mediaBaseUrl}${form.favicon}`} target="_blank" rel="noopener noreferrer" className="cursor-zoom-in">
                                                <img
                                                    src={form.favicon.startsWith('http') ? form.favicon : `${mediaBaseUrl}${form.favicon}`}
                                                    alt="Favicon"
                                                    className="w-8 h-8 object-contain"
                                                />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400">Icon</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {form.favicon ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-500 truncate">{form.favicon.split('/').pop()}</span>
                                                <div className="flex gap-2">
                                                    <label className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">
                                                        Change
                                                        <input type="file" accept="image/x-icon,image/png" className="hidden" onChange={e => handleImageUpload(e, 'favicon')} />
                                                    </label>
                                                    <button type="button" onClick={() => setForm({ ...form, favicon: '' })} className="text-xs text-red-500 font-medium hover:underline">
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="btn-secondary btn-sm cursor-pointer whitespace-nowrap inline-flex">
                                                Upload Icon
                                                <input type="file" accept="image/x-icon,image/png" className="hidden" onChange={e => handleImageUpload(e, 'favicon')} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* OG Image */}
                            <div>
                                <label className="label">OG Image (Social Share)</label>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="w-24 h-24 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 overflow-hidden relative group shrink-0">
                                        {form.og_image ? (
                                            <a href={form.og_image.startsWith('http') ? form.og_image : `${mediaBaseUrl}${form.og_image}`} target="_blank" rel="noopener noreferrer" className="cursor-zoom-in w-full h-full block">
                                                <img
                                                    src={form.og_image.startsWith('http') ? form.og_image : `${mediaBaseUrl}${form.og_image}`}
                                                    alt="OG Image"
                                                    className="w-full h-full object-cover"
                                                />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400">Image</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {form.og_image ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-500 truncate">{form.og_image.split('/').pop()}</span>
                                                <div className="flex gap-2">
                                                    <label className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">
                                                        Change
                                                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'og_image')} />
                                                    </label>
                                                    <button type="button" onClick={() => setForm({ ...form, og_image: '' })} className="text-xs text-red-500 font-medium hover:underline">
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="btn-secondary btn-sm cursor-pointer whitespace-nowrap inline-flex">
                                                Upload Image
                                                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'og_image')} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Analytics & Integrations */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm my-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Analytics & Integrations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Google Analytics Measurement ID</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.ga_id || ''}
                                    onChange={e => setForm({ ...form, ga_id: e.target.value })}
                                    placeholder="G-XXXXXXXXXX"
                                />
                                <span className="text-xs text-slate-500 mt-1 block">Format: G-XXXXXXXXXX</span>
                            </div>
                            <div>
                                <label className="label">Meta Pixel ID</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.pixel_id || ''}
                                    onChange={e => setForm({ ...form, pixel_id: e.target.value })}
                                    placeholder="123456789012345"
                                />
                                <span className="text-xs text-slate-500 mt-1 block">Your Pixel ID number</span>
                            </div>
                        </div>
                    </div>

                    {/* Custom Scripts */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Custom Scripts
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Header Scripts (Before &lt;/head&gt;)</label>
                                <textarea
                                    className="input font-mono text-sm h-32"
                                    value={form.header_scripts || ''}
                                    onChange={e => setForm({ ...form, header_scripts: e.target.value })}
                                    placeholder="<script>...</script>"
                                />
                            </div>
                            <div>
                                <label className="label">Footer Scripts (Before &lt;/body&gt;)</label>
                                <textarea
                                    className="input font-mono text-sm h-32"
                                    value={form.footer_scripts || ''}
                                    onChange={e => setForm({ ...form, footer_scripts: e.target.value })}
                                    placeholder="<script>...</script>"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="col-span-1 lg:col-span-2 flex justify-end pt-4">
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="btn-primary w-full md:w-auto"
                >
                    {saving ? (
                        <>
                            <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Saving Changes...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Theme Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CMSManagement;
