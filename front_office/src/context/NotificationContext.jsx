import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import toast from "react-hot-toast";
import { MessageSquare, Calendar } from "lucide-react";
import { getUserId } from "../utils/jwt";
import * as reservationApi from "../api/notification";
import * as eventApi from "../api/notificationEvent";

const NotificationContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const stompClientRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // ─── Fetch helpers ───

    const fetchUnreadCount = useCallback(async () => {
        try {
            const [resData, evtData] = await Promise.all([
                reservationApi.getUnreadCount(),
                eventApi.getUnreadCount(),
            ]);
            setUnreadCount((resData.count || 0) + (evtData.count || 0));
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const [resData, evtData] = await Promise.all([
                reservationApi.getNotifications(),
                eventApi.getNotifications(),
            ]);
            // Tag each notification with its source for routing delete/read calls
            const tagged = [
                ...resData.map((n) => ({ ...n, source: "reservation" })),
                ...evtData.map((n) => ({ ...n, source: "event" })),
            ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(tagged);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }, []);

    // ─── Mark as read ───

    const markAsRead = useCallback(async (id, source) => {
        try {
            if (source === "event") {
                await eventApi.markAsRead(id);
            } else {
                await reservationApi.markAsRead(id);
            }
            setNotifications((prev) =>
                prev.map((n) => (n.id === id && n.source === source ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await Promise.all([
                reservationApi.markAllAsRead(),
                eventApi.markAllAsRead(),
            ]);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    }, []);

    // ─── Delete ───

    const deleteNotification = useCallback(async (id, source) => {
        try {
            if (source === "event") {
                await eventApi.deleteNotification(id);
            } else {
                await reservationApi.deleteNotification(id);
            }
            setNotifications((prev) => {
                const target = prev.find((n) => n.id === id && n.source === source);
                if (target && !target.read) {
                    setUnreadCount((c) => Math.max(0, c - 1));
                }
                return prev.filter((n) => !(n.id === id && n.source === source));
            });
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    }, []);

    const deleteAllNotifications = useCallback(async () => {
        try {
            await Promise.all([
                reservationApi.deleteAllNotifications(),
                eventApi.deleteAllNotifications(),
            ]);
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to delete all notifications", err);
        }
    }, []);

    // ─── WebSocket ───

    useEffect(() => {
        const userId = getUserId();
        const token = localStorage.getItem("accessToken");

        if (!userId || !token) return;

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
                console.log("🔔 WebSocket connected for notifications");

                client.subscribe("/user/queue/notifications", (message) => {
                    const notification = JSON.parse(message.body);
                    console.log("📩 New notification:", notification);

                    // Determine source from the type field
                    const source = notification.type?.startsWith("PARTICIPANT_") ? "event" : "reservation";

                    setNotifications((prev) => [{ ...notification, source }, ...prev]);
                    setUnreadCount((prev) => prev + 1);

                    // Determine icon based on source
                    const toastIcon = source === "event"
                        ? <Calendar size={20} className="text-[#FF89EB]" />
                        : <MessageSquare size={20} className="text-[#1CF3CA]" />;

                    const formatTime = (dateStr) => {
                        if (!dateStr) return "";
                        const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
                        return new Date(utcStr).toLocaleString("en-US", {
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit", hour12: true,
                        });
                    };

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
                                        ? notification.message.replace("{{time}}", formatTime(notification.scheduledAt))
                                        : notification.message}
                                </span>
                            </div>
                        ),
                        {
                            duration: 6000,
                            style: {
                                border: source === "event" ? "1px solid #FF89EB" : "1px solid #1CF3CA",
                                padding: "16px",
                                color: source === "event" ? "#FF89EB" : "#1CF3CA",
                                background: "#24003E",
                                boxShadow: source === "event"
                                    ? "0 0 20px rgba(255, 137, 235, 0.3)"
                                    : "0 0 20px rgba(28, 243, 202, 0.3)",
                                maxWidth: 400,
                            },
                            icon: toastIcon,
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
                deleteNotification,
                deleteAllNotifications,
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
