import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getSystemStatus } from "../services/system-status.service";

function ProtectedRoute() {
  const { isAuthenticated, isInitializing, user } = useSelector(
    (state) => state.auth,
  );

  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const location = useLocation();

  useEffect(() => {
    async function checkMaintenanceMode() {
      if (!isAuthenticated) {
        setIsCheckingMaintenance(false);
        return;
      }

      try {
        const response = await getSystemStatus();

        setMaintenanceMode(response.data?.maintenanceMode === true);
      } catch (error) {
        console.error("Failed to check maintenance mode:", error);

        // If the status check fails, allow the application to continue.
        setMaintenanceMode(false);
      } finally {
        setIsCheckingMaintenance(false);
      }
    }

    checkMaintenanceMode();
  }, [isAuthenticated]);

  if (isInitializing || isCheckingMaintenance) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-secondary">Checking system status...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isSystemAdministrator = user?.role === "SYSTEM_ADMINISTRATOR";

  if (maintenanceMode && !isSystemAdministrator) {
    return <Navigate to="/maintenance" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
