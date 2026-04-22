import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import toast from "react-hot-toast";
import { MessageSquare } from "lucide-react";
import { getUserId } from "../utils/jwt";
import * as notificationApi from "../api/notification";

const NotificationContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const stompClientRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // Fetch initial unread count via REST
    const fetchUnreadCount = useCallback(async () => {
        try {
            const data = await notificationApi.getUnreadCount();
            setUnreadCount(data.count);
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    }, []);

    // Fetch all notifications via REST
    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationApi.getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }, []);

    // Mark single as read
    const markAsRead = useCallback(async (id) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    }, []);

    // Connect WebSocket
    useEffect(() => {
        const userId = getUserId();
        const token = localStorage.getItem("accessToken");

        if (!userId || !token) return;

        // Fetch initial data
        fetchUnreadCount();

        // Build the STOMP WebSocket URL
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
                console.log("🔔 WebSocket connected for notifications");

                // Subscribe to personal notification queue
                client.subscribe("/user/queue/notifications", (message) => {
                    const notification = JSON.parse(message.body);
                    console.log("📩 New notification:", notification);

                    // Add to local state
                    setNotifications((prev) => [notification, ...prev]);
                    setUnreadCount((prev) => prev + 1);

                    // Show a toast
                    toast(
                        (t) => (
                            <div
                                style={{ cursor: "pointer" }}
                                onClick={() => toast.dismiss(t.id)}
                            >
                                <strong style={{ display: "block", marginBottom: 4 }}>
                                    {notification.title}
                                </strong>
                                <span style={{ fontSize: 13, opacity: 0.85 }}>
                                    {notification.message?.includes("{{time}}") && notification.scheduledAt
                                        ? notification.message.replace("{{time}}", new Date(notification.scheduledAt.endsWith("Z") ? notification.scheduledAt : notification.scheduledAt + "Z").toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                          }))
                                        : notification.message}
                                </span>
                            </div>
                        ),
                        {
                            duration: 6000,
                            style: {
                                border: "1px solid #1CF3CA",
                                padding: "16px",
                                color: "#1CF3CA",
                                background: "#24003E",
                                boxShadow: "0 0 20px rgba(28, 243, 202, 0.3)",
                                maxWidth: 400,
                            },
                            icon: <MessageSquare size={20} className="text-[#1CF3CA]" />,
                        }
                    );
                });
            },
            onStompError: (frame) => {
                console.error("STOMP error:", frame.headers["message"]);
            },
            onDisconnect: () => {
                console.log("WebSocket disconnected");
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [fetchUnreadCount]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                fetchNotifications,
                fetchUnreadCount,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

/** Hook to consume the notification context */
export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
    return ctx;
};
