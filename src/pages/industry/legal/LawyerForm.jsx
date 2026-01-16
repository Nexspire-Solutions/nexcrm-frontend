/**
 * Lawyer Form Component
 * 
 * Form for creating and editing lawyer profiles with:
 * - User account linking
 * - Bar registration details
 * - Specialization and experience
 * - Billing rates
 * - Education and certifications
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

const SPECIALIZATIONS = [
    'Civil Litigation', 'Criminal Defense', 'Corporate Law', 'Family Law',
    'Property Law', 'Labour Law', 'Tax Law', 'Consumer Protection',
    'Intellectual Property', 'Constitutional Law', 'Banking & Finance',
    'Arbitration', 'Mediation', 'Immigration', 'Environmental Law'
];

const DESIGNATIONS = [
    { value: 'partner', label: 'Partner' },
    { value: 'senior_associate', label: 'Senior Associate' },
    { value: 'associate', label: 'Associate' },
    { value: 'junior_associate', label: 'Junior Associate' },
    { value: 'of_counsel', label: 'Of Counsel' },
    { value: 'consultant', label: 'Consultant' }
];

export default function LawyerForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        user_id: '',
        bar_number: '',
        bar_council: '',
        enrollment_date: '',
        specialization: '',
        secondary_specializations: [],
        designation: 'associate',
        experience_years: '',
        hourly_rate: '',
        is_partner: false,
        is_senior: false,
        bio: '',
        education: [],
        certifications: [],
        languages: '',
        courts_practiced: '',
        status: 'active'
    });

    useEffect(() => {
        loadUsers();
        if (isEdit) {
            loadLawyer();
        }
    }, [id]);

    const loadUsers = async () => {
        try {
            const response = await apiClient.get('/users?role=admin,manager,user&limit=100');
            setUsers(response.data.data || response.data || []);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const loadLawyer = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/lawyers/${id}`);
            const lawyerData = response.data.data;
            setFormData({
                ...formData,
                ...lawyerData,
                enrollment_date: lawyerData.enrollment_date?.split('T')[0] || '',
                education: lawyerData.education || [],
                certifications: lawyerData.certifications || [],
                secondary_specializations: lawyerData.secondary_specializations || []
            });
        } catch (error) {
            toast.error('Failed to load lawyer profile');
            navigate('/lawyers');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { degree: '', institution: '', year: '' }]
        }));
    };

    const handleRemoveEducation = (index) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    const handleEducationChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.map((edu, i) =>
                i === index ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const handleAddCertification = () => {
        setFormData(prev => ({
            ...prev,
            certifications: [...prev.certifications, { name: '', issuer: '', year: '' }]
        }));
    };

    const handleRemoveCertification = (index) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }));
    };

    const handleCertificationChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.map((cert, i) =>
                i === index ? { ...cert, [field]: value } : cert
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bar_number) {
            toast.error('Bar registration number is required');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                education: JSON.stringify(formData.education),
                certifications: JSON.stringify(formData.certifications),
                secondary_specializations: JSON.stringify(formData.secondary_specializations)
            };

            if (isEdit) {
                await apiClient.put(`/lawyers/${id}`, payload);
                toast.success('Lawyer profile updated successfully');
            } else {
                await apiClient.post('/lawyers', payload);
                toast.success('Lawyer profile created successfully');
            }
            navigate('/lawyers');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save lawyer profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <ProHeader
                title={isEdit ? 'Edit Lawyer' : 'New Lawyer'}
                subtitle={isEdit ? 'Update lawyer profile' : 'Add a new lawyer to the firm'}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Legal' },
                    { label: 'Lawyers', to: '/lawyers' },
                    { label: isEdit ? 'Edit' : 'New' }
                ]}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Account Linking */}
                <ProCard title="User Account">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Link to User Account
                            </label>
                            <select
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select User (Optional)</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                Link to an existing CRM user account for login access
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                            </select>
                        </div>
                    </div>
                </ProCard>

                {/* Bar Registration */}
                <ProCard title="Bar Registration">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Bar Registration Number <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="bar_number"
                                value={formData.bar_number}
                                onChange={handleChange}
                                required
                                placeholder="KAR/1234/2010"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Bar Council
                            </label>
                            <input
                                type="text"
                                name="bar_council"
                                value={formData.bar_council}
                                onChange={handleChange}
                                placeholder="Bar Council of Karnataka"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Enrollment Date
                            </label>
                            <input
                                type="date"
                                name="enrollment_date"
                                value={formData.enrollment_date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </ProCard>

                {/* Professional Details */}
                <ProCard title="Professional Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Primary Specialization
                            </label>
                            <select
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Specialization</option>
                                {SPECIALIZATIONS.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Designation
                            </label>
                            <select
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                {DESIGNATIONS.map(des => (
                                    <option key={des.value} value={des.value}>{des.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Years of Experience
                            </label>
                            <input
                                type="number"
                                name="experience_years"
                                value={formData.experience_years}
                                onChange={handleChange}
                                min="0"
                                placeholder="10"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Hourly Rate (₹)
                            </label>
                            <input
                                type="number"
                                name="hourly_rate"
                                value={formData.hourly_rate}
                                onChange={handleChange}
                                min="0"
                                placeholder="5000"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Languages
                            </label>
                            <input
                                type="text"
                                name="languages"
                                value={formData.languages}
                                onChange={handleChange}
                                placeholder="English, Hindi, Kannada"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Courts Practiced
                            </label>
                            <input
                                type="text"
                                name="courts_practiced"
                                value={formData.courts_practiced}
                                onChange={handleChange}
                                placeholder="Supreme Court, High Court, District Courts"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_partner"
                                    checked={formData.is_partner}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-slate-700 dark:text-slate-300">Partner</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_senior"
                                    checked={formData.is_senior}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-slate-700 dark:text-slate-300">Senior Advocate</span>
                            </label>
                        </div>
                    </div>
                </ProCard>

                {/* Bio */}
                <ProCard title="Biography">
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Professional biography for the website..."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                </ProCard>

                {/* Education */}
                <ProCard
                    title="Education"
                    actions={
                        <button
                            type="button"
                            onClick={handleAddEducation}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add
                        </button>
                    }
                >
                    {formData.education.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                            No education added. Click "Add" to add qualifications.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {formData.education.map((edu, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            value={edu.degree}
                                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                            placeholder="Degree (e.g., LLB, LLM)"
                                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={edu.institution}
                                            onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                            placeholder="Institution"
                                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={edu.year}
                                            onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                                            placeholder="Year"
                                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEducation(index)}
                                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ProCard>

                {/* Certifications */}
                <ProCard
                    title="Certifications"
                    actions={
                        <button
                            type="button"
                            onClick={handleAddCertification}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add
                        </button>
                    }
                >
                    {formData.certifications.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                            No certifications added.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {formData.certifications.map((cert, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            value={cert.name}
                                            onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                                            placeholder="Certification Name"
                                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={cert.issuer}
                                            onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                                            placeholder="Issuing Body"
                                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={cert.year}
                                            onChange={(e) => handleCertificationChange(index, 'year', e.target.value)}
                                            placeholder="Year"
                                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCertification(index)}
                                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ProCard>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/lawyers')}
                        className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <FiX className="w-5 h-5" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        <FiSave className="w-5 h-5" />
                        {saving ? 'Saving...' : (isEdit ? 'Update Profile' : 'Create Profile')}
                    </button>
                </div>
            </form>
        </div>
    );
}
