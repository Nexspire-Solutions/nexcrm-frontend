import { useState } from 'react';
import ProHeader from '../../../components/common/ProHeader';
import StatusBadge from '../../../components/common/StatusBadge';

const mockProperties = [
    { id: 1, title: 'Modern Downtown Loft', address: '123 Main St, Cityville', price: '$450,000', status: 'available', beds: 2, baths: 2, sqft: 1200, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'Suburban Family Home', address: '456 Oak Ln, Suburbia', price: '$620,000', status: 'pending', beds: 4, baths: 3, sqft: 2500, image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'Luxury Waterfront Villa', address: '789 Ocean Dr, Beachside', price: '$1,250,000', status: 'sold', beds: 5, baths: 4, sqft: 4000, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80' },
    { id: 4, title: 'Cozy City Apartment', address: '101 Pine St, Metro', price: '$325,000', status: 'available', beds: 1, baths: 1, sqft: 800, image: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=400&q=80' },
];

export default function Properties() {
    const [properties] = useState(mockProperties);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ProHeader
                title="Properties"
                subtitle="Manage your real estate inventory"
                breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Real Estate' }, { label: 'Properties' }]}
                actions={<button className="btn-primary">Add Property</button>}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties.map(property => (
                    <div key={property.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                        <div className="h-48 overflow-hidden relative">
                            <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 right-3">
                                <StatusBadge status={property.status} variant={property.status === 'available' ? 'success' : property.status === 'pending' ? 'warning' : 'neutral'} />
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{property.price}</h3>
                            <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{property.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {property.address}
                            </p>
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><span className="text-indigo-600">{property.beds}</span> Beds</span>
                                <span className="flex items-center gap-1"><span className="text-indigo-600">{property.baths}</span> Baths</span>
                                <span className="flex items-center gap-1"><span className="text-indigo-600">{property.sqft}</span> sqft</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
