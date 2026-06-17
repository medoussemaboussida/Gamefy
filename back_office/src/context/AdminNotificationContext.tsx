import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import toast from "react-hot-toast";
import { getUserId } from "../utils/jwt";
import * as adminApi from "../api/notificationAdmin";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    referenceId: number | null;
    read: boolean;
    createdAt: string;
}

interface AdminNotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    deleteAllNotifications: () => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | null>(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const AdminNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [authReady, setAuthReady] = useState(!!localStorage.getItem("accessToken"));
    const stompClientRef = useRef<Client | null>(null);

    // Detect auth changes
    useEffect(() => {
        const interval = setInterval(() => {
            const hasToken = !!localStorage.getItem("accessToken");
            setAuthReady((prev) => {
                if (prev !== hasToken) return hasToken;
                return prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch helpers
    const fetchUnreadCount = useCallback(async () => {
        try {
            const data: any = await adminApi.getUnreadCount();
            setUnreadCount(data.count || 0);
        } catch (err) {
            console.error("Failed to fetch admin unread count", err);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const data: any = await adminApi.getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch admin notifications", err);
        }
    }, []);

    // Mark as read
    const markAsRead = useCallback(async (id: number) => {
        try {
            await adminApi.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            fetchUnreadCount();
        } catch (err) {
            console.error("Failed to mark admin notification as read", err);
        }
    }, [fetchUnreadCount]);

    const markAllAsRead = useCallback(async () => {
        try {
            await adminApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all admin notifications as read", err);
        }
    }, []);

    // Delete
    const deleteNotification = useCallback(async (id: number) => {
        try {
            await adminApi.deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            fetchUnreadCount();
        } catch (err) {
            console.error("Failed to delete admin notification", err);
        }
    }, [fetchUnreadCount]);

    const deleteAllNotifications = useCallback(async () => {
        try {
            await adminApi.deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to delete all admin notifications", err);
        }
    }, []);

    // WebSocket (depends on authReady)
    useEffect(() => {
        const userId = getUserId();
        const token = localStorage.getItem("accessToken");

        if (!userId || !token || !authReady) {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        fetchUnreadCount();

        const wsUrl = `${BASE_URL}/ws`;

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {

                // Subscribe to admin broadcast topic
                client.subscribe("/topic/admin-notifications", (message) => {
                    const notification = JSON.parse(message.body);

                    setNotifications((prev) => [notification, ...prev]);
                    setUnreadCount((prev) => prev + 1);

                    toast.success(notification.title + " — " + notification.message);
                });
            },
            onStompError: (frame) => {
                console.error("Admin STOMP error:", frame.headers["message"]);
            },
            onDisconnect: () => {
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [authReady, fetchUnreadCount]);

    return (
        <AdminNotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                fetchNotifications,
                fetchUnreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                deleteAllNotifications,
            }}
        >
            {children}
        </AdminNotificationContext.Provider>
    );
};

export const useAdminNotifications = () => {
    const ctx = useContext(AdminNotificationContext);
    if (!ctx) throw new Error("useAdminNotifications must be used inside <AdminNotificationProvider>");
    return ctx;
};
