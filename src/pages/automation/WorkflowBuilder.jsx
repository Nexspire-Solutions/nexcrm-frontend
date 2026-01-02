import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { workflowAPI } from '../../api';

// Node type definitions with colors
const nodeTypeConfig = {
    // Triggers
    trigger_lead_created: { label: 'Lead Created', color: '#3b82f6', category: 'trigger' },
    trigger_lead_updated: { label: 'Lead Updated', color: '#3b82f6', category: 'trigger' },
    trigger_customer_created: { label: 'Customer Created', color: '#3b82f6', category: 'trigger' },
    trigger_order_placed: { label: 'Order Placed', color: '#3b82f6', category: 'trigger' },
    trigger_inquiry_received: { label: 'Inquiry Received', color: '#3b82f6', category: 'trigger' },
    trigger_manual: { label: 'Manual', color: '#6366f1', category: 'trigger' },
    trigger_webhook: { label: 'Webhook', color: '#6366f1', category: 'trigger' },
    // Actions
    action_send_email: { label: 'Send Email', color: '#10b981', category: 'action' },
    action_create_task: { label: 'Create Task', color: '#10b981', category: 'action' },
    action_update_lead: { label: 'Update Lead', color: '#10b981', category: 'action' },
    action_create_note: { label: 'Create Note', color: '#10b981', category: 'action' },
    action_http_request: { label: 'HTTP Request', color: '#f59e0b', category: 'action' },
    action_set_variable: { label: 'Set Variable', color: '#8b5cf6', category: 'action' },
    // Logic
    logic_if_else: { label: 'If/Else', color: '#f59e0b', category: 'logic' },
    logic_switch: { label: 'Switch', color: '#f59e0b', category: 'logic' },
    logic_delay: { label: 'Delay', color: '#64748b', category: 'logic' },
    // Data
    data_get_lead: { label: 'Get Lead', color: '#8b5cf6', category: 'data' },
    data_get_customer: { label: 'Get Customer', color: '#8b5cf6', category: 'data' },
    data_transform: { label: 'Transform', color: '#8b5cf6', category: 'data' }
};

