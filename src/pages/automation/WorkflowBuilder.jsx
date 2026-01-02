import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { workflowAPI } from '../../api';

// Node Icons (inline SVG for each category)
const NodeIcons = {
    trigger: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    action: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    logic: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    data: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
    ),
    email: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    task: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
};

// Enhanced node type definitions
const nodeTypeConfig = {
    // Triggers - Blue gradient
    trigger_lead_created: { label: 'Lead Created', icon: 'trigger', gradient: 'from-blue-500 to-blue-600', category: 'trigger', description: 'When a new lead is added' },
    trigger_lead_updated: { label: 'Lead Updated', icon: 'trigger', gradient: 'from-blue-500 to-blue-600', category: 'trigger', description: 'When a lead is modified' },
    trigger_customer_created: { label: 'Customer Created', icon: 'trigger', gradient: 'from-blue-500 to-cyan-500', category: 'trigger', description: 'When a new customer registers' },
    trigger_order_placed: { label: 'Order Placed', icon: 'trigger', gradient: 'from-indigo-500 to-blue-500', category: 'trigger', description: 'When an order is created' },
    trigger_inquiry_received: { label: 'Inquiry Received', icon: 'trigger', gradient: 'from-violet-500 to-blue-500', category: 'trigger', description: 'When inquiry form is submitted' },
    trigger_manual: { label: 'Manual Trigger', icon: 'trigger', gradient: 'from-slate-500 to-slate-600', category: 'trigger', description: 'Triggered manually' },
    trigger_webhook: { label: 'Webhook', icon: 'trigger', gradient: 'from-purple-500 to-indigo-500', category: 'trigger', description: 'External HTTP trigger' },
    trigger_schedule: { label: 'Schedule', icon: 'trigger', gradient: 'from-cyan-500 to-blue-500', category: 'trigger', description: 'Runs on schedule' },
    // Actions - Green gradient
    action_send_email: { label: 'Send Email', icon: 'email', gradient: 'from-emerald-500 to-green-600', category: 'action', description: 'Send an email' },
    action_create_task: { label: 'Create Task', icon: 'task', gradient: 'from-green-500 to-emerald-600', category: 'action', description: 'Create a task' },
    action_update_lead: { label: 'Update Lead', icon: 'action', gradient: 'from-teal-500 to-green-500', category: 'action', description: 'Modify lead fields' },
    action_create_note: { label: 'Create Note', icon: 'action', gradient: 'from-green-500 to-teal-500', category: 'action', description: 'Add a note' },
    action_http_request: { label: 'HTTP Request', icon: 'action', gradient: 'from-amber-500 to-orange-500', category: 'action', description: 'Make API call' },
    action_set_variable: { label: 'Set Variable', icon: 'data', gradient: 'from-violet-500 to-purple-500', category: 'action', description: 'Store value' },
    // Logic - Orange/Yellow gradient
    logic_if_else: { label: 'If / Else', icon: 'logic', gradient: 'from-amber-500 to-yellow-500', category: 'logic', description: 'Conditional branch' },
    logic_switch: { label: 'Switch', icon: 'logic', gradient: 'from-orange-500 to-amber-500', category: 'logic', description: 'Multi-way branch' },
    logic_delay: { label: 'Delay', icon: 'logic', gradient: 'from-slate-500 to-gray-500', category: 'logic', description: 'Wait before continuing' },
    // Data - Purple gradient
    data_get_lead: { label: 'Get Lead', icon: 'data', gradient: 'from-purple-500 to-violet-500', category: 'data', description: 'Fetch lead data' },
    data_get_customer: { label: 'Get Customer', icon: 'data', gradient: 'from-fuchsia-500 to-purple-500', category: 'data', description: 'Fetch customer data' },
    data_transform: { label: 'Transform', icon: 'data', gradient: 'from-pink-500 to-fuchsia-500', category: 'data', description: 'Transform data' }
};

