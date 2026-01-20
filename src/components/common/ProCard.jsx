/**
 * ProCard - Premium Card Component
 * 
 * Ultra-modern card with glassmorphism, hover effects, and animations
 */

import React from 'react';

export default function ProCard({
    children,
    title,
    subtitle,
    action,
    className = '',
    noPadding = false,
    premium = false,
    gradient = false,
    glow = false,
    onClick = null
}) {
    const baseClasses = `
        bg-white dark:bg-slate-800 rounded-2xl 
        border border-slate-200/60 dark:border-slate-700/60 
        shadow-sm overflow-hidden 
        transition-all duration-300
    `;

    const premiumClasses = premium ? `
        hover:shadow-xl hover:shadow-indigo-500/10 
        dark:hover:shadow-indigo-500/5 
        hover:border-indigo-200 dark:hover:border-indigo-800/50
        hover:-translate-y-1
    ` : '';

    const gradientClasses = gradient ? `
        bg-gradient-to-br from-white to-slate-50 
        dark:from-slate-800 dark:to-slate-900
    ` : '';

    const glowClasses = glow ? 'glow' : '';

    return (
        <div
            className={`${baseClasses} ${premiumClasses} ${gradientClasses} ${glowClasses} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {(title || action) && (
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/50">
                    <div>
                        {title && (
                            <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
}
