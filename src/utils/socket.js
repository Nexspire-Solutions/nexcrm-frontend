/**
 * Socket.io Client Utility
 * Manages WebSocket connection for real-time features
 */
import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize socket connection with auth token
 */
export const initSocket = (token) => {
    if (socket?.connected) {
        return socket;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    socket = io(API_URL, {
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
