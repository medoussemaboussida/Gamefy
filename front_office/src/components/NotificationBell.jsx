import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, MessageSquare } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    // Fetch full list when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = () => {
        return <MessageSquare size={18} className="text-[#2BDFC8]" />;
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        // Backend stores in UTC — ensure JS parses it as UTC
        const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
        const date = new Date(utcStr);
        
        // Display in local date and time
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-[#1CF3CA] hover:bg-white/5 rounded-full transition-all"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1 bg-[#FF89EB] text-black text-[10px] font-bold rounded-full shadow-lg shadow-[#FF89EB]/30 animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-[380px] max-h-[480px] bg-[#1A0030] border border-[#1CF3CA]/20 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden flex flex-col"
                    style={{ backdropFilter: "blur(20px)" }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold text-[15px] font-['Inter']">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className="bg-[#FF89EB]/20 text-[#FF89EB] text-[11px] font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="flex items-center gap-1.5 text-[#1CF3CA]/70 hover:text-[#1CF3CA] text-[12px] font-medium transition-colors"
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <Bell size={40} className="text-white/10 mb-3" />
                                <p className="text-white/30 text-sm font-['Inter']">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => {
                                        if (!n.read) markAsRead(n.id);
                                    }}
                                    className={`w-full text-left px-5 py-4 flex gap-3 transition-all duration-200 border-b border-white/[0.03] hover:bg-white/[0.04] ${
                                        !n.read
                                            ? "bg-[#1CF3CA]/[0.04]"
                                            : ""
                                    }`}
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">
                                        {getIcon()}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-[13px] font-semibold font-['Inter'] leading-tight ${
                                                !n.read ? "text-[#1CF3CA]" : "text-white/70"
                                            }`}>
                                                {n.title}
                                            </p>
                                            {!n.read && (
                                                <span className="flex-shrink-0 w-2 h-2 mt-1 bg-[#FF89EB] rounded-full" />
                                            )}
                                        </div>
                                        <p className="text-white/40 text-[12px] font-['Inter'] mt-1 leading-relaxed line-clamp-2">
                                            {n.message?.includes("{{time}}") && n.scheduledAt
                                                ? n.message.replace("{{time}}", formatTime(n.scheduledAt))
                                                : n.message}
                                        </p>
                                        <p className="text-white/20 text-[11px] font-['Inter'] mt-1.5">
                                            {formatTime(n.createdAt)}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-5 py-3 border-t border-white/5 text-center">
                            <span className="text-white/20 text-[11px] font-['Inter']">
                                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Scrollbar styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(28, 243, 202, 0.15); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(28, 243, 202, 0.3); }
            `}</style>
        </div>
    );
};

export default NotificationBell;
