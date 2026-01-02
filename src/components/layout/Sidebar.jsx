import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTenantConfig } from '../../contexts/TenantConfigContext';
import { useState } from 'react';

// Professional SVG Icons
const Icons = {
    dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    employees: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    inquiries: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    leads: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    activity: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    customers: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    bulkMail: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    ),
    campaign: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
    ),
    chat: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
    ),
    chatbot: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    notification: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    ),
    chevronDown: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    ),
    logout: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    sun: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
    ),
    moon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
    ),
    products: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
    ),
    orders: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    chart: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    inventory: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
    ),
    returns: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
        </svg>
    ),
    reviews: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    ),
    coupon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
    ),
    shipping: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
    ),
    truck: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
    ),
    cms: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    ),
    vendor: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    store: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
    ),
    property: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    medical: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
    book: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    hotel: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m16-10h.01M3 11h.01M12 11h.01M5 15h14M5 19h14M9 7h6" />
        </svg>
    ),
    fitness: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
    ),
    legal: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
    ),
    factory: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    restaurant: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    scissors: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
        </svg>
    ),
};

export default function Sidebar({ isOpen, setIsOpen }) {
    const { user, logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const { hasModule, loading: configLoading, getIndustry } = useTenantConfig();
    const navigate = useNavigate();
    const location = useLocation();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isGroupActive = (paths) => {
        return paths.some(path => location.pathname.startsWith(path));
    };

    // Get current industry
    const currentIndustry = getIndustry();

    // Main navigation items (always visible based on role)
    const mainNavItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: Icons.dashboard,
            roles: ['admin', 'manager', 'sales_operator', 'user']
        },
        {
            name: 'Employees',
            path: '/employees',
            icon: Icons.employees,
            roles: ['admin', 'manager']
        },
        {
            name: 'Users & Permissions',
            path: '/users',
            icon: Icons.users,
            roles: ['admin']
        },
        {
            name: 'Inquiries',
            path: '/inquiries',
            icon: Icons.inquiries,
            roles: ['admin', 'manager', 'sales_operator']
        }
    ];

    // Sales & CRM group (available for all industries)
    const salesGroup = {
        name: 'Sales & CRM',
        icon: Icons.leads,
        roles: ['admin', 'manager', 'sales_operator'],
        items: [
            { name: 'All Leads', path: '/leads', icon: Icons.leads, end: true },
            { name: 'Customers', path: '/leads/customers', icon: Icons.customers },
            { name: 'Activity & History', path: '/leads/activity', icon: Icons.activity },
            { name: 'Settings', path: '/leads/settings', icon: Icons.settings }
        ]
    };

    // Industry-Specific Menu Groups
    const industryMenus = {
        ecommerce: {
            name: 'Store',
            icon: Icons.store,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Products', path: '/products', icon: Icons.products },
                { name: 'Inventory', path: '/inventory', icon: Icons.inventory },
                { name: 'Orders', path: '/orders', icon: Icons.orders },
                { name: 'Returns', path: '/returns', icon: Icons.returns },
                { name: 'Shipping', path: '/shipping', icon: Icons.truck },
                { name: 'Customers', path: '/customers', icon: Icons.customers },
                { name: 'Reviews', path: '/reviews', icon: Icons.reviews },
                { name: 'Coupons', path: '/coupons', icon: Icons.coupon },
                { name: 'CMS', path: '/cms', icon: Icons.cms },
                { name: 'Vendors', path: '/vendors', icon: Icons.vendor },
                { name: 'Reports', path: '/reports', icon: Icons.chart }
            ]
        },
        realestate: {
            name: 'Properties',
            icon: Icons.property,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'All Properties', path: '/properties', icon: Icons.property },
                { name: 'Viewings', path: '/viewings', icon: Icons.calendar },
                { name: 'Listings', path: '/listings', icon: Icons.orders }
            ]
        },
        healthcare: {
            name: 'Clinic',
            icon: Icons.medical,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Patients', path: '/patients', icon: Icons.users },
                { name: 'Appointments', path: '/appointments', icon: Icons.calendar },
                { name: 'Prescriptions', path: '/prescriptions', icon: Icons.orders }
            ]
        },
        hospitality: {
            name: 'Hotel',
            icon: Icons.hotel,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Rooms', path: '/rooms', icon: Icons.hotel },
                { name: 'Reservations', path: '/reservations', icon: Icons.calendar },
                { name: 'Housekeeping', path: '/housekeeping', icon: Icons.activity }
            ]
        },
        education: {
            name: 'Academy',
            icon: Icons.book,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Courses', path: '/courses', icon: Icons.book },
                { name: 'Students', path: '/students', icon: Icons.users },
                { name: 'Enrollments', path: '/enrollments', icon: Icons.orders }
            ]
        },
        fitness: {
            name: 'Gym',
            icon: Icons.fitness,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Members', path: '/members', icon: Icons.users },
                { name: 'Classes', path: '/classes', icon: Icons.calendar },
                { name: 'Trainers', path: '/trainers', icon: Icons.employees }
            ]
        },
        legal: {
            name: 'Law Firm',
            icon: Icons.legal,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Cases', path: '/cases', icon: Icons.legal },
                { name: 'Documents', path: '/documents', icon: Icons.orders },
                { name: 'Billing', path: '/billing', icon: Icons.chart }
            ]
        },
        manufacturing: {
            name: 'Factory',
            icon: Icons.factory,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Production', path: '/production', icon: Icons.factory },
                { name: 'Work Orders', path: '/work-orders', icon: Icons.orders },
                { name: 'Inventory', path: '/inventory', icon: Icons.inventory }
            ]
        },
        logistics: {
            name: 'Fleet',
            icon: Icons.truck,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Shipments', path: '/shipments', icon: Icons.truck },
                { name: 'Tracking', path: '/tracking', icon: Icons.activity },
                { name: 'Vehicles', path: '/vehicles', icon: Icons.truck }
            ]
        },
        restaurant: {
            name: 'Kitchen',
            icon: Icons.restaurant,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Menu', path: '/menu', icon: Icons.products },
                { name: 'Orders', path: '/kitchen-orders', icon: Icons.orders },
                { name: 'Tables', path: '/tables', icon: Icons.calendar }
            ]
        },
        salon: {
            name: 'Salon',
            icon: Icons.scissors,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Bookings', path: '/bookings', icon: Icons.calendar },
                { name: 'Services', path: '/salon-services', icon: Icons.activity },
                { name: 'Staff', path: '/staff', icon: Icons.employees }
            ]
        },
        services: {
            name: 'Services',
            icon: Icons.activity,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Appointments', path: '/appointments', icon: Icons.calendar },
                { name: 'Services', path: '/services', icon: Icons.settings },
                { name: 'Clients', path: '/clients', icon: Icons.users }
            ]
        },
        general: {
            name: 'Business',
            icon: Icons.chart,
            roles: ['admin', 'manager', 'sales_operator'],
            items: [
                { name: 'Analytics', path: '/analytics', icon: Icons.chart },
                { name: 'Reports', path: '/reports', icon: Icons.orders }
            ]
        }
    };

    // Communications group (available for all industries)
    const communicationsGroup = {
        name: 'Communications',
        icon: Icons.email,
        roles: ['admin', 'manager'],
        items: [
            { name: 'Email Templates', path: '/communications/templates', icon: Icons.email },
            { name: 'Bulk Mailing', path: '/communications/bulk-mail', icon: Icons.bulkMail },
            { name: 'Email Campaigns', path: '/communications/campaigns', icon: Icons.campaign },
            { name: 'Team Chat', path: '/communications/chat', icon: Icons.chat },
            { name: 'Chatbot', path: '/communications/chatbot', icon: Icons.chatbot },
            { name: 'Push Notifications', path: '/communications/notifications', icon: Icons.notification },
            { name: 'SMTP Settings', path: '/settings/smtp', icon: Icons.settings, roles: ['admin'] }
        ]
    };

    // Automation group (admin only)
    const automationGroup = {
        name: 'Automation',
        icon: Icons.activity,
        roles: ['admin'],
        items: [
            { name: 'Workflows', path: '/automation/workflows', icon: Icons.chart }
        ]
    };

    const userRole = user?.role || 'user';

    // Filter main nav by role
    const filteredMainNav = mainNavItems.filter(item =>
        item.roles.includes(userRole)
    );

    // Check permissions
    const canViewSales = salesGroup.roles.includes(userRole);
    const canViewCommunications = communicationsGroup.roles.includes(userRole);

    // Get current industry menu group
    const industryGroup = industryMenus[currentIndustry] || industryMenus.general;
    const canViewIndustry = industryGroup && industryGroup.roles.includes(userRole);

    const NavItem = ({ item, isSubItem = false }) => (
        <NavLink
            to={item.path}
            end={item.end}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isSubItem ? 'ml-4 text-sm' : ''
                } ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
            }
        >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="font-medium truncate">{item.name}</span>
        </NavLink>
    );

    const NavGroup = ({ group }) => {
        const isActive = isGroupActive(group.items.map(i => i.path));

        return (
            <div className="space-y-1 mb-6">
                <div className={`flex items-center gap-2 px-3 mb-2 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    <span className="opacity-70">{group.icon}</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                        {group.name}
                    </h3>
                </div>

                <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-0">
                    {group.items.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-r-lg text-sm transition-all duration-200 border-l-2 -ml-[2px] ${isActive
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium'
                                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                                }`
                            }
                        >
                            <span className="truncate">{item.name}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>

                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">NexCRM</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                    >
                        {Icons.close}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
                    {/* Main Menu */}
                    <div className="space-y-1 mb-6">
                        <div className="flex items-center gap-2 px-3 mb-2 text-slate-500 dark:text-slate-400">
                            <span className="opacity-70">{Icons.dashboard}</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider">
                                Main Menu
                            </h3>
                        </div>
                        <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-0">
                            {filteredMainNav.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-r-lg text-sm transition-all duration-200 border-l-2 -ml-[2px] ${isActive
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium'
                                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`
                                    }
                                >
                                    <span className="truncate">{item.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Sales & CRM Group */}
                    {canViewSales && <NavGroup group={salesGroup} />}

                    {/* Industry-Specific Module (based on getIndustry) */}
                    {canViewIndustry && <NavGroup group={industryGroup} />}

                    {/* Communications Group */}
                    {canViewCommunications && <NavGroup group={communicationsGroup} />}

                    {/* Automation Group */}
                    {automationGroup.roles.includes(userRole) && <NavGroup group={automationGroup} />}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                        </span>
                        <div className={`relative w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center transition-all ${isDark ? 'left-5' : 'left-0.5'}`}>
                                {isDark ? <span className="text-indigo-600">{Icons.moon}</span> : <span className="text-amber-500">{Icons.sun}</span>}
                            </span>
                        </div>
                    </button>

                    {/* User Info & Logout */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                        >
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                {user?.firstName?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {user?.firstName || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">
                                    {user?.role || 'user'}
                                </p>
                            </div>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Logout"
                        >
                            {Icons.logout}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
