import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/login.jsx";
import Manager from "../pages/manager.jsx";
import CNO from "../pages/cnoui.jsx";
import SysAdmin from "../pages/sysadmin.jsx";

import ProtectedRoute from "../auth/ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      {/* Manager */}
      <Route element={<ProtectedRoute allowRoles={["MANAGER"]} />}>
        <Route path="/manager" element={<Manager />} />
      </Route>

      {/* CNO */}
      <Route element={<ProtectedRoute allowRoles={["CNO"]} />}>
        <Route path="/cno" element={<CNO />} />
      </Route>

      {/* SysAdmin */}
      <Route element={<ProtectedRoute allowRoles={["SYSADMIN"]} />}>
        <Route path="/sysadmin" element={<SysAdmin />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}