/**
 * Case Form Component
 * 
 * Form for creating and editing legal cases with:
 * - Client selection
 * - Case details (type, title, description)
 * - Opposing party information
 * - Court information
 * - Team assignment
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import ProHeader from '../../../components/common/ProHeader';
import ProCard from '../../../components/common/ProCard';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

const CASE_TYPES = [
    'Civil', 'Criminal', 'Family', 'Corporate', 'Property', 'Labour',
    'Tax', 'Consumer', 'Intellectual Property', 'Constitutional', 'Other'
];

const CASE_STATUSES = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending_hearing', label: 'Pending Hearing' },
    { value: 'pending_judgment', label: 'Pending Judgment' },
    { value: 'closed', label: 'Closed' },
    { value: 'on_hold', label: 'On Hold' }
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: 'text-slate-600' },
    { value: 'medium', label: 'Medium', color: 'text-amber-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-rose-600' }
];

export default function CaseForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [clients, setClients] = useState([]);
    const [lawyers, setLawyers] = useState([]);

    const [formData, setFormData] = useState({
        client_id: '',
        case_number: '',
        title: '',
        case_type: 'Civil',
        description: '',
        status: 'open',
        priority: 'medium',
        court_name: '',
        court_number: '',
        judge_name: '',
        filing_date: '',
        next_hearing_date: '',
        opposing_party_name: '',
        opposing_party_advocate: '',
        billing_type: 'hourly',
        fixed_fee: '',
        retainer_amount: '',
        team_members: []
    });

    useEffect(() => {
        loadDropdownData();
        if (isEdit) {
            loadCase();
        }
    }, [id]);

    const loadDropdownData = async () => {
        try {
            const [clientsRes, lawyersRes] = await Promise.all([
                apiClient.get('/cases/clients/all'),
                apiClient.get('/lawyers?status=active')
            ]);
            setClients(clientsRes.data.data || []);
            setLawyers(lawyersRes.data.data || []);
        } catch (error) {
            console.error('Failed to load dropdown data:', error);
        }
    };

    const loadCase = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/cases/${id}`);
            const caseData = response.data.data;
            setFormData({
                ...formData,
                ...caseData,
                filing_date: caseData.filing_date?.split('T')[0] || '',
                next_hearing_date: caseData.next_hearing_date?.split('T')[0] || '',
                team_members: caseData.team || []
            });
        } catch (error) {
            toast.error('Failed to load case');
            navigate('/cases');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTeamMember = () => {
        setFormData(prev => ({
            ...prev,
            team_members: [...prev.team_members, { lawyer_id: '', role: 'associate' }]
        }));
    };

    const handleRemoveTeamMember = (index) => {
        setFormData(prev => ({
            ...prev,
            team_members: prev.team_members.filter((_, i) => i !== index)
        }));
    };

    const handleTeamMemberChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            team_members: prev.team_members.map((member, i) =>
                i === index ? { ...member, [field]: value } : member
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.client_id || !formData.title) {
            toast.error('Client and case title are required');
            return;
        }

        setSaving(true);
        try {
            if (isEdit) {
                await apiClient.put(`/cases/${id}`, formData);
                toast.success('Case updated successfully');
            } else {
                await apiClient.post('/cases', formData);
                toast.success('Case created successfully');
            }
            navigate('/cases');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save case');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48 animate-pulse mb-6"></div>
                <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <ProHeader
                title={isEdit ? 'Edit Case' : 'New Case'}
                subtitle={isEdit ? `Editing case #${formData.case_number}` : 'Create a new legal case'}
                breadcrumbs={[
                    { label: 'Dashboard', to: '/' },
                    { label: 'Legal' },
                    { label: 'Cases', to: '/cases' },
                    { label: isEdit ? 'Edit' : 'New' }
                ]}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <ProCard title="Case Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Client <span className="text-rose-500">*</span>
                            </label>
                            <select
                                name="client_id"
                                value={formData.client_id}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} {client.company ? `(${client.company})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Case Number
                            </label>
                            <input
                                type="text"
                                name="case_number"
                                value={formData.case_number}
                                onChange={handleChange}
                                placeholder="Auto-generated if empty"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Case Title <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Smith vs. ABC Corporation"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Case Type
                            </label>
                            <select
                                name="case_type"
                                value={formData.case_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                {CASE_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
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
                                {CASE_STATUSES.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                {PRIORITY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Filing Date
                            </label>
                            <input
                                type="date"
                                name="filing_date"
                                value={formData.filing_date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Brief description of the case..."
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </ProCard>

                {/* Court Information */}
                <ProCard title="Court Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Court Name
                            </label>
                            <input
                                type="text"
                                name="court_name"
                                value={formData.court_name}
                                onChange={handleChange}
                                placeholder="e.g., High Court of Karnataka"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Court Number
                            </label>
                            <input
                                type="text"
                                name="court_number"
                                value={formData.court_number}
                                onChange={handleChange}
                                placeholder="e.g., Court No. 5"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Judge Name
                            </label>
                            <input
                                type="text"
                                name="judge_name"
                                value={formData.judge_name}
                                onChange={handleChange}
                                placeholder="Hon'ble Justice..."
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Next Hearing Date
                            </label>
                            <input
                                type="date"
                                name="next_hearing_date"
                                value={formData.next_hearing_date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </ProCard>

                {/* Opposing Party */}
                <ProCard title="Opposing Party">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Opposing Party Name
                            </label>
                            <input
                                type="text"
                                name="opposing_party_name"
                                value={formData.opposing_party_name}
                                onChange={handleChange}
                                placeholder="Defendant/Respondent name"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Opposing Advocate
                            </label>
                            <input
                                type="text"
                                name="opposing_party_advocate"
                                value={formData.opposing_party_advocate}
                                onChange={handleChange}
                                placeholder="Opposing counsel name"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </ProCard>

                {/* Billing */}
                <ProCard title="Billing Information">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Billing Type
                            </label>
                            <select
                                name="billing_type"
                                value={formData.billing_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="hourly">Hourly</option>
                                <option value="fixed">Fixed Fee</option>
                                <option value="retainer">Retainer</option>
                                <option value="contingency">Contingency</option>
                                <option value="pro_bono">Pro Bono</option>
                            </select>
                        </div>

                        {formData.billing_type === 'fixed' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Fixed Fee (₹)
                                </label>
                                <input
                                    type="number"
                                    name="fixed_fee"
                                    value={formData.fixed_fee}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {formData.billing_type === 'retainer' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Retainer Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    name="retainer_amount"
                                    value={formData.retainer_amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>
                </ProCard>

                {/* Team Members */}
                <ProCard
                    title="Case Team"
                    actions={
                        <button
                            type="button"
                            onClick={handleAddTeamMember}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add Member
                        </button>
                    }
                >
                    {formData.team_members.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                            No team members assigned. Click "Add Member" to assign lawyers.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {formData.team_members.map((member, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div className="flex-1">
                                        <select
                                            value={member.lawyer_id}
                                            onChange={(e) => handleTeamMemberChange(index, 'lawyer_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            <option value="">Select Lawyer</option>
                                            {lawyers.map(lawyer => (
                                                <option key={lawyer.id} value={lawyer.id}>
                                                    {lawyer.first_name} {lawyer.last_name} - {lawyer.specialization}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-40">
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            <option value="lead">Lead Counsel</option>
                                            <option value="associate">Associate</option>
                                            <option value="paralegal">Paralegal</option>
                                            <option value="support">Support</option>
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTeamMember(index)}
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
                        onClick={() => navigate('/cases')}
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
                        {saving ? 'Saving...' : (isEdit ? 'Update Case' : 'Create Case')}
                    </button>
                </div>
            </form>
        </div>
    );
}
