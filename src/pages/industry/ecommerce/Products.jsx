import { useState, useEffect } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import ProTable from '../../../components/common/ProTable';
import ProCard from '../../../components/common/ProCard';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../api/axios';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/products');
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        {
            header: 'Image', accessor: 'image', render: (row) => (
                <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {row.image_url ? (
                        <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>
            )
        },
        { header: 'Product Name', accessor: 'name', className: 'font-medium text-slate-900 dark:text-white' },
        { header: 'SKU', accessor: 'sku' },
        { header: 'Price', accessor: 'price', render: (row) => `${row.currency || 'USD'} ${row.price}` },
        {
            header: 'Stock', accessor: 'inventory_count', render: (row) => (
                <span className={row.inventory_count <= (row.low_stock_threshold || 5) ? 'text-rose-500 font-bold' : ''}>
                    {row.inventory_count}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <StatusBadge
                    status={row.status}
                    variant={row.status === 'active' ? 'success' : 'neutral'}
                />
            )
        },
    ];

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Products"
                subtitle="Manage your e-commerce product catalog"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'E-commerce' }, { label: 'Products' }]}
                actions={<button className="btn-primary">Add Product</button>}
            />

            {products.length === 0 ? (
                <ProCard>
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-slate-500 dark:text-slate-400">No products found</p>
                    </div>
                </ProCard>
            ) : (
                <ProCard noPadding>
                    <ProTable columns={columns} data={products} />
                </ProCard>
            )}
        </div>
    );
}
