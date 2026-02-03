import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FiType, FiImage, FiBox, FiLayout, FiTrendingUp, FiMail, FiMessageSquare, FiHelpCircle, FiUsers, FiStar, FiAward } from 'react-icons/fi';
import { PRO_SECTIONS } from './lib/ProfessionalSections';

const ToolItem = ({ type, label, icon, data }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `tool-${type}`,
        data: { type, isTool: true, structure: data } // Pass full structure if available
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        opacity: 0.8
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="flex items-center gap-3 p-3 mb-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab hover:border-indigo-500 shadow-sm"
        >
            <span className="text-xl text-slate-500">{icon}</span>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{label}</span>
        </div>
    );
};

const SidebarTools = () => {
    return (
        <div className="w-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col h-full overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Elements</h3>
            <ToolItem type="text" label="Text Block" icon={<FiType />} />
            <ToolItem type="image" label="Image" icon={<FiImage />} />
            <ToolItem type="button" label="Button" icon={<FiBox />} />
            <ToolItem type="container" label="Container" icon={<FiLayout />} />

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-6">Smart Widgets</h3>
            <ToolItem type="hero" label="Hero Banner" icon={<FiImage />} />
            <ToolItem type="features" label="Features Grid" icon={<FiLayout />} />
            <ToolItem type="pricing" label="Pricing Table" icon={<FiBox />} />
            <ToolItem type="cta" label="Call to Action" icon={<FiTrendingUp />} />
            <ToolItem type="form" label="Contact Form" icon={<FiMail />} />
            <ToolItem type="testimonials" label="Testimonials" icon={<FiMessageSquare />} />
            <ToolItem type="faq" label="FAQ Accordion" icon={<FiHelpCircle />} />
            <ToolItem type="team" label="Team Members" icon={<FiUsers />} />
            <ToolItem type="dynamic_list" label="Dynamic List" icon={<FiBox />} />

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-6">Pro Sections</h3>
            <ToolItem type="section_pro" label="Hero Modern" icon={<FiStar />} data={PRO_SECTIONS.HeroModern} />
            <ToolItem type="section_pro" label="Feature Grid" icon={<FiLayout />} data={PRO_SECTIONS.FeatureGrid} />
            <ToolItem type="section_pro" label="Pricing Pro" icon={<FiAward />} data={PRO_SECTIONS.PricingPro} />
        </div>
    );
};

export default SidebarTools;
