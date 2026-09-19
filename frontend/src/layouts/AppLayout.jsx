import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  function toggleSidebar() {
    setIsSidebarOpen((currentState) => !currentState);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={toggleSidebar} />

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
