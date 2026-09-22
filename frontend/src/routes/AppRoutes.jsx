import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Requests from "../pages/requests/Requests";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import PublicRoute from "./PublicRoute";
import Profile from "../pages/profile/Profile";
import RequestDetails from "../pages/requests/RequestDetails";
import CreateRequest from "../pages/requests/CreateRequest";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<Requests />} />
            <Route element={<RoleProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
              <Route path="/requests/create" element={<CreateRequest />} />
            </Route>
            <Route path="/requests/:id" element={<RequestDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
