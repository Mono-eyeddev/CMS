import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/protectedroute";
import Login from "./pages/login";
import Manager from "./pages/manage";
import CNO from "./pages/cnoui";
import SysAdmin from "./pages/sysadmin";

function App() {
  return (
    <Routes>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRole="MANAGER">
            <Manager />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cno"
        element={
          <ProtectedRoute allowedRole="CNO">
            <CNO />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sysadmin"
        element={
          <ProtectedRoute allowedRole="SYSADMIN">
            <SysAdmin />
          </ProtectedRoute>
        }
      />

      {/* Catch unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;