import { apiClient } from "./apiClient";

/**
 * Get all pack notifications for the current user.
 * @returns {Promise<Object[]>}
 */
export const getNotifications = () => {
    return apiClient.get("/gamefy/notification-packs");
};

/**
 * Get unread pack notification count for the current user.
 * @returns {Promise<{count: number}>}
 */
export const getUnreadCount = () => {
    return apiClient.get("/gamefy/notification-packs/unread-count");
};

/**
 * Mark a single pack notification as read.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const markAsRead = (id) => {
    return apiClient.put(`/gamefy/notification-packs/${id}/read`);
};

/**
 * Mark all pack notifications as read.
 * @returns {Promise<void>}
 */
export const markAllAsRead = () => {
    return apiClient.put("/gamefy/notification-packs/read-all");
};

/**
 * Delete a single pack notification.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteNotification = (id) => {
    return apiClient.delete(`/gamefy/notification-packs/${id}`);
};

/**
 * Delete all pack notifications for the current user.
 * @returns {Promise<void>}
 */
export const deleteAllNotifications = () => {
    return apiClient.delete("/gamefy/notification-packs");
};
