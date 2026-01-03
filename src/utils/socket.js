/**
 * Socket.io Client Utility
 * Manages WebSocket connection for real-time features
 */
import { io } from 'socket.io-client';

let socket = null;

/**
 * Get socket URL dynamically (same logic as axios.js)
 */
const getSocketUrl = () => {
    // Development mode
    if (import.meta.env.DEV) {
        if (import.meta.env.VITE_API_URL) {
            // Remove /api suffix for socket connection
            return import.meta.env.VITE_API_URL.replace('/api', '');
        }
        return 'http://localhost:3001';
    }

    // Production - use tenant-specific API URL
    const hostname = window.location.hostname;

    // Match pattern: xxx-crm.nexspiresolutions.co.in -> xxx-crm-api.nexspiresolutions.co.in
    const dashCrmMatch = hostname.match(/^([a-z0-9-]+)-crm\.nexspiresolutions\.co\.in$/);
    if (dashCrmMatch) {
        return `https://${dashCrmMatch[1]}-crm-api.nexspiresolutions.co.in`;
    }

    // Legacy pattern: tenant.crm.nexspiresolutions.co.in
    if (hostname.includes('.crm.nexspiresolutions.co.in')) {
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'crm' && subdomain !== 'app') {
            return `https://${subdomain}-crm-api.nexspiresolutions.co.in`;
        }
    }

    // Fallback
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
};

/**
 * Initialize socket connection with auth token
 */
export const initSocket = (token) => {
    if (socket?.connected) {
        return socket;
    }

    const SOCKET_URL = getSocketUrl();
    console.log('[Socket] Connecting to:', SOCKET_URL);

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('[Socket] Connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
    });

    return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Join a chat channel room
 */
export const joinChannel = (channelId) => {
    if (socket?.connected) {
        socket.emit('join_channel', channelId);
    }
};

/**
 * Leave a chat channel room
 */
export const leaveChannel = (channelId) => {
    if (socket?.connected) {
        socket.emit('leave_channel', channelId);
    }
};

/**
 * Emit typing indicator
 */
export const emitTyping = (channelId, isTyping) => {
    if (socket?.connected) {
        socket.emit('typing', { channelId, isTyping });
    }
};

export default {
    initSocket,
    getSocket,
    disconnectSocket,
    joinChannel,
    leaveChannel,
    emitTyping,
};
