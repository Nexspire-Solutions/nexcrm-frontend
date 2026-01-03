import { useState, useEffect } from 'react';
import { workflowAPI } from '../../api';

const statusStyles = {
    running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400'
};

export default function ExecutionHistory() {
    const [executions, setExecutions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [nodeLogs, setNodeLogs] = useState([]);

    useEffect(() => {
        fetchExecutions();
    }, [filter]);

    const fetchExecutions = async () => {
        try {
            const res = await workflowAPI.getAllExecutions(100, filter || undefined);
            setExecutions(res.data || []);
        } catch (error) {
            console.error('Failed to fetch executions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const viewDetails = async (execution) => {
        setSelectedExecution(execution);
        try {
            const res = await workflowAPI.getExecutionDetails(execution.id);
            setNodeLogs(res.data.nodeLogs || []);
        } catch (error) {
            console.error('Failed to fetch details:', error);
        }
    };

    const formatDuration = (start, end) => {
        if (!start || !end) return '-';
        const ms = new Date(end) - new Date(start);
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3 animate-pulse"></div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
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
                    <h1 className="page-title">Execution History</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        All workflow runs across your automations
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="running">Running</option>
                    </select>
                    <button onClick={fetchExecutions} className="btn-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{executions.length}</p>
                    <p className="text-sm text-slate-500">Total Runs</p>
                </div>
                <div className="card p-4">
                    <p className="text-2xl font-bold text-green-600">{executions.filter(e => e.status === 'completed').length}</p>
                    <p className="text-sm text-slate-500">Completed</p>
                </div>
                <div className="card p-4">
                    <p className="text-2xl font-bold text-red-600">{executions.filter(e => e.status === 'failed').length}</p>
                    <p className="text-sm text-slate-500">Failed</p>
                </div>
                <div className="card p-4">
                    <p className="text-2xl font-bold text-blue-600">{executions.filter(e => e.status === 'running').length}</p>
                    <p className="text-sm text-slate-500">Running</p>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Executions List */}
                <div className="flex-1">
                    <div className="card overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Workflow</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Started</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {executions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                            No executions found
                                        </td>
                                    </tr>
                                ) : (
                                    executions.map(exec => (
                                        <tr
                                            key={exec.id}
                                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${selectedExecution?.id === exec.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                                                }`}
                                            onClick={() => viewDetails(exec)}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-900 dark:text-white">{exec.workflow_name || `Workflow #${exec.workflow_id}`}</p>
                                                <p className="text-xs text-slate-500">{exec.trigger_type}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[exec.status]}`}>
                                                    {exec.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {exec.started_at ? new Date(exec.started_at).toLocaleString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {formatDuration(exec.started_at, exec.completed_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Panel */}
                {selectedExecution && (
                    <div className="w-96 shrink-0">
                        <div className="card sticky top-4">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Execution Details</h3>
                                    <button onClick={() => setSelectedExecution(null)} className="text-slate-400 hover:text-slate-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">#{selectedExecution.id}</p>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Status */}
                                <div>
                                    <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[selectedExecution.status]}`}>
                                        {selectedExecution.status}
                                    </span>
                                </div>

                                {/* Error */}
                                {selectedExecution.error_message && (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                        <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Error</p>
                                        <p className="text-sm text-red-600 dark:text-red-300">{selectedExecution.error_message}</p>
                                    </div>
                                )}

                                {/* Node Logs */}
                                <div>
                                    <p className="text-xs text-slate-500 uppercase mb-2">Node Execution</p>
                                    <div className="space-y-2">
                                        {nodeLogs.length === 0 ? (
                                            <p className="text-sm text-slate-400">No node logs</p>
                                        ) : (
                                            nodeLogs.map((log, i) => (
                                                <div key={log.id} className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                    <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-green-500' :
                                                            log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                                        }`}></span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                                            {log.node_name || log.node_type}
                                                        </p>
                                                        {log.error_message && (
                                                            <p className="text-xs text-red-500 truncate">{log.error_message}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-400">{i + 1}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Trigger Data */}
                                {selectedExecution.trigger_data && (
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase mb-2">Trigger Data</p>
                                        <pre className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-auto max-h-40 text-slate-600 dark:text-slate-400">
                                            {JSON.stringify(
                                                typeof selectedExecution.trigger_data === 'string'
                                                    ? JSON.parse(selectedExecution.trigger_data)
                                                    : selectedExecution.trigger_data,
                                                null, 2
                                            )}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
