import React, { useState } from 'react';
import { FiSearch, FiFilter, FiPlus, FiMoreVertical, FiMail, FiPhone } from 'react-icons/fi';

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Fetch Contacts from API
    React.useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/crm/contacts');
                if (response.ok) {
                    const data = await response.json();
                    setContacts(data);
                }
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    const filteredContacts = contacts.filter(contact => {
        const name = contact.name || contact.contactName || '';
        const email = contact.email || '';

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Contacts</h1>
                    <p className="text-slate-500 text-sm">Manage your customer database and leads.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    <FiPlus /> Add Contact
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                    <FiFilter className="text-slate-400" />
                    <select
                        className="border-none bg-transparent font-medium text-slate-600 focus:ring-0 cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="active">Active</option>
                        <option value="new">New (Lead)</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Added</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center">Loading...</td></tr>
                        ) : filteredContacts.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">No contacts found</td></tr>
                        ) : filteredContacts.map(contact => (
                            <tr key={`${contact.role}-${contact.id}`} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                            {(contact.name || contact.contactName || '?').substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{contact.name || contact.contactName}</div>
                                            <div className="text-slate-500 text-xs">{contact.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                                    <span className={`px-2 py-0.5 rounded text-xs border ${contact.role === 'client' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-blue-200 bg-blue-50 text-blue-700'
                                        }`}>
                                        {contact.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${contact.status === 'active' || contact.status === 'won' ? 'bg-green-100 text-green-700' :
                                            contact.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {contact.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{new Date(contact.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                                            <FiMail />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                                            <FiPhone />
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                                            <FiMoreVertical />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactManager;
