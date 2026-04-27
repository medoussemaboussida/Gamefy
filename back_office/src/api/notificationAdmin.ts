import { apiClient } from "./apiClient";

/**
 * Get all admin notifications.
 */
export const getNotifications = () => {
    return apiClient.get("/gamefy/notification-admins");
};

/**
 * Get unread admin notification count.
 */
export const getUnreadCount = () => {
    return apiClient.get("/gamefy/notification-admins/unread-count");
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = (id: number) => {
    return apiClient.put(`/gamefy/notification-admins/${id}/read`);
};

/**
 * Mark all notifications as read.
 */
export const markAllAsRead = () => {
    return apiClient.put("/gamefy/notification-admins/read-all");
};

/**
 * Delete a single notification.
 */
export const deleteNotification = (id: number) => {
    return apiClient.delete(`/gamefy/notification-admins/${id}`);
};

/**
 * Delete all admin notifications.
 */
export const deleteAllNotifications = () => {
    return apiClient.delete("/gamefy/notification-admins");
};