export default function WorkflowBuilder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    const [workflow, setWorkflow] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dragging, setDragging] = useState(null);
    const [connecting, setConnecting] = useState(null);

    useEffect(() => {
        fetchWorkflow();
    }, [id]);

    const fetchWorkflow = async () => {
        try {
            const res = await workflowAPI.getById(id);
            setWorkflow(res.data);

            const canvasData = res.data.canvas_data;
            if (canvasData) {
                const parsed = typeof canvasData === 'string' ? JSON.parse(canvasData) : canvasData;
                setNodes(parsed.nodes || []);
                setEdges(parsed.edges || []);
            }

            // If no trigger node, add one
            if (!canvasData?.nodes?.length && res.data.trigger_type) {
                setNodes([{
                    id: 'trigger-1',
                    type: res.data.trigger_type,
                    position: { x: 100, y: 100 },
                    data: { label: nodeTypeConfig[res.data.trigger_type]?.label || 'Trigger', config: {} }
                }]);
            }
        } catch (error) {
            console.error('Failed to fetch workflow:', error);
            toast.error('Failed to load workflow');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await workflowAPI.update(id, {
                canvas_data: { nodes, edges }
            });
            toast.success('Workflow saved');
        } catch (error) {
            toast.error('Failed to save workflow');
        } finally {
            setSaving(false);
        }
    };

    const handleRun = async () => {
        try {
            await workflowAPI.run(id);
            toast.success('Workflow execution started');
        } catch (error) {
            toast.error('Failed to run workflow');
        }
    };

    const addNode = (type) => {
        const config = nodeTypeConfig[type];
        const newNode = {
            id: `${type}-${Date.now()}`,
            type,
            position: { x: 200 + Math.random() * 100, y: 150 + nodes.length * 80 },
            data: { label: config?.label || type, config: {} }
        };
        setNodes([...nodes, newNode]);
        setSelectedNode(newNode);
    };

    const deleteNode = (nodeId) => {
        setNodes(nodes.filter(n => n.id !== nodeId));
        setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
        if (selectedNode?.id === nodeId) setSelectedNode(null);
    };

    const updateNodeConfig = (nodeId, config) => {
        setNodes(nodes.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, config } } : n
        ));
    };

    const handleNodeDrag = useCallback((nodeId, deltaX, deltaY) => {
        setNodes(prev => prev.map(n =>
            n.id === nodeId
                ? { ...n, position: { x: n.position.x + deltaX, y: n.position.y + deltaY } }
                : n
        ));
    }, []);

    const handleConnect = (sourceId, targetId) => {
        if (sourceId === targetId) return;
        if (edges.some(e => e.source === sourceId && e.target === targetId)) return;

        setEdges([...edges, { id: `e-${Date.now()}`, source: sourceId, target: targetId }]);
    };

    const deleteEdge = (edgeId) => {
        setEdges(edges.filter(e => e.id !== edgeId));
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/automation/workflows')} className="btn-ghost btn-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="font-semibold text-slate-900 dark:text-white">{workflow?.name}</h1>
                        <p className="text-xs text-slate-500">{workflow?.trigger_type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleRun} className="btn-secondary btn-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        Test Run
                    </button>
                    <button onClick={handleSave} className="btn-primary btn-sm" disabled={saving}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Node Palette */}
                <div className="w-56 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 overflow-y-auto">
                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Triggers</h3>
                    <div className="space-y-1 mb-4">
                        {Object.entries(nodeTypeConfig).filter(([_, c]) => c.category === 'trigger').map(([type, config]) => (
                            <button
                                key={type}
                                onClick={() => addNode(type)}
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                                <span className="w-3 h-3 rounded" style={{ backgroundColor: config.color }}></span>
                                {config.label}
                            </button>
                        ))}
                    </div>

                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Actions</h3>
                    <div className="space-y-1 mb-4">
                        {Object.entries(nodeTypeConfig).filter(([_, c]) => c.category === 'action').map(([type, config]) => (
                            <button
                                key={type}
                                onClick={() => addNode(type)}
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                                <span className="w-3 h-3 rounded" style={{ backgroundColor: config.color }}></span>
                                {config.label}
                            </button>
                        ))}
                    </div>

                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Logic</h3>
                    <div className="space-y-1 mb-4">
                        {Object.entries(nodeTypeConfig).filter(([_, c]) => c.category === 'logic').map(([type, config]) => (
                            <button
                                key={type}
                                onClick={() => addNode(type)}
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                                <span className="w-3 h-3 rounded" style={{ backgroundColor: config.color }}></span>
                                {config.label}
                            </button>
                        ))}
                    </div>

                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Data</h3>
                    <div className="space-y-1">
                        {Object.entries(nodeTypeConfig).filter(([_, c]) => c.category === 'data').map(([type, config]) => (
                            <button
                                key={type}
                                onClick={() => addNode(type)}
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                                <span className="w-3 h-3 rounded" style={{ backgroundColor: config.color }}></span>
                                {config.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div
                    ref={canvasRef}
                    className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-auto"
                    style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                    {/* Edges */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '2000px', minHeight: '1500px' }}>
                        {edges.map(edge => {
                            const source = nodes.find(n => n.id === edge.source);
                            const target = nodes.find(n => n.id === edge.target);
                            if (!source || !target) return null;

                            const x1 = source.position.x + 140;
                            const y1 = source.position.y + 25;
                            const x2 = target.position.x;
                            const y2 = target.position.y + 25;
                            const midX = (x1 + x2) / 2;

                            return (
                                <g key={edge.id} className="pointer-events-auto cursor-pointer" onClick={() => deleteEdge(edge.id)}>
                                    <path
                                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                                        stroke="#6366f1"
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                    <circle cx={x2} cy={y2} r="4" fill="#6366f1" />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Nodes */}
                    {nodes.map(node => {
                        const config = nodeTypeConfig[node.type] || { color: '#64748b', label: node.type };

                        return (
                            <div
                                key={node.id}
                                className={`absolute w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border-2 cursor-move transition-shadow ${selectedNode?.id === node.id ? 'ring-2 ring-indigo-500' : ''
                                    }`}
                                style={{
                                    left: node.position.x,
                                    top: node.position.y,
                                    borderColor: config.color
                                }}
                                onClick={() => setSelectedNode(node)}
                                draggable
                                onDragStart={(e) => {
                                    setDragging({ nodeId: node.id, startX: e.clientX, startY: e.clientY });
                                }}
                                onDragEnd={(e) => {
                                    if (dragging) {
                                        const deltaX = e.clientX - dragging.startX;
                                        const deltaY = e.clientY - dragging.startY;
                                        handleNodeDrag(node.id, deltaX, deltaY);
                                        setDragging(null);
                                    }
                                }}
                            >
                                {/* Node header */}
                                <div
                                    className="px-3 py-2 text-white text-xs font-medium rounded-t-md"
                                    style={{ backgroundColor: config.color }}
                                >
                                    {config.label}
                                </div>
                                {/* Node body */}
                                <div className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                                    {node.data?.config?.subject || node.data?.config?.title || 'Click to configure'}
                                </div>
                                {/* Connect handle */}
                                <div
                                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white cursor-crosshair"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (connecting) {
                                            handleConnect(connecting, node.id);
                                            setConnecting(null);
                                        } else {
                                            setConnecting(node.id);
                                        }
                                    }}
                                />
                                {/* Input handle */}
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-400 rounded-full border-2 border-white" />
                            </div>
                        );
                    })}

                    {/* Empty state */}
                    {nodes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-slate-500 dark:text-slate-400 mb-2">Click a node from the left panel to add it</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Config Panel */}
                {selectedNode && (
                    <div className="w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                {nodeTypeConfig[selectedNode.type]?.label || selectedNode.type}
                            </h3>
                            <button
                                onClick={() => deleteNode(selectedNode.id)}
                                className="text-red-500 hover:text-red-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        {/* Dynamic config based on node type */}
                        {selectedNode.type === 'action_send_email' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="label">Recipient Field</label>
                                    <input
                                        type="text"
                                        className="input input-sm"
                                        placeholder="trigger.email"
                                        value={selectedNode.data?.config?.recipientField || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, recipientField: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Subject</label>
                                    <input
                                        type="text"
                                        className="input input-sm"
                                        placeholder="Welcome {{name}}"
                                        value={selectedNode.data?.config?.subject || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, subject: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Body</label>
                                    <textarea
                                        className="input input-sm"
                                        rows={4}
                                        placeholder="<p>Hello {{name}},</p>"
                                        value={selectedNode.data?.config?.body || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, body: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {selectedNode.type === 'action_create_task' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="label">Title</label>
                                    <input
                                        type="text"
                                        className="input input-sm"
                                        placeholder="Follow up with {{name}}"
                                        value={selectedNode.data?.config?.title || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Priority</label>
                                    <select
                                        className="select select-sm"
                                        value={selectedNode.data?.config?.priority || 'medium'}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {selectedNode.type === 'logic_if_else' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="label">Field</label>
                                    <input
                                        type="text"
                                        className="input input-sm"
                                        placeholder="trigger.score"
                                        value={selectedNode.data?.config?.field || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, field: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Operator</label>
                                    <select
                                        className="select select-sm"
                                        value={selectedNode.data?.config?.operator || 'equals'}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, operator: e.target.value })}
                                    >
                                        <option value="equals">Equals</option>
                                        <option value="not_equals">Not Equals</option>
                                        <option value="contains">Contains</option>
                                        <option value="greater_than">Greater Than</option>
                                        <option value="less_than">Less Than</option>
                                        <option value="is_empty">Is Empty</option>
                                        <option value="is_not_empty">Is Not Empty</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Value</label>
                                    <input
                                        type="text"
                                        className="input input-sm"
                                        placeholder="50"
                                        value={selectedNode.data?.config?.value || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, value: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {selectedNode.type === 'logic_delay' && (
                            <div>
                                <label className="label">Delay (minutes)</label>
                                <input
                                    type="number"
                                    className="input input-sm"
                                    placeholder="5"
                                    value={selectedNode.data?.config?.minutes || ''}
                                    onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, minutes: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        )}

                        {selectedNode.type === 'action_http_request' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="label">URL</label>
                                    <input
                                        type="text"
                                        className="input input-sm"
                                        placeholder="https://api.example.com/webhook"
                                        value={selectedNode.data?.config?.url || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, url: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Method</label>
                                    <select
                                        className="select select-sm"
                                        value={selectedNode.data?.config?.method || 'POST'}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, method: e.target.value })}
                                    >
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {selectedNode.type === 'action_update_lead' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="label">New Status</label>
                                    <select
                                        className="select select-sm"
                                        value={selectedNode.data?.config?.status || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, status: e.target.value })}
                                    >
                                        <option value="">Don't change</option>
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="proposal">Proposal</option>
                                        <option value="won">Won</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Add Score</label>
                                    <input
                                        type="number"
                                        className="input input-sm"
                                        placeholder="10"
                                        value={selectedNode.data?.config?.score || ''}
                                        onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, score: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Node info for triggers */}
                        {selectedNode.type?.startsWith('trigger_') && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
                                <p>This is the starting point of your workflow. It will fire automatically when the event occurs.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
