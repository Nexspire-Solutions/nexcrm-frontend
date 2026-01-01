import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { FiUpload, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';

export default function MediaLibrary({ onSelect }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(null);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await apiClient.get('/cms/media');
            if (res.data.success) {
                setFiles(res.data.files);
            }
        } catch (error) {
            console.error('Failed to load media');
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await apiClient.post('/cms/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success('File uploaded');
                fetchMedia();
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        toast.success('URL copied!');
        setTimeout(() => setCopiedUrl(null), 2000);

        if (onSelect) onSelect(url);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-t-xl">
                <h3 className="font-bold text-lg">Media Library</h3>
                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="file-upload"
                        className={`btn-primary flex items-center gap-2 px-4 py-2 cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                    >
                        <FiUpload /> {uploading ? 'Uploading...' : 'Upload'}
                    </label>
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto min-h-[400px]">
                {files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <FiUpload size={48} className="mb-4 opacity-20" />
                        <p>No files yet. Upload your first image.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {files.map((file, idx) => (
                            <div key={idx} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => copyToClipboard(file.url)}
                                        className="p-2 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform"
                                        title={onSelect ? "Select Image" : "Copy URL"}
                                    >
                                        {copiedUrl === file.url ? <FiCheck className="text-green-600" /> : <FiCopy />}
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1 truncate px-2">
                                    {file.name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
