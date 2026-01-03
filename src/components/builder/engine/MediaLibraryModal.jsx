import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiImage, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

const MediaLibraryModal = ({ isOpen, onClose, onSelect }) => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/cms/assets');
            setAssets(res.data);
        } catch (error) {
            console.error('Error fetching assets:', error);
            // Don't toast here to avoid spamming if API fails silently on mount
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchAssets();
        }
    }, [isOpen, fetchAssets]);

    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);
        const file = acceptedFiles[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await apiClient.post('/cms/assets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Image uploaded!');
            fetchAssets(); // Refresh list
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    }, [fetchAssets]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FiImage className="text-indigo-600" />
                        Media Library
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <FiX className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Upload Area */}
                    <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl h-48 md:h-full flex flex-col items-center justify-center text-center p-6 transition-all cursor-pointer
                                ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800'}
                            `}
                        >
                            <input {...getInputProps()} />
                            {uploading ? (
                                <div className="text-indigo-600 animate-pulse">Uploading...</div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm mb-4 text-indigo-500">
                                        <FiUpload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Click to upload or drag & drop
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2">SVG, PNG, JPG or GIF</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-800">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : assets.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                No images found. Upload one to get started.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {assets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        onClick={() => onSelect(asset.url)}
                                        className="group relative aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all"
                                    >
                                        <img
                                            src={asset.url.startsWith('http') ? asset.url : `http://localhost:3001${asset.url}`}
                                            alt={asset.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                            <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg">Select</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaLibraryModal;
