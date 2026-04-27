import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import toast from "react-hot-toast";
import { MessageSquare, Calendar, Package } from "lucide-react";
import { getUserId } from "../utils/jwt";
import * as reservationApi from "../api/notification";
import * as eventApi from "../api/notificationEvent";
import * as packApi from "../api/notificationPack";

const NotificationContext = createContext(null);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [authReady, setAuthReady] = useState(!!localStorage.getItem("accessToken"));
    const stompClientRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // ─── Detect auth changes (login / logout) ───

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === "accessToken") {
                setAuthReady(!!e.newValue);
            }
        };
        window.addEventListener("storage", handleStorage);

        // Also poll briefly after mount to catch same-tab changes (storage event doesn't fire in the same tab)
        const interval = setInterval(() => {
            const hasToken = !!localStorage.getItem("accessToken");
            setAuthReady((prev) => {
                if (prev !== hasToken) return hasToken;
                return prev;
            });
        }, 1000);

        return () => {
            window.removeEventListener("storage", handleStorage);
            clearInterval(interval);
        };
    }, []);

    // ─── Fetch helpers ───

    const fetchUnreadCount = useCallback(async () => {
        try {
            const [resData, evtData, packData] = await Promise.all([
                reservationApi.getUnreadCount(),
                eventApi.getUnreadCount(),
                packApi.getUnreadCount(),
            ]);
            setUnreadCount((resData.count || 0) + (evtData.count || 0) + (packData.count || 0));
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const [resData, evtData, packData] = await Promise.all([
                reservationApi.getNotifications(),
                eventApi.getNotifications(),
                packApi.getNotifications(),
            ]);
            // Tag each notification with its source for routing delete/read calls
            const tagged = [
                ...resData.map((n) => ({ ...n, source: "reservation" })),
                ...evtData.map((n) => ({ ...n, source: "event" })),
                ...packData.map((n) => ({ ...n, source: "pack" })),
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
            } else if (source === "pack") {
                await packApi.markAsRead(id);
            } else {
                await reservationApi.markAsRead(id);
            }
            setNotifications((prev) =>
                prev.map((n) => (n.id === id && n.source === source ? { ...n, read: true } : n))
            );
            // Re-fetch accurate count from server
            fetchUnreadCount();
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    }, [fetchUnreadCount]);

    const markAllAsRead = useCallback(async () => {
        try {
            await Promise.all([
                reservationApi.markAllAsRead(),
                eventApi.markAllAsRead(),
                packApi.markAllAsRead(),
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
            } else if (source === "pack") {
                await packApi.deleteNotification(id);
            } else {
                await reservationApi.deleteNotification(id);
            }
            setNotifications((prev) =>
                prev.filter((n) => !(n.id === id && n.source === source))
            );
            // Re-fetch accurate count from server instead of manual decrement
            fetchUnreadCount();
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    }, [fetchUnreadCount]);

    const deleteAllNotifications = useCallback(async () => {
        try {
            await Promise.all([
                reservationApi.deleteAllNotifications(),
                eventApi.deleteAllNotifications(),
                packApi.deleteAllNotifications(),
            ]);
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to delete all notifications", err);
        }
    }, []);

    // ─── WebSocket (depends on authReady) ───

    useEffect(() => {
        const userId = getUserId();
        const token = localStorage.getItem("accessToken");

        if (!userId || !token || !authReady) {
            // Not logged in — clean up any existing connection
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
                console.log("🔔 WebSocket connected for notifications");

                client.subscribe("/user/queue/notifications", (message) => {
                    const notification = JSON.parse(message.body);
                    console.log("📩 New notification:", notification);

                    // Determine source from the type field
                    let source = "reservation";
                    if (notification.type?.startsWith("PARTICIPANT_")) {
                        source = "event";
                    } else if (notification.type?.startsWith("PACK_")) {
                        source = "pack";
                    }

                    setNotifications((prev) => [{ ...notification, source }, ...prev]);
                    setUnreadCount((prev) => prev + 1);

                    // Determine icon and color based on source
                    let toastIcon;
                    let borderColor, textColor, shadowColor;

                    if (source === "event") {
                        toastIcon = <Calendar size={20} className="text-[#FF89EB]" />;
                        borderColor = "#FF89EB";
                        shadowColor = "rgba(255, 137, 235, 0.3)";
                    } else if (source === "pack") {
                        toastIcon = <Package size={20} className="text-[#FFB800]" />;
                        borderColor = "#FFB800";
                        shadowColor = "rgba(255, 184, 0, 0.3)";
                    } else {
                        toastIcon = <MessageSquare size={20} className="text-[#1CF3CA]" />;
                        borderColor = "#1CF3CA";
                        shadowColor = "rgba(28, 243, 202, 0.3)";
                    }
                    textColor = borderColor;

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
                                border: `1px solid ${borderColor}`,
                                padding: "16px",
                                color: textColor,
                                background: "#24003E",
                                boxShadow: `0 0 20px ${shadowColor}`,
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
    }, [authReady, fetchUnreadCount]);

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
