import { Navigate, Outlet } from "react-router-dom";
import { getRole, isAuthed } from "./auth";

export default function ProtectedRoute({ allowRoles }) {
  if (!isAuthed()) {
    return <Navigate to="/login" replace />;
  }

  const role = getRole();

  if (allowRoles && !allowRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}