import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function RoleProtectedRoute({ allowedRoles }) {
  const user = useSelector((state) => state.auth.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/requests" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;
