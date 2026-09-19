import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useSelector(
    (state) => state.auth,
  );

  const location = useLocation();

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-secondary">
          Checking authentication...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
