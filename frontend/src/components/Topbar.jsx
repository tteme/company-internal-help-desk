import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

import { logout as logoutRequest } from "../services/auth.service";
import { logout } from "../store/slices/authSlice";

function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

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
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text lg:hidden"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>

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
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
        >
          Notifications
        </button>

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
