import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiPlus, FiClock, FiGlobe, FiMoreVertical, FiEdit3, FiTrash2 } from 'react-icons/fi';
import apiClient from '../../api/axios';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await apiClient.get('/cms/pages');
                setProjects(res.data.data || []);
            } catch (error) {
                console.error('Failed to load projects', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header / Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
                    <p className="text-indigo-100 max-w-lg mb-6">Return to your recent projects or start building something amazing today.</p>
                    <Link
                        to="/cms/builder/new"
                        className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                        <FiPlus /> Create New Site
                    </Link>
                </div>
            </div>

            {/* Recent Projects */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Projects</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-800 h-64 rounded-xl animate-pulse shadow-sm border border-slate-100 dark:border-slate-700"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* New Project Card */}
                        <Link
                            to="/cms/builder/new"
                            className="group flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer h-full min-h-[16rem]"
                        >
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-indigo-600">
                                <FiPlus className="text-3xl" />
                            </div>
                            <span className="font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600">Create New Project</span>
                        </Link>

                        {projects.map(project => (
                            <div key={project.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                {/* Preview Thumbnail (mock) */}
                                <div className="h-40 bg-slate-100 dark:bg-slate-900 relative group overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-6xl font-black opacity-10 select-none">
                                        PREVIEW
                                    </div>
                                    {/* Quick Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <Link
                                            to={`/cms/builder/${project.slug}`}
                                            className="p-3 bg-white text-indigo-600 rounded-full hover:scale-110 transition-transform shadow-lg"
                                            title="Edit Site"
                                        >
                                            <FiEdit3 />
                                        </Link>
                                        <a
                                            href={`/page/${project.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-3 bg-white text-emerald-600 rounded-full hover:scale-110 transition-transform shadow-lg"
                                            title="View Live"
                                        >
                                            <FiGlobe />
                                        </a>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">{project.title}</h3>
                                        <button className="text-slate-400 hover:text-slate-600 p-1">
                                            <FiMoreVertical />
                                        </button>
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-1">
                                            <FiClock />
                                            <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full ${project.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {project.is_active ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
