/**
 * ProHeader - Premium Page Header Component
 * 
 * Ultra-modern header with gradient text, animations, and breadcrumb navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export default function ProHeader({ title, subtitle, breadcrumbs = [], actions, gradient = false }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
            <div>
                {breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={crumb.label}>
                                {idx > 0 && (
                                    <FiChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                                )}
                                {crumb.to ? (
                                    <Link
                                        to={crumb.to}
                                        className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-slate-900 dark:text-white font-medium">
                                        {crumb.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${gradient
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm md:text-base">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3 flex-shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}
