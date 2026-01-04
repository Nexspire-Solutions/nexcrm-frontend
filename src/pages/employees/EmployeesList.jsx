import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { usersAPI } from '../../api';

export default function EmployeesList() {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'Sales',
        position: '',
        status: 'active',
        password: ''
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Reset form when modal opens/closes or editing employee changes
    useEffect(() => {
        if (editingEmployee) {
            setFormData({
                firstName: editingEmployee.firstName || editingEmployee.name?.split(' ')[0] || '',
                lastName: editingEmployee.lastName || editingEmployee.name?.split(' ')[1] || '',
                email: editingEmployee.email || '',
                phone: editingEmployee.phone || '',
                department: editingEmployee.department || 'Sales',
                position: editingEmployee.position || editingEmployee.role || '',
                status: editingEmployee.status || 'active',
                password: '' // Don't populate password for security
            });
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                department: 'Sales',
                position: '',
                status: 'active',
                password: ''
            });
        }
    }, [editingEmployee, showModal]);

    const fetchEmployees = async () => {
        try {
            const response = await usersAPI.getAll();
            setEmployees(response.data || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            setEmployees([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const name = emp.firstName ? `${emp.firstName} ${emp.lastName}` : emp.name || '';
        const matchesSearch = `${name} ${emp.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const styles = {
            active: 'badge-success',
            inactive: 'badge-gray',
            on_leave: 'badge-warning'
        };
        const labels = {
            active: 'Active',
            inactive: 'Inactive',
            on_leave: 'On Leave'
        };
        return <span className={styles[status] || 'badge-gray'}>{labels[status] || status || 'Active'}</span>;
    };

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId) {
            try {
                await usersAPI.delete(deleteTargetId);
                toast.success('Employee deleted successfully');
                fetchEmployees();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to delete employee');
            }
            setDeleteTargetId(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.email) {
            toast.error('Email is required');
            return;
        }
        if (!editingEmployee && !formData.password) {
            toast.error('Password is required for new employees');
            return;
        }
        if (!formData.firstName) {
            toast.error('First name is required');
            return;
        }

        setIsSaving(true);
        try {
            if (editingEmployee) {
                // Update existing employee
                await usersAPI.update(editingEmployee.id, {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    department: formData.department,
                    position: formData.position,
                    status: formData.status,
                    role: editingEmployee.role // Keep existing role
                });
                toast.success('Employee updated successfully');
            } else {
                // Create new employee
                await usersAPI.create({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    department: formData.department,
                    position: formData.position,
                    status: formData.status,
                    role: 'user' // Default role for new employees
                });
                toast.success('Employee created successfully');
            }
            setShowModal(false);
            fetchEmployees();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save employee');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="card p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage your team members and their roles
                    </p>
                </div>
                <button
                    onClick={() => { setEditingEmployee(null); setShowModal(true); }}
                    className="btn-primary"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Employee
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-10"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="select w-full sm:w-40"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Position</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                            <tr key={employee.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                                            {(employee.firstName || employee.name || 'U')[0]}{(employee.lastName || '')[0] || ''}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {employee.firstName ? `${employee.firstName} ${employee.lastName}` : employee.name}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {employee.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td>{employee.department || '-'}</td>
                                <td>{employee.position || employee.role || '-'}</td>
                                <td>{getStatusBadge(employee.status)}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/employees/${employee.id}`}
                                            className="btn-ghost btn-sm"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => { setEditingEmployee(employee); setShowModal(true); }}
                                            className="btn-ghost btn-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee.id)}
                                            className="btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredEmployees.length === 0 && (
                    <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="empty-state-title">No employees found</h3>
                        <p className="empty-state-text">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                footer={
                    <>
                        <button onClick={() => setShowModal(false)} className="btn-secondary" disabled={isSaving}>
                            Cancel
                        </button>
                        <button onClick={handleSubmit} className="btn-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editingEmployee ? 'Update' : 'Create')}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                className="input"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="label">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                className="input"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Doe"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Email *</label>
                        <input
                            type="email"
                            name="email"
                            className="input"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!!editingEmployee}
                            placeholder="john.doe@company.com"
                        />
                        {editingEmployee && (
                            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                        )}
                    </div>
                    {!editingEmployee && (
                        <div>
                            <label className="label">Password *</label>
                            <input
                                type="password"
                                name="password"
                                className="input"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                            />
                        </div>
                    )}
                    <div>
                        <label className="label">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            className="input"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Department</label>
                            <select
                                name="department"
                                className="select"
                                value={formData.department}
                                onChange={handleInputChange}
                            >
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Support">Support</option>
                                <option value="Development">Development</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Position</label>
                            <input
                                type="text"
                                name="position"
                                className="input"
                                value={formData.position}
                                onChange={handleInputChange}
                                placeholder="Sales Manager"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select
                            name="status"
                            className="select"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on_leave">On Leave</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Employee"
                message="Are you sure you want to delete this employee? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}

