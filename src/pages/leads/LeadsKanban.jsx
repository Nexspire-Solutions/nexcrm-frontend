import { useState } from 'react';
import toast from 'react-hot-toast';

const statusColumns = {
    new: { id: 'new', title: 'New Leads', color: 'bg-blue-500' },
    contacted: { id: 'contacted', title: 'In Discussion', color: 'bg-amber-500' },
    qualified: { id: 'qualified', title: 'Qualified', color: 'bg-purple-500' },
    negotiation: { id: 'negotiation', title: 'Negotiation', color: 'bg-orange-500' },
    won: { id: 'won', title: 'Closed Won', color: 'bg-emerald-500' },
    lost: { id: 'lost', title: 'Lost', color: 'bg-slate-500' },
};

export default function LeadsKanban({ leads = [], onUpdateStatus, onViewLead }) {
    const [draggedLead, setDraggedLead] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    // Group leads by status
    const getLeadsByStatus = (status) => {
        return leads.filter(lead => lead.status?.toLowerCase() === status);
    };

    // Drag handlers
    const handleDragStart = (e, lead) => {
        setDraggedLead(lead);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', lead.id);
        // Add visual feedback
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedLead(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverColumn !== columnId) {
            setDragOverColumn(columnId);
        }
    };

    const handleDragLeave = (e) => {
        // Only clear if leaving the column entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverColumn(null);
        }
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (draggedLead && draggedLead.status !== newStatus) {
            try {
                await onUpdateStatus?.(draggedLead.id, newStatus);
                toast.success(`Lead moved to ${statusColumns[newStatus]?.title || newStatus}`);
            } catch (error) {
                toast.error('Failed to update lead status');
            }
        }
        setDraggedLead(null);
    };

    return (
        <div className="flex overflow-x-auto gap-4 pb-6 h-[calc(100vh-320px)] scrollbar-thin">
            {Object.values(statusColumns).map((col) => {
                const colLeads = getLeadsByStatus(col.id);
                const totalValue = colLeads.reduce((sum, lead) => sum + (parseFloat(lead.estimatedValue) || 0), 0);
                const isDropTarget = dragOverColumn === col.id;

                return (
                    <div
                        key={col.id}
                        className="min-w-[280px] max-w-[280px] flex flex-col"
                        onDragOver={(e) => handleDragOver(e, col.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, col.id)}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
                                <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{col.title}</h3>
                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {colLeads.length}
                                </span>
                            </div>
                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                ₹{totalValue.toLocaleString()}
                            </span>
                        </div>

                        {/* Column Content */}
                        <div
                            className={`flex-1 rounded-xl p-2 overflow-y-auto scrollbar-thin border-2 border-dashed transition-all duration-200 space-y-2.5
                                ${isDropTarget
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 dark:border-indigo-500'
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent'
                                }`}
                        >
                            {colLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => onViewLead?.(lead)}
                                    className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 
                                        hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 
                                        transition-all duration-200 cursor-grab active:cursor-grabbing group"
                                >
                                    {/* Lead Card Header */}
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate max-w-[150px]">
                                            {lead.company}
                                        </span>
                                        {lead.score > 0 && (
                                            <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${lead.score >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' :
                                                    lead.score >= 50 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' :
                                                        'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400'
                                                }`}>
                                                {lead.score}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lead Name */}
                                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {lead.contactName}
                                    </h4>

                                    {/* Email */}
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="truncate">{lead.email}</span>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                            ₹{parseFloat(lead.estimatedValue || 0).toLocaleString()}
                                        </span>
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                            {lead.contactName?.[0] || 'L'}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {colLeads.length === 0 && (
                                <div className={`h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-sm transition-colors ${isDropTarget
                                        ? 'border-indigo-400 text-indigo-500 dark:border-indigo-500 dark:text-indigo-400'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                                    }`}>
                                    {isDropTarget ? 'Drop here' : 'No leads'}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
