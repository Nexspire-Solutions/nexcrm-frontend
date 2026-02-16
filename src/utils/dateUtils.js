/**
 * Date Utilities for Frontend
 * Provides timezone-aware date formatting using user's stored timezone preference
 * 
 * All dates from the backend are UTC. This module converts them for display.
 */
import { format, formatDistanceToNow } from 'date-fns';
import { toZonedTime, format as formatTz, fromZonedTime } from 'date-fns-tz';

/**
 * Detect browser's timezone
 * @returns {string} IANA timezone identifier (e.g., 'Asia/Kolkata')
 */
export function detectTimezone() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
        return 'UTC';
    }
}

/**
 * Get user's timezone from context or fallback to detected
 * @param {Object} user - User object from auth context
 * @returns {string} Timezone identifier
 */
export function getUserTimezone(user) {
    return user?.timezone || detectTimezone();
}

/**
 * Format a UTC date for display in user's timezone
 * @param {string|Date} utcDate - UTC date string or Date object
 * @param {string} timezone - IANA timezone identifier
 * @param {string} formatStr - Format string (date-fns format)
 * @returns {string} Formatted date string
 */
export function formatDate(utcDate, timezone, formatStr = 'MMM d, yyyy') {
    if (!utcDate) return '-';
    try {
        const date = new Date(utcDate);
        if (isNaN(date.getTime())) return '-';

        const tz = timezone || 'UTC';
        const zonedDate = toZonedTime(date, tz);
        return formatTz(zonedDate, formatStr, { timeZone: tz });
    } catch (error) {
        console.warn('Date formatting error:', error);
        return format(new Date(utcDate), formatStr);
    }
}

/**
 * Format a UTC datetime for display
 * @param {string|Date} utcDate - UTC date string
 * @param {string} timezone - User's timezone
 * @returns {string} Formatted datetime (e.g., "Feb 6, 2026, 2:30 PM")
 */
export function formatDateTime(utcDate, timezone) {
    if (!utcDate) return '-';
    try {
        const date = new Date(utcDate);
        if (isNaN(date.getTime())) return '-';

        return date.toLocaleString('en-US', {
            timeZone: timezone || 'UTC',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.warn('DateTime formatting error:', error);
        return new Date(utcDate).toLocaleString();
    }
}

/**
 * Format time only
 * @param {string|Date} utcDate - UTC date string
 * @param {string} timezone - User's timezone
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export function formatTime(utcDate, timezone) {
    if (!utcDate) return '-';
    try {
        const date = new Date(utcDate);
        if (isNaN(date.getTime())) return '-';

        return date.toLocaleTimeString('en-US', {
            timeZone: timezone || 'UTC',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.warn('Time formatting error:', error);
        return new Date(utcDate).toLocaleTimeString();
    }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} utcDate - UTC date string
 * @param {string} timezone - User's timezone (for absolute date fallback)
 * @returns {string} Relative time string
 */
export function formatRelativeTime(utcDate, timezone) {
    if (!utcDate) return '-';

    const date = new Date(utcDate);
    if (isNaN(date.getTime())) return '-';

    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatDate(utcDate, timezone);
}

/**
 * Convert local date input to UTC for API submission
 * @param {string} localDateString - Local date string (e.g., from date picker)
 * @param {string} timezone - User's timezone
 * @returns {string} UTC ISO string
 */
export function localToUTC(localDateString, timezone) {
    if (!localDateString) return null;
    try {
        const tz = timezone || 'UTC';
        // Create a date object representing the local time in the specific timezone
        const utcDate = fromZonedTime(localDateString, tz);
        return utcDate.toISOString();
    } catch (error) {
        console.warn('localToUTC conversion error:', error);
        return new Date(localDateString).toISOString();
    }
}

/**
 * Get current date in user's timezone (YYYY-MM-DD)
 * @param {string} timezone - User's timezone
 * @returns {string} Date string
 */
export function getTodayDate(timezone) {
    return formatTz(new Date(), 'yyyy-MM-dd', { timeZone: timezone || 'UTC' });
}

/**
 * Common timezones for dropdown selection
 */
export const COMMON_TIMEZONES = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
    { value: 'Asia/Kolkata', label: 'IST (India Standard Time)', offset: '+05:30' },
    { value: 'Asia/Dubai', label: 'GST (Gulf Standard Time)', offset: '+04:00' },
    { value: 'Asia/Singapore', label: 'SGT (Singapore Time)', offset: '+08:00' },
    { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)', offset: '+09:00' },
    { value: 'Europe/London', label: 'GMT/BST (London)', offset: '+00:00' },
    { value: 'Europe/Paris', label: 'CET (Central European Time)', offset: '+01:00' },
    { value: 'America/New_York', label: 'EST/EDT (Eastern Time)', offset: '-05:00' },
    { value: 'America/Chicago', label: 'CST/CDT (Central Time)', offset: '-06:00' },
    { value: 'America/Denver', label: 'MST/MDT (Mountain Time)', offset: '-07:00' },
    { value: 'America/Los_Angeles', label: 'PST/PDT (Pacific Time)', offset: '-08:00' },
    { value: 'Australia/Sydney', label: 'AEST (Australian Eastern)', offset: '+10:00' }
];

export default {
    detectTimezone,
    getUserTimezone,
    formatDate,
    formatDateTime,
    formatTime,
    formatRelativeTime,
    localToUTC,
    getTodayDate,
    COMMON_TIMEZONES
};
