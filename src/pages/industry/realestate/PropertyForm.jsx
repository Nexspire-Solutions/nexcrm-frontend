/**
 * Property Form - Real Estate Module
 * Comprehensive property add/edit form with all fields
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiChevronLeft, FiUpload, FiX, FiPlus, FiMapPin, FiHome, FiDollarSign, FiInfo } from 'react-icons/fi';
import apiClient from '../../../utils/apiClient';
import toast from 'react-hot-toast';

const PropertyForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [agents, setAgents] = useState([]);

    const [formData, setFormData] = useState({
        // Basic Info
        title: '',
        description: '',
        propertyType: 'apartment',
        priceType: 'sale',
        status: 'available',

        // Pricing
        price: '',
        maintenance_charge: '',
        booking_amount: '',
        negotiable: true,

        // Location
        address: '',
        locality: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        latitude: '',
        longitude: '',

        // Property Details
        bedrooms: '',
        bathrooms: '',
        balconies: '',
        area: '',
        areaUnit: 'sqft',
        carpet_area: '',
        floor_number: '',
        total_floors: '',
        facing: '',
        age_of_property: '',
        furnishing: 'unfurnished',
        parking: '',

        // Construction
        construction_status: 'ready_to_move',
        possession_date: '',

        // RERA
        rera_id: '',
        rera_approved: false,

        // Media
        images: [],
        video_url: '',
        virtual_tour_url: '',
        floor_plan_url: '',

        // Listing Options
        featured: false,
        premium: false,

        // Owner/Agent
        owner_name: '',
        owner_phone: '',
        owner_email: '',
        assignedTo: '',

        // Amenities
        amenities: []
    });

    const propertyTypes = [
        { value: 'apartment', label: 'Apartment' },
        { value: 'house', label: 'Independent House' },
        { value: 'villa', label: 'Villa' },
        { value: 'plot', label: 'Plot/Land' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'office', label: 'Office Space' },
        { value: 'shop', label: 'Shop' },
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'penthouse', label: 'Penthouse' },
        { value: 'farmhouse', label: 'Farmhouse' }
    ];

    const statuses = [
        { value: 'available', label: 'Available' },
        { value: 'pending', label: 'Pending' },
        { value: 'sold', label: 'Sold' },
        { value: 'rented', label: 'Rented' },
        { value: 'draft', label: 'Draft' }
    ];

    const furnishingOptions = [
        { value: 'unfurnished', label: 'Unfurnished' },
        { value: 'semi_furnished', label: 'Semi-Furnished' },
        { value: 'fully_furnished', label: 'Fully Furnished' }
    ];

    const facingOptions = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];

    const constructionStatuses = [
        { value: 'ready_to_move', label: 'Ready to Move' },
        { value: 'under_construction', label: 'Under Construction' },
        { value: 'new_launch', label: 'New Launch' }
    ];

    const amenitiesList = [
        { category: 'Basic', items: ['Power Backup', 'Lift', 'Water Supply', 'Gated Security', 'CCTV', 'Intercom'] },
        { category: 'Lifestyle', items: ['Swimming Pool', 'Gym', 'Club House', 'Garden', 'Jogging Track', 'Children Play Area'] },
        { category: 'Parking', items: ['Covered Parking', 'Open Parking', 'Visitor Parking'] },
        { category: 'Sports', items: ['Tennis Court', 'Badminton Court', 'Basketball Court', 'Indoor Games'] },
        { category: 'Features', items: ['Modular Kitchen', 'AC', 'Balcony', 'Study Room', 'Servant Room', 'Store Room'] }
    ];

    useEffect(() => {
        fetchAgents();
        if (isEditing) {
            fetchProperty();
        }
    }, [id]);

    const fetchAgents = async () => {
        try {
            const response = await apiClient.get('/agents');
            setAgents(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch agents');
        }
    };

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/properties/${id}`);
            const property = response.data.data;
            setFormData({
                ...formData,
                ...property,
                images: property.images ? JSON.parse(property.images) : [],
                amenities: property.amenities || []
            });
        } catch (error) {
            toast.error('Failed to load property');
            navigate('/properties');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleAmenity = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.city) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                images: JSON.stringify(formData.images),
                features: JSON.stringify(formData.amenities)
            };

            if (isEditing) {
                await apiClient.put(`/properties/${id}`, payload);
                toast.success('Property updated successfully');
            } else {
                await apiClient.post('/properties', payload);
                toast.success('Property created successfully');
            }
            navigate('/properties');
        } catch (error) {
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} property`);
        } finally {
            setSubmitting(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: FiHome },
        { id: 'location', label: 'Location', icon: FiMapPin },
        { id: 'pricing', label: 'Pricing', icon: FiDollarSign },
        { id: 'details', label: 'Details', icon: FiInfo },
        { id: 'media', label: 'Media', icon: FiUpload },
        { id: 'amenities', label: 'Amenities', icon: FiPlus }
    ];

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link to="/properties" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <FiChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isEditing ? 'Edit Property' : 'Add New Property'}
                    </h1>
                    <p className="text-slate-500">Fill in the property details below</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card p-6">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="label">Property Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        className="input"
                                        placeholder="e.g., 3 BHK Luxury Apartment in Bandra West"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Property Type</label>
                                    <select
                                        value={formData.propertyType}
                                        onChange={(e) => handleChange('propertyType', e.target.value)}
                                        className="select"
                                    >
                                        {propertyTypes.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Listing Type</label>
                                    <div className="flex gap-4">
                                        {['sale', 'rent', 'lease'].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="priceType"
                                                    value={type}
                                                    checked={formData.priceType === type}
                                                    onChange={(e) => handleChange('priceType', e.target.value)}
                                                    className="w-4 h-4 text-indigo-600"
                                                />
                                                <span className="capitalize">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="select"
                                    >
                                        {statuses.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Assign to Agent</label>
                                    <select
                                        value={formData.assignedTo}
                                        onChange={(e) => handleChange('assignedTo', e.target.value)}
                                        className="select"
                                    >
                                        <option value="">Not Assigned</option>
                                        {agents.map(a => (
                                            <option key={a.id} value={a.user_id}>{a.firstName} {a.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        className="input"
                                        rows={4}
                                        placeholder="Describe the property..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => handleChange('featured', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <span>Featured Property</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.premium}
                                        onChange={(e) => handleChange('premium', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <span>Premium Listing</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Location Tab */}
                    {activeTab === 'location' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="label">Full Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        className="input"
                                        rows={2}
                                        placeholder="Building name, street, area..."
                                    />
                                </div>
                                <div>
                                    <label className="label">Locality / Area *</label>
                                    <input
                                        type="text"
                                        value={formData.locality}
                                        onChange={(e) => handleChange('locality', e.target.value)}
                                        className="input"
                                        placeholder="e.g., Bandra West"
                                    />
                                </div>
                                <div>
                                    <label className="label">City *</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        className="input"
                                        placeholder="e.g., Mumbai"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">State</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => handleChange('state', e.target.value)}
                                        className="input"
                                        placeholder="e.g., Maharashtra"
                                    />
                                </div>
                                <div>
                                    <label className="label">Pincode</label>
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => handleChange('pincode', e.target.value)}
                                        className="input"
                                        placeholder="e.g., 400050"
                                    />
                                </div>
                                <div>
                                    <label className="label">Landmark</label>
                                    <input
                                        type="text"
                                        value={formData.landmark}
                                        onChange={(e) => handleChange('landmark', e.target.value)}
                                        className="input"
                                        placeholder="Near..."
                                    />
                                </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-4">GPS Coordinates (Optional)</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="label">Latitude</label>
                                        <input
                                            type="text"
                                            value={formData.latitude}
                                            onChange={(e) => handleChange('latitude', e.target.value)}
                                            className="input"
                                            placeholder="19.0760"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Longitude</label>
                                        <input
                                            type="text"
                                            value={formData.longitude}
                                            onChange={(e) => handleChange('longitude', e.target.value)}
                                            className="input"
                                            placeholder="72.8777"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pricing Tab */}
                    {activeTab === 'pricing' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => handleChange('price', e.target.value)}
                                        className="input"
                                        placeholder="e.g., 10000000"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        {formData.price && `₹${(parseInt(formData.price) / 100000).toFixed(2)} Lakhs`}
                                    </p>
                                </div>
                                <div>
                                    <label className="label">Maintenance Charge (₹/month)</label>
                                    <input
                                        type="number"
                                        value={formData.maintenance_charge}
                                        onChange={(e) => handleChange('maintenance_charge', e.target.value)}
                                        className="input"
                                        placeholder="e.g., 5000"
                                    />
                                </div>
                                <div>
                                    <label className="label">Booking Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.booking_amount}
                                        onChange={(e) => handleChange('booking_amount', e.target.value)}
                                        className="input"
                                        placeholder="e.g., 100000"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.negotiable}
                                            onChange={(e) => handleChange('negotiable', e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <span>Price Negotiable</span>
                                    </label>
                                </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-4">Owner Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="label">Owner Name</label>
                                        <input
                                            type="text"
                                            value={formData.owner_name}
                                            onChange={(e) => handleChange('owner_name', e.target.value)}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Owner Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.owner_phone}
                                            onChange={(e) => handleChange('owner_phone', e.target.value)}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Owner Email</label>
                                        <input
                                            type="email"
                                            value={formData.owner_email}
                                            onChange={(e) => handleChange('owner_email', e.target.value)}
                                            className="input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="label">Bedrooms</label>
                                    <input
                                        type="number"
                                        value={formData.bedrooms}
                                        onChange={(e) => handleChange('bedrooms', e.target.value)}
                                        className="input"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="label">Bathrooms</label>
                                    <input
                                        type="number"
                                        value={formData.bathrooms}
                                        onChange={(e) => handleChange('bathrooms', e.target.value)}
                                        className="input"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="label">Balconies</label>
                                    <input
                                        type="number"
                                        value={formData.balconies}
                                        onChange={(e) => handleChange('balconies', e.target.value)}
                                        className="input"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="label">Parking Spaces</label>
                                    <input
                                        type="number"
                                        value={formData.parking}
                                        onChange={(e) => handleChange('parking', e.target.value)}
                                        className="input"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="label">Built-up Area</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={formData.area}
                                            onChange={(e) => handleChange('area', e.target.value)}
                                            className="input flex-1"
                                            placeholder="0"
                                        />
                                        <select
                                            value={formData.areaUnit}
                                            onChange={(e) => handleChange('areaUnit', e.target.value)}
                                            className="select w-24"
                                        >
                                            <option value="sqft">sqft</option>
                                            <option value="sqm">sqm</option>
                                            <option value="sqyd">sqyd</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Carpet Area</label>
                                    <input
                                        type="number"
                                        value={formData.carpet_area}
                                        onChange={(e) => handleChange('carpet_area', e.target.value)}
                                        className="input"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="label">Furnishing</label>
                                    <select
                                        value={formData.furnishing}
                                        onChange={(e) => handleChange('furnishing', e.target.value)}
                                        className="select"
                                    >
                                        {furnishingOptions.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="label">Floor Number</label>
                                    <input
                                        type="number"
                                        value={formData.floor_number}
                                        onChange={(e) => handleChange('floor_number', e.target.value)}
                                        className="input"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="label">Total Floors</label>
                                    <input
                                        type="number"
                                        value={formData.total_floors}
                                        onChange={(e) => handleChange('total_floors', e.target.value)}
                                        className="input"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="label">Facing</label>
                                    <select
                                        value={formData.facing}
                                        onChange={(e) => handleChange('facing', e.target.value)}
                                        className="select"
                                    >
                                        <option value="">Select</option>
                                        {facingOptions.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Property Age (years)</label>
                                    <input
                                        type="number"
                                        value={formData.age_of_property}
                                        onChange={(e) => handleChange('age_of_property', e.target.value)}
                                        className="input"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-4">Construction & RERA</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="label">Construction Status</label>
                                        <select
                                            value={formData.construction_status}
                                            onChange={(e) => handleChange('construction_status', e.target.value)}
                                            className="select"
                                        >
                                            {constructionStatuses.map(cs => (
                                                <option key={cs.value} value={cs.value}>{cs.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Possession Date</label>
                                        <input
                                            type="date"
                                            value={formData.possession_date}
                                            onChange={(e) => handleChange('possession_date', e.target.value)}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">RERA ID</label>
                                        <input
                                            type="text"
                                            value={formData.rera_id}
                                            onChange={(e) => handleChange('rera_id', e.target.value)}
                                            className="input"
                                            placeholder="e.g., P51700000000"
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer mt-4">
                                    <input
                                        type="checkbox"
                                        checked={formData.rera_approved}
                                        onChange={(e) => handleChange('rera_approved', e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded"
                                    />
                                    <span>RERA Approved</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Media Tab */}
                    {activeTab === 'media' && (
                        <div className="space-y-6">
                            <div>
                                <label className="label">Property Images</label>
                                <p className="text-sm text-slate-500 mb-3">Add image URLs (one per line)</p>
                                <textarea
                                    value={formData.images.join('\n')}
                                    onChange={(e) => handleChange('images', e.target.value.split('\n').filter(Boolean))}
                                    className="input"
                                    rows={4}
                                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="label">Video URL</label>
                                    <input
                                        type="url"
                                        value={formData.video_url}
                                        onChange={(e) => handleChange('video_url', e.target.value)}
                                        className="input"
                                        placeholder="YouTube or Vimeo URL"
                                    />
                                </div>
                                <div>
                                    <label className="label">Virtual Tour URL</label>
                                    <input
                                        type="url"
                                        value={formData.virtual_tour_url}
                                        onChange={(e) => handleChange('virtual_tour_url', e.target.value)}
                                        className="input"
                                        placeholder="360° tour URL"
                                    />
                                </div>
                                <div>
                                    <label className="label">Floor Plan URL</label>
                                    <input
                                        type="url"
                                        value={formData.floor_plan_url}
                                        onChange={(e) => handleChange('floor_plan_url', e.target.value)}
                                        className="input"
                                        placeholder="Floor plan image URL"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Amenities Tab */}
                    {activeTab === 'amenities' && (
                        <div className="space-y-6">
                            {amenitiesList.map((category) => (
                                <div key={category.category}>
                                    <h3 className="font-medium text-slate-900 dark:text-white mb-3">{category.category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {category.items.map((amenity) => (
                                            <button
                                                key={amenity}
                                                type="button"
                                                onClick={() => toggleAmenity(amenity)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${formData.amenities.includes(amenity)
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {amenity}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/properties')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                handleChange('status', 'draft');
                                handleSubmit(new Event('submit'));
                            }}
                            className="btn-secondary"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary"
                        >
                            {submitting ? 'Saving...' : (isEditing ? 'Update Property' : 'Create Property')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PropertyForm;
