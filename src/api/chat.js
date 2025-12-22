import apiClient from './axios';

/**
 * Chat API endpoints
 */
export const chatAPI = {
    /**
     * Get all channels for current user
     */
    getChannels: async () => {
        const response = await apiClient.get('/chat/channels');
        return response.data;
    },

    /**
     * Create a new channel
     */
    createChannel: async (data) => {
        const response = await apiClient.post('/chat/channels', data);
        return response.data;
    },

    /**
     * Get messages for a channel
     */
    getMessages: async (channelId, options = {}) => {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.before) params.append('before', options.before);

        const response = await apiClient.get(`/chat/channels/${channelId}/messages?${params}`);
        return response.data;
    },

    /**
     * Send a message to a channel
     */
    sendMessage: async (channelId, message) => {
        const response = await apiClient.post(`/chat/channels/${channelId}/messages`, { message });
        return response.data;
    },

    /**
     * Get all users for direct messaging
     */
    getUsers: async () => {
        const response = await apiClient.get('/chat/users');
        return response.data;
    },

    /**
     * Get online users
     */
    getOnlineUsers: async () => {
        const response = await apiClient.get('/chat/users/online');
        return response.data;
    },
};

export default chatAPI;
