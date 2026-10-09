import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";

import { logout as logoutRequest } from "../services/auth.service";
import { logout } from "../store/slices/authSlice";
import { navigation } from "../config/navigation";

function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const userRole = useSelector((state) => state.auth.user?.role);
  const menuItems = navigation[userRole] || [];

  const sections = menuItems.reduce((groups, item) => {
    const section = item.section || "Main";

    if (!groups[section]) {
      groups[section] = [];
    }

    groups[section].push(item);

    return groups;
  }, {});

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      onClose();
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-60 flex-col overflow-hidden bg-primary text-white",
          "transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* Fixed sidebar header */}
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <img
              src="/digafLogo.svg"
              alt="Digaf Microfinance"
              className="h-9 w-auto"
            />

            <p className="mt-3 text-xs text-white/60">
              Internal Support System
            </p>
          </div>

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        {/* Only the navigation links scroll */}
        <nav
          aria-label="Main navigation"
          className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-primary px-3 py-5"
        >
          <ul className="space-y-6">
            {Object.entries(sections).map(([sectionName, sectionItems]) => (
              <li key={sectionName}>
                <h2 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  {sectionName}
                </h2>

                <ul className="mt-2 space-y-1">
                  {sectionItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          aria-label={item.label}
                          onClick={onClose}
                          className={({ isActive }) =>
                            [
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-accent text-white"
                                : "text-white/70 hover:bg-white/10 hover:text-white",
                            ].join(" ")
                          }
                        >
                          <Icon
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0"
                          />

                          <span>{item.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        {/* Fixed logout footer */}
        <footer className="shrink-0 border-t border-white/10 bg-primary px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </footer>
      </aside>
    </>
  );
}

export default Sidebar;
