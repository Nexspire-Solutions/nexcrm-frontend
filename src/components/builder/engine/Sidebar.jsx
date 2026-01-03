import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { COMPONENT_SCHEMA } from '../lib/schema';
import { UI_KIT_TEMPLATES } from '../lib/templates';

const SidebarItem = ({ type, schema }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `sidebar-${type}`,
        data: { type, isSidebar: true }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        opacity: 0.8,
        position: 'fixed', // Break out of container during drag
        left: '20px', // Helper for initial position fix if needed (though dnd-kit usually handles it)
        top: '100px'
    } : undefined;

    const Icon = schema.icon;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="flex flex-col items-center gap-2 p-3 rounded-lg cursor-grab hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
            title={schema.label}
            style={style}
        >
            <div className="text-slate-400 group-hover:text-indigo-600 transition-colors text-2xl">
                <Icon />
            </div>
            <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">{schema.label}</span>
        </div>
    );
};

const SidebarTemplate = ({ name, template }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `template-${name}`,
        data: { type: 'TEMPLATE', template, isSidebar: true }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        opacity: 0.8,
        position: 'fixed'
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-grab hover:border-indigo-300 hover:shadow-sm transition-all text-left"
        >
            <div className="font-bold text-xs text-slate-700 mb-1">{name.replace(/([A-Z])/g, ' $1').trim()}</div>
            <div className="text-[10px] text-slate-400">Drag to add section</div>
        </div>
    );
};

const Sidebar = () => {
    return (
        <div className="w-64 border-r border-slate-200 bg-white flex flex-col h-full">
            <div className="p-4 border-b border-slate-200">
                <h2 className="font-bold text-slate-800">Elements</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Basic Components */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Components</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(COMPONENT_SCHEMA).map(([type, schema]) => (
                            <SidebarItem key={type} type={type} schema={schema} />
                        ))}
                    </div>
                </div>

                {/* Templates */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">UI Kit / Templates</h3>
                    <div className="space-y-2">
                        {Object.entries(UI_KIT_TEMPLATES).map(([name, template]) => (
                            <SidebarTemplate key={name} name={name} template={template} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
