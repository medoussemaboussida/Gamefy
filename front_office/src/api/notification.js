import { apiClient } from "./apiClient";

/**
 * Get all notifications for the current user.
 * @returns {Promise<Object[]>}
 */
export const getNotifications = () => {
    return apiClient.get("/gamefy/notifications");
};

/**
 * Get unread notification count for the current user.
 * @returns {Promise<{count: number}>}
 */
export const getUnreadCount = () => {
    return apiClient.get("/gamefy/notifications/unread-count");
};

/**
 * Mark a single notification as read.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const markAsRead = (id) => {
    return apiClient.put(`/gamefy/notifications/${id}/read`);
};

/**
 * Mark all notifications as read.
 * @returns {Promise<void>}
 */
export const markAllAsRead = () => {
    return apiClient.put("/gamefy/notifications/read-all");
};
