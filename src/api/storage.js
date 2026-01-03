import apiClient from './axios';

/**
 * Storage API endpoints
 */
export const storageAPI = {
    /**
     * Get current storage usage and limits
     */
    getStorageInfo: async () => {
        const response = await apiClient.get('/storage');
        return response.data;
    },

    /**
     * Check if a file of given size can be uploaded
     */
    canUpload: async (size) => {
        const response = await apiClient.get(`/storage/check?size=${size}`);
        return response.data;
    }
};

export default storageAPI;
