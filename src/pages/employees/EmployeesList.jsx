import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';

const mockEmployees = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@company.com', department: 'Sales', position: 'Sales Manager', status: 'active', phone: '+1 234 567 890' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@company.com', department: 'Marketing', position: 'Marketing Lead', status: 'active', phone: '+1 234 567 891' },
    { id: 3, firstName: 'Mike', lastName: 'Johnson', email: 'mike@company.com', department: 'Sales', position: 'Sales Rep', status: 'active', phone: '+1 234 567 892' },
    { id: 4, firstName: 'Sarah', lastName: 'Williams', email: 'sarah@company.com', department: 'Support', position: 'Support Lead', status: 'on_leave', phone: '+1 234 567 893' },
    { id: 5, firstName: 'David', lastName: 'Brown', email: 'david@company.com', department: 'Development', position: 'Developer', status: 'inactive', phone: '+1 234 567 894' },
];

export default function EmployeesList() {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setEmployees(mockEmployees);
            setIsLoading(false);
        }, 500);
    }, []);

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase().includes(searchTerm.toLowerCase());
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
        return <span className={styles[status]}>{labels[status]}</span>;
    };

    const handleDelete = (id) => {
        setDeleteTargetId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (deleteTargetId) {
            setEmployees(prev => prev.filter(e => e.id !== deleteTargetId));
            toast.success('Employee deleted successfully');
            setDeleteTargetId(null);
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
                                            {employee.firstName[0]}{employee.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {employee.firstName} {employee.lastName}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {employee.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td>{employee.department}</td>
                                <td>{employee.position}</td>
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
                        <button onClick={() => setShowModal(false)} className="btn-secondary">
                            Cancel
                        </button>
                        <button onClick={() => { setShowModal(false); toast.success('Employee saved'); }} className="btn-primary">
                            {editingEmployee ? 'Update' : 'Create'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">First Name</label>
                            <input type="text" className="input" defaultValue={editingEmployee?.firstName} />
                        </div>
                        <div>
                            <label className="label">Last Name</label>
                            <input type="text" className="input" defaultValue={editingEmployee?.lastName} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input type="email" className="input" defaultValue={editingEmployee?.email} />
                    </div>
                    <div>
                        <label className="label">Phone</label>
                        <input type="tel" className="input" defaultValue={editingEmployee?.phone} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Department</label>
                            <select className="select" defaultValue={editingEmployee?.department}>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Support">Support</option>
                                <option value="Development">Development</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Status</label>
                            <select className="select" defaultValue={editingEmployee?.status || 'active'}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="on_leave">On Leave</option>
                            </select>
                        </div>
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
