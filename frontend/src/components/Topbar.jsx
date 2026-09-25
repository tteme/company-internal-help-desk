import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";

import { logout as logoutRequest } from "../services/auth.service";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service";
import { logout } from "../store/slices/authSlice";

function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const notificationRef = useRef(null);

  useEffect(() => {
    async function loadUnreadNotificationCount() {
      try {
        const response = await getUnreadNotificationCount();

        setUnreadCount(response.data.count);
      } catch (error) {
        console.error("Failed to load unread notification count:", error);
      }
    }

    if (!user) {
      return;
    }

    loadUnreadNotificationCount();

    const intervalId = setInterval(() => {
      loadUnreadNotificationCount();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleNotificationToggle() {
    const shouldOpen = !isNotificationOpen;

    setIsNotificationOpen(shouldOpen);

    if (!shouldOpen) {
      return;
    }

    try {
      setIsLoadingNotifications(true);

      const response = await getNotifications();

      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }

  async function handleNotificationClick(notification) {
    try {
      if (notification.status !== "READ") {
        await markNotificationAsRead(notification.id);

        setNotifications((currentNotifications) =>
          currentNotifications.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  status: "READ",
                  readAt: new Date().toISOString(),
                }
              : item,
          ),
        );

        setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
      }

      if (notification.requestId) {
        setIsNotificationOpen(false);
        navigate(`/requests/${notification.requestId}`);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }
  async function handleMarkAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllNotificationsAsRead();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          status: "READ",
          readAt: notification.readAt || new Date().toISOString(),
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }
  async function handleLogout() {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
    }
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : "User";

  const roleLabel = user?.role
    ? user.role
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ")
    : "";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
      {/* Mobile menu */}
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text lg:hidden"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>

      {/* Search */}
      <search className="mx-6 flex-1">
        <form>
          <label htmlFor="global-search" className="sr-only">
            Search
          </label>

          <input
            id="global-search"
            name="search"
            type="search"
            placeholder="Search requests, users, or tickets..."
            className="w-full max-w-xl rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </form>
      </search>

      <nav aria-label="User actions" className="flex items-center gap-2">
        {/* User profile */}
        <Link
          to="/profile"
          aria-label="Open your profile"
          className="rounded-lg px-3 py-2 text-right transition-colors hover:bg-surface-muted"
        >
          <p className="text-sm font-medium text-text">{fullName}</p>
          <p className="text-xs text-text-secondary">{roleLabel}</p>
        </Link>

        {/* Notifications */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            aria-label="Open notifications"
            aria-expanded={isNotificationOpen}
            onClick={handleNotificationToggle}
            className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
          >
            <Bell aria-hidden="true" className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-text">
                    Notifications
                  </h2>

                  {unreadCount > 0 && (
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {unreadCount} unread notification
                      {unreadCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-medium text-accent transition-colors hover:text-accent/80"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-96 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="px-4 py-8 text-center text-sm text-text-secondary">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-text-secondary">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => {
                    const isUnread = notification.status !== "READ";

                    return (
                      <div
                        key={notification.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleNotificationClick(notification)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleNotificationClick(notification);
                          }
                        }}
                        className={`cursor-pointer border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-muted ${
                          isUnread ? "bg-background" : "bg-white"
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Unread indicator */}
                          {isUnread && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                          )}

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm ${
                                isUnread
                                  ? "font-semibold text-text"
                                  : "font-medium text-text-secondary"
                              }`}
                            >
                              {notification.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-text-secondary">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[11px] text-text-secondary">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {notifications.length > 10 && (
                <div className="border-t border-border px-4 py-2 text-center">
                  <p className="text-xs text-text-secondary">
                    Showing the 10 most recent notifications
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-light"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Topbar;
