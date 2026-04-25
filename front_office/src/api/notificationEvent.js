import { apiClient } from "./apiClient";

/**
 * Get all event notifications for the current user.
 * @returns {Promise<Object[]>}
 */
export const getNotifications = () => {
    return apiClient.get("/gamefy/notification-events");
};

/**
 * Get unread event notification count for the current user.
 * @returns {Promise<{count: number}>}
 */
export const getUnreadCount = () => {
    return apiClient.get("/gamefy/notification-events/unread-count");
};

/**
 * Mark a single event notification as read.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const markAsRead = (id) => {
    return apiClient.put(`/gamefy/notification-events/${id}/read`);
};

/**
 * Mark all event notifications as read.
 * @returns {Promise<void>}
 */
export const markAllAsRead = () => {
    return apiClient.put("/gamefy/notification-events/read-all");
};

/**
 * Delete a single event notification.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteNotification = (id) => {
    return apiClient.delete(`/gamefy/notification-events/${id}`);
};

/**
 * Delete all event notifications for the current user.
 * @returns {Promise<void>}
 */
export const deleteAllNotifications = () => {
    return apiClient.delete("/gamefy/notification-events");
};
