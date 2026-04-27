import { useState, useEffect, useRef } from "react";
import { useAdminNotifications } from "../../context/AdminNotificationContext";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useAdminNotifications();

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
    const date = new Date(utcStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTypeIcon = (type: string) => {
    if (type.includes("PURCHASED")) return "💰";
    if (type.includes("RENEWED")) return "🔄";
    return "📦";
  };

  const getTypeLabel = (type: string) => {
    if (type.includes("COACHING")) return "Coaching";
    return "Gaming";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0 z-40">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Notifications
              </h5>
              {unreadCount > 0 && (
                <span className="bg-orange-100 text-orange-600 text-[11px] font-bold px-2 py-0.5 rounded-full dark:bg-orange-500/20 dark:text-orange-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => deleteAllNotifications()}
                  className="text-xs text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notification List */}
          <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar flex-1">
            {notifications.length === 0 ? (
              <li className="flex flex-col items-center justify-center py-12 px-4">
                <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405C18.79 14.79 18 13.42 18 12V8a6 6 0 00-12 0v4c0 1.42-.79 2.79-1.595 3.595L3 17h5m4 0v1a3 3 0 01-6 0v-1m6 0H9" />
                </svg>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  No notifications yet
                </p>
              </li>
            ) : (
              notifications.map((n) => (
                <li key={n.id}>
                  <div
                    onClick={() => { if (!n.read) markAsRead(n.id); }}
                    className={`group relative flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4 py-3 cursor-pointer transition-all duration-200 dark:border-gray-800 ${
                      !n.read
                        ? "bg-orange-50/50 hover:bg-orange-50 dark:bg-orange-500/5 dark:hover:bg-orange-500/10"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Icon */}
                    <span className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg bg-orange-100 dark:bg-orange-500/10">
                      {getTypeIcon(n.type)}
                    </span>

                    {/* Content */}
                    <span className="block flex-1 min-w-0 pr-6">
                      <span className={`mb-1 block text-theme-sm ${
                        !n.read
                          ? "text-gray-800 dark:text-white font-semibold"
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {n.title}
                      </span>
                      <span className="block text-gray-500 dark:text-gray-400 text-theme-xs leading-relaxed line-clamp-2">
                        {n.message}
                      </span>
                      <span className="flex items-center gap-2 mt-1 text-gray-400 text-theme-xs dark:text-gray-500">
                        <span>{formatTime(n.createdAt)}</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                        <span className="text-orange-500 dark:text-orange-400 font-medium">
                          {getTypeLabel(n.type)}
                        </span>
                      </span>
                    </span>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="absolute right-2 top-2 p-1 rounded-md text-red-300 hover:text-red-500 hover:bg-red-50 dark:text-red-400/40 dark:hover:text-red-400 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Delete notification"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 text-center">
              <span className="text-gray-400 dark:text-gray-500 text-xs">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
