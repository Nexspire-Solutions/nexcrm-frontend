import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiSave, FiX } from 'react-icons/fi';

export default function BlogBuilder() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        status: 'draft',
        featured_image: ''
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await apiClient.get('/cms/posts');
            setPosts(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (post) => {
        setFormData(post || {
            id: null, title: '', slug: '', excerpt: '', content: '', status: 'draft', featured_image: ''
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.title) return toast.error('Title is required');

            // Auto generate slug if empty
            const dataToSave = { ...formData };
            if (!dataToSave.slug) {
                dataToSave.slug = dataToSave.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }

            if (dataToSave.id) {
                await apiClient.put(`/cms/posts/${dataToSave.id}`, dataToSave);
                toast.success('Post updated');
            } else {
                await apiClient.post('/cms/posts', dataToSave);
                toast.success('Post created');
            }
            setIsEditing(false);
            fetchPosts();
        } catch (error) {
            toast.error('Failed to save post');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await apiClient.delete(`/cms/posts/${id}`);
            toast.success('Post deleted');
            fetchPosts();
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    if (isEditing) {
        return (
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{formData.id ? 'Edit Post' : 'New Post'}</h2>
                    <button onClick={() => setIsEditing(false)} className="btn-ghost"><FiX size={24} /></button>
                </div>

                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Title</label>
                        <input className="form-input w-full" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Slug (URL)</label>
                            <input className="form-input w-full" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Status</label>
                            <select className="form-select w-full" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Featured Image URL</label>
                        <div className="flex gap-2">
                            <input className="form-input flex-1" value={formData.featured_image} onChange={e => setFormData({ ...formData, featured_image: e.target.value })} />
                            {/* Future: Media Library Button */}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Excerpt</label>
                        <textarea className="form-textarea w-full h-20" value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Content (HTML)</label>
                        <textarea className="form-textarea w-full h-64 font-mono text-sm" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setIsEditing(false)} className="btn-ghost">Cancel</button>
                        <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-6 py-2.5"><FiSave /> Save Post</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Blog Posts</h2>
                    <p className="text-slate-500">Manage your news and articles</p>
                </div>
                <button onClick={() => handleEdit(null)} className="btn-primary flex items-center gap-2 px-4 py-2">
                    <FiPlus /> New Post
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="p-4 font-bold text-slate-500">Title</th>
                            <th className="p-4 font-bold text-slate-500">Status</th>
                            <th className="p-4 font-bold text-slate-500">Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {posts.map(post => (
                            <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-4 font-medium">{post.title}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500 text-sm">{new Date(post.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(post)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded"><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-red-50 text-red-600 rounded"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && !loading && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-slate-500">No posts found. Create your first one!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
