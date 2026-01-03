import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AtomDynamicList = ({ dataSource, limit = 4, title, layout = 'grid' }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock data for defaults
    const MOCK_DATA = {
        products: [
            { id: 1, name: 'Sample Product 1', price: 99.99, images: ['https://via.placeholder.com/300'] },
            { id: 2, name: 'Sample Product 2', price: 149.99, images: ['https://via.placeholder.com/300'] },
            { id: 3, name: 'Sample Product 3', price: 199.99, images: ['https://via.placeholder.com/300'] },
            { id: 4, name: 'Sample Product 4', price: 299.99, images: ['https://via.placeholder.com/300'] },
        ],

        categories: [
            { id: 1, name: 'Category A', image: 'https://via.placeholder.com/300' },
            { id: 2, name: 'Category B', image: 'https://via.placeholder.com/300' },
            { id: 3, name: 'Category C', image: 'https://via.placeholder.com/300' },
        ]
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!dataSource) return;
            setLoading(true);
            try {
                let url;
                if (dataSource === 'products') url = `/api/public/products?limit=${limit}`;
                else if (dataSource === 'categories') url = `/api/public/categories?limit=${limit}`;

                if (url) {
                    const response = await axios.get(import.meta.env.VITE_API_URL + url);

                    if (dataSource === 'products') setData(response.data.products || []);
                    else if (dataSource === 'categories') setData(response.data.categories || []);
                }
            } catch (err) {
                console.warn(`Failed to fetch ${dataSource}, using mock`, err);
                setData(MOCK_DATA[dataSource] || []);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dataSource, limit]);

    if (!dataSource) return <div className="p-4 border border-dashed text-slate-400 bg-slate-50 text-center">Select Data Source</div>;

    return (
        <div className="w-full">
            {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[...Array(Number(limit))].map((_, i) => (
                        <div key={i} className="bg-slate-200 h-64 rounded-xl"></div>
                    ))}
                </div>
            ) : (
                <div className={`grid gap-6 ${layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                    {data.slice(0, limit).map((item) => (
                        <Card key={item.id} item={item} type={dataSource} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Card = ({ item, type }) => {
    // Helper to get image URL safely
    const getImage = () => {
        if (typeof item.images === 'string') return item.images;
        if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
        if (item.image) return item.image;
        if (item.featured_image) return item.featured_image;
        return 'https://via.placeholder.com/300';
    };

    const getTitle = () => item.name || item.title;
    const getSubtitle = () => {
        if (type === 'products') return item.price ? `$${item.price}` : null;
        return null;
    };

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 group">
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                <img
                    src={getImage()}
                    alt={getTitle()}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg text-slate-800 mb-1">{getTitle()}</h3>
                {getSubtitle() && <p className="text-slate-500 text-sm">{getSubtitle()}</p>}

                {type === 'products' && (
                    <button className="mt-4 w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                        Add to Cart
                    </button>
                )}

            </div>
        </div>
    );
};

export default AtomDynamicList;
