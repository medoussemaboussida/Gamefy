import { apiClient } from "./apiClient";

/**
 * Get all notifications for the current user.
 * @returns {Promise<Object[]>}
 */
export const getNotifications = () => {
    return apiClient.get("/gamefy/notification-reservations");
};

/**
 * Get unread notification count for the current user.
 * @returns {Promise<{count: number}>}
 */
export const getUnreadCount = () => {
    return apiClient.get("/gamefy/notification-reservations/unread-count");
};

/**
 * Mark a single notification as read.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const markAsRead = (id) => {
    return apiClient.put(`/gamefy/notification-reservations/${id}/read`);
};

/**
 * Mark all notifications as read.
 * @returns {Promise<void>}
 */
export const markAllAsRead = () => {
    return apiClient.put("/gamefy/notification-reservations/read-all");
};

/**
 * Delete a single notification.
 * @param {number} id
 * @returns {Promise<void>}
 */
export const deleteNotification = (id) => {
    return apiClient.delete(`/gamefy/notification-reservations/${id}`);
};

/**
 * Delete all notifications for the current user.
 * @returns {Promise<void>}
 */
export const deleteAllNotifications = () => {
    return apiClient.delete("/gamefy/notification-reservations");
};
