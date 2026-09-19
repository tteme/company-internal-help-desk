import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";

import { navigation } from "../config/navigation";

function Sidebar({ isOpen, onClose }) {
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
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-primary text-white",
          "transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
        ].join(" ")}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
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

        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto px-3 py-5"
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

        <footer className="border-t border-white/10 px-6 py-4">
          <p className="text-xs text-white/50">Digaf Microfinance S.C.</p>
        </footer>
      </aside>
    </>
  );
}

export default Sidebar;