// Custom Node Component
const WorkflowNode = ({ node, config, isSelected, onClick, onDragStart, onDragEnd, onConnect, connecting }) => {
    return (
        <div
            className={`absolute cursor-move transition-all duration-200 ${isSelected ? 'scale-105 z-20' : 'z-10'}`}
            style={{ left: node.position.x, top: node.position.y }}
            onClick={onClick}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            {/* Node Card */}
            <div className={`w-44 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm ${isSelected ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : ''
                }`}>
                {/* Header with gradient */}
                <div className={`bg-gradient-to-r ${config.gradient} px-3 py-2.5 flex items-center gap-2`}>
                    <span className="text-white/90">{NodeIcons[config.icon] || NodeIcons.action}</span>
                    <span className="text-white font-medium text-sm truncate">{config.label}</span>
                </div>

                {/* Body */}
                <div className="bg-white dark:bg-slate-800 px-3 py-2.5 border-t border-white/10">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {node.data?.config?.subject || node.data?.config?.title || node.data?.config?.url || config.description}
                    </p>
                </div>
            </div>

            {/* Input Handle (Left) */}
            {!node.type.startsWith('trigger_') && (
                <div
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (connecting) onConnect(connecting, node.id);
                    }}
                >
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                </div>
            )}

            {/* Output Handle (Right) */}
            <div
                className={`absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center cursor-crosshair transition-all ${connecting === node.id ? 'bg-indigo-500 scale-125' : 'bg-indigo-400 hover:bg-indigo-500 hover:scale-110'
                    }`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (connecting && connecting !== node.id) {
                        onConnect(connecting, node.id);
                    } else if (!connecting) {
                        onConnect(node.id, null);
                    }
                }}
            >
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
            </div>

            {/* If/Else handles */}
            {node.type === 'logic_if_else' && (
                <>
                    <div className="absolute -right-3 top-1/4 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow text-[8px] font-bold text-white flex items-center justify-center">Y</div>
                    <div className="absolute -right-3 bottom-1/4 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow text-[8px] font-bold text-white flex items-center justify-center">N</div>
                </>
            )}
        </div>
    );
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
    const [zoom, setZoom] = useState(1);
    const [showLogs, setShowLogs] = useState(false);
    const [executions, setExecutions] = useState([]);
    const [emailTemplates, setEmailTemplates] = useState([]);

    useEffect(() => {
        fetchWorkflow();
        fetchTemplates();
    }, [id]);

    const fetchTemplates = async () => {
        try {
            const res = await workflowAPI.getTemplates();
            setEmailTemplates(res.data || []);
        } catch (err) {
            console.log('Templates not available');
        }
    };

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

            if (!canvasData?.nodes?.length && res.data.trigger_type) {
                const config = nodeTypeConfig[res.data.trigger_type];
                setNodes([{
                    id: 'trigger-1',
                    type: res.data.trigger_type,
                    position: { x: 100, y: 150 },
                    data: { label: config?.label || 'Trigger', config: {} }
                }]);
            }

            // Fetch executions
            const execRes = await workflowAPI.getExecutions(id, 10);
            setExecutions(execRes.data || []);
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
            await workflowAPI.update(id, { canvas_data: { nodes, edges } });
            toast.success('Workflow saved!');
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleRun = async () => {
        try {
            await workflowAPI.run(id);
            toast.success('Workflow started!');
            setTimeout(() => fetchWorkflow(), 2000);
        } catch (error) {
            toast.error('Failed to run');
        }
    };

    const addNode = (type) => {
        const config = nodeTypeConfig[type];
        setNodes([...nodes, {
            id: `${type}-${Date.now()}`,
            type,
            position: { x: 250 + Math.random() * 50, y: 100 + nodes.length * 100 },
            data: { label: config?.label, config: {} }
        }]);
    };

    const deleteNode = (nodeId) => {
        setNodes(nodes.filter(n => n.id !== nodeId));
        setEdges(edges.filter(e => e.source !== nodeId && e.target !== nodeId));
        if (selectedNode?.id === nodeId) setSelectedNode(null);
    };

    const updateNodeConfig = (nodeId, config) => {
        setNodes(nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, config } } : n));
        setSelectedNode(prev => prev?.id === nodeId ? { ...prev, data: { ...prev.data, config } } : prev);
    };

    const handleNodeDrag = useCallback((nodeId, deltaX, deltaY) => {
        setNodes(prev => prev.map(n =>
            n.id === nodeId ? { ...n, position: { x: n.position.x + deltaX, y: n.position.y + deltaY } } : n
        ));
    }, []);

    const handleConnect = (sourceId, targetId) => {
        if (!targetId) {
            setConnecting(sourceId);
            return;
        }
        if (sourceId === targetId) {
            setConnecting(null);
            return;
        }
        if (!edges.some(e => e.source === sourceId && e.target === targetId)) {
            setEdges([...edges, { id: `e-${Date.now()}`, source: sourceId, target: targetId }]);
        }
        setConnecting(null);
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading workflow...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-100 dark:bg-slate-950">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/automation/workflows')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                        <h1 className="font-semibold text-slate-800 dark:text-white">{workflow?.name}</h1>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className={`w-2 h-2 rounded-full ${workflow?.is_active ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                            {workflow?.is_active ? 'Active' : 'Inactive'}
                            <span className="mx-1">•</span>
                            {nodes.length} nodes
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowLogs(!showLogs)} className={`btn-ghost btn-sm ${showLogs ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Logs
                    </button>
                    <button onClick={handleRun} className="btn-secondary btn-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Test Run
                    </button>
                    <button onClick={handleSave} className="btn-primary btn-sm" disabled={saving}>
                        {saving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Enhanced Node Palette */}
                <div className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-medium text-slate-700 dark:text-slate-300 text-sm">Add Node</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                        {['trigger', 'action', 'logic', 'data'].map(category => (
                            <div key={category}>
                                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                                    {NodeIcons[category]}
                                    {category}s
                                </h4>
                                <div className="space-y-1">
                                    {Object.entries(nodeTypeConfig)
                                        .filter(([_, c]) => c.category === category)
                                        .map(([type, config]) => (
                                            <button
                                                key={type}
                                                onClick={() => addNode(type)}
                                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors group"
                                            >
                                                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${config.gradient}`}></span>
                                                <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                                                    {config.label}
                                                </span>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Zoom Controls */}
                    <div className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-1">
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>
                        <span className="px-2 text-xs font-medium text-slate-600 dark:text-slate-400">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <button onClick={() => setZoom(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs">
                            Reset
                        </button>
                    </div>

                    {/* Connection hint */}
                    {connecting && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm shadow-lg">
                            Click another node to connect, or click anywhere to cancel
                        </div>
                    )}

                    {/* Canvas Container */}
                    <div
                        ref={canvasRef}
                        className="w-full h-full overflow-auto"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 1px, transparent 1px)',
                            backgroundSize: `${20 * zoom}px ${20 * zoom}px`
                        }}
                        onClick={() => connecting && setConnecting(null)}
                    >
                        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', minWidth: '2000px', minHeight: '1500px', position: 'relative' }}>
                            {/* Edges SVG */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
                                    </marker>
                                    <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#818cf8" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                                {edges.map(edge => {
                                    const source = nodes.find(n => n.id === edge.source);
                                    const target = nodes.find(n => n.id === edge.target);
                                    if (!source || !target) return null;

                                    const x1 = source.position.x + 176;
                                    const y1 = source.position.y + 35;
                                    const x2 = target.position.x;
                                    const y2 = target.position.y + 35;
                                    const midX = (x1 + x2) / 2;
                                    const controlOffset = Math.min(Math.abs(x2 - x1) / 2, 150);

                                    return (
                                        <g key={edge.id} className="pointer-events-auto" onClick={(e) => { e.stopPropagation(); setEdges(edges.filter(e => e.id !== edge.id)); }}>
                                            {/* Shadow */}
                                            <path
                                                d={`M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`}
                                                stroke="rgba(99, 102, 241, 0.2)"
                                                strokeWidth="6"
                                                fill="none"
                                            />
                                            {/* Main line */}
                                            <path
                                                d={`M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`}
                                                stroke="url(#edgeGradient)"
                                                strokeWidth="2"
                                                fill="none"
                                                markerEnd="url(#arrowhead)"
                                                className="cursor-pointer hover:stroke-red-500 transition-colors"
                                            />
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Nodes */}
                            {nodes.map(node => (
                                <WorkflowNode
                                    key={node.id}
                                    node={node}
                                    config={nodeTypeConfig[node.type] || { label: node.type, gradient: 'from-slate-500 to-slate-600', icon: 'action' }}
                                    isSelected={selectedNode?.id === node.id}
                                    onClick={() => setSelectedNode(node)}
                                    onDragStart={(e) => setDragging({ nodeId: node.id, startX: e.clientX, startY: e.clientY })}
                                    onDragEnd={(e) => {
                                        if (dragging) {
                                            handleNodeDrag(node.id, (e.clientX - dragging.startX) / zoom, (e.clientY - dragging.startY) / zoom);
                                            setDragging(null);
                                        }
                                    }}
                                    onConnect={handleConnect}
                                    connecting={connecting}
                                />
                            ))}

                            {/* Empty state */}
                            {nodes.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center p-8 bg-white/80 dark:bg-slate-800/80 rounded-2xl backdrop-blur-sm shadow-xl">
                                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Start Building</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mb-4">Select a node from the left panel to begin</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Config Panel (Right) */}
                {selectedNode && !showLogs && (
                    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${nodeTypeConfig[selectedNode.type]?.gradient || 'from-slate-500 to-slate-600'} flex items-center justify-center text-white`}>
                                    {NodeIcons[nodeTypeConfig[selectedNode.type]?.icon] || NodeIcons.action}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                                        {nodeTypeConfig[selectedNode.type]?.label}
                                    </h3>
                                    <p className="text-xs text-slate-500">{nodeTypeConfig[selectedNode.type]?.description}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Email Config */}
                            {selectedNode.type === 'action_send_email' && (
                                <>
                                    {emailTemplates.length > 0 && (
                                        <div>
                                            <label className="label">Email Template (Optional)</label>
                                            <select className="select" value={selectedNode.data?.config?.template_id || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, template_id: e.target.value ? parseInt(e.target.value) : null })}>
                                                <option value="">Custom Email</option>
                                                {emailTemplates.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-slate-400 mt-1">Template overrides subject & body</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="label">Email Template</label>
                                        <select
                                            className="select"
                                            value={selectedNode.data?.config?.template_id || ''}
                                            onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, template_id: e.target.value ? parseInt(e.target.value) : null })}
                                        >
                                            <option value="">Custom Email (write below)</option>
                                            {emailTemplates.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        {emailTemplates.length === 0 ? (
                                            <p className="text-xs text-amber-500 mt-1">No templates found. Create templates in Email Templates section.</p>
                                        ) : (
                                            <p className="text-xs text-slate-400 mt-1">Template overrides subject & body at runtime</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="label">Recipient</label>
                                        <input type="text" className="input" placeholder="{{trigger.email}}" value={selectedNode.data?.config?.recipientField || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, recipientField: e.target.value })} />
                                        <p className="text-xs text-slate-400 mt-1">Use <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{'{{field}}'}</code> for variables</p>
                                    </div>
                                    <div>
                                        <label className="label">Subject</label>
                                        <input type="text" className="input" placeholder="Welcome {{trigger.name}}!" value={selectedNode.data?.config?.subject || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, subject: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Body (HTML)</label>
                                        <textarea className="input font-mono text-sm" rows={6} placeholder="<p>Hello {{trigger.name}},</p>" value={selectedNode.data?.config?.body || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, body: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {/* Task Config */}
                            {selectedNode.type === 'action_create_task' && (
                                <>
                                    <div>
                                        <label className="label">Task Title</label>
                                        <input type="text" className="input" placeholder="Follow up with {{trigger.name}}" value={selectedNode.data?.config?.title || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Description</label>
                                        <textarea className="input" rows={3} placeholder="Task details..." value={selectedNode.data?.config?.description || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, description: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Priority</label>
                                        <select className="select" value={selectedNode.data?.config?.priority || 'medium'} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, priority: e.target.value })}>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* If/Else Config */}
                            {selectedNode.type === 'logic_if_else' && (
                                <>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-300">
                                        <p className="font-medium mb-1">Conditional Branch</p>
                                        <p className="text-xs opacity-80">If condition is true → Yes path. Otherwise → No path.</p>
                                    </div>
                                    <div>
                                        <label className="label">Field to Check</label>
                                        <input type="text" className="input" placeholder="trigger.score" value={selectedNode.data?.config?.field || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, field: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Condition</label>
                                        <select className="select" value={selectedNode.data?.config?.operator || 'equals'} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, operator: e.target.value })}>
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
                                        <label className="label">Compare Value</label>
                                        <input type="text" className="input" placeholder="50" value={selectedNode.data?.config?.value || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, value: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {/* Delay Config */}
                            {selectedNode.type === 'logic_delay' && (
                                <div>
                                    <label className="label">Wait Duration</label>
                                    <div className="flex gap-2">
                                        <input type="number" className="input flex-1" placeholder="5" value={selectedNode.data?.config?.minutes || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, minutes: parseInt(e.target.value) || 0 })} />
                                        <span className="flex items-center text-slate-500 text-sm">minutes</span>
                                    </div>
                                </div>
                            )}

                            {/* HTTP Request Config */}
                            {selectedNode.type === 'action_http_request' && (
                                <>
                                    <div>
                                        <label className="label">URL</label>
                                        <input type="text" className="input" placeholder="https://api.example.com/webhook" value={selectedNode.data?.config?.url || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, url: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">Method</label>
                                        <select className="select" value={selectedNode.data?.config?.method || 'POST'} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, method: e.target.value })}>
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Update Lead Config */}
                            {selectedNode.type === 'action_update_lead' && (
                                <>
                                    <div>
                                        <label className="label">New Status</label>
                                        <select className="select" value={selectedNode.data?.config?.status || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, status: e.target.value })}>
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
                                        <label className="label">Add to Score</label>
                                        <input type="number" className="input" placeholder="10" value={selectedNode.data?.config?.score || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, score: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </>
                            )}

                            {/* Schedule Trigger Config */}
                            {selectedNode.type === 'trigger_schedule' && (
                                <>
                                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3 text-sm text-cyan-700 dark:text-cyan-300">
                                        <p className="font-medium mb-1">Scheduled Execution</p>
                                        <p className="text-xs opacity-80">Run this workflow automatically on a schedule.</p>
                                    </div>
                                    <div>
                                        <label className="label">Run Every</label>
                                        <div className="flex gap-2">
                                            <input type="number" className="input flex-1" placeholder="60" value={selectedNode.data?.config?.interval_minutes || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, interval_minutes: parseInt(e.target.value) || 60 })} />
                                            <span className="flex items-center text-slate-500 text-sm">minutes</span>
                                        </div>
                                    </div>
                                    <div className="text-center text-slate-400 text-xs">— OR —</div>
                                    <div>
                                        <label className="label">Run at Specific Time</label>
                                        <input type="time" className="input" value={selectedNode.data?.config?.run_time || ''} onChange={(e) => updateNodeConfig(selectedNode.id, { ...selectedNode.data?.config, run_time: e.target.value })} />
                                        <p className="text-xs text-slate-400 mt-1">Daily at this time (server timezone)</p>
                                    </div>
                                </>
                            )}

                            {/* Webhook Trigger Config */}
                            {selectedNode.type === 'trigger_webhook' && (
                                <>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-sm text-purple-700 dark:text-purple-300">
                                        <p className="font-medium mb-1">Webhook Trigger</p>
                                        <p className="text-xs opacity-80">External systems can POST to your webhook URL to trigger this workflow.</p>
                                    </div>
                                    {workflow?.settings?.webhook_token ? (
                                        <div>
                                            <label className="label">Webhook URL</label>
                                            <input type="text" className="input font-mono text-xs" readOnly value={`${window.location.origin.replace(':5173', ':3001')}/api/workflows/webhook/${workflow.settings.webhook_token}`} />
                                            <p className="text-xs text-slate-400 mt-1">POST JSON data to this URL</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-slate-500 mb-2">Generate a webhook URL to enable</p>
                                            <button
                                                className="btn-primary btn-sm"
                                                onClick={async () => {
                                                    try {
                                                        await workflowAPI.generateWebhook(id);
                                                        await fetchWorkflow();
                                                        toast.success('Webhook URL generated!');
                                                    } catch (err) {
                                                        toast.error('Failed to generate webhook');
                                                    }
                                                }}
                                            >
                                                Generate Webhook
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Trigger info */}
                            {selectedNode.type?.startsWith('trigger_') && selectedNode.type !== 'trigger_schedule' && selectedNode.type !== 'trigger_webhook' && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-blue-800 dark:text-blue-300 text-sm">Trigger Node</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">This workflow starts when this event occurs. All trigger data is available as <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">trigger.*</code></p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Delete button */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => deleteNode(selectedNode.id)} className="w-full btn-secondary text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Node
                            </button>
                        </div>
                    </div>
                )}

                {/* Logs Panel */}
                {showLogs && (
                    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 dark:text-white">Execution Logs</h3>
                            <button onClick={() => setShowLogs(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {executions.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No executions yet
                                </div>
                            ) : (
                                executions.map(exec => (
                                    <div key={exec.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${exec.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                                                exec.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                                                }`}>{exec.status}</span>
                                            <span className="text-xs text-slate-400">{new Date(exec.started_at).toLocaleTimeString()}</span>
                                        </div>
                                        {exec.error_message && (
                                            <p className="text-xs text-red-500 mt-1 truncate">{exec.error_message}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
