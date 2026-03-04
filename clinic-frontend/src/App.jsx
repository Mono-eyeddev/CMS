import { Routes, Route, Navigate } from "react-router-dom";
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
      <Route path="/manager" element={<Manager />} />
      <Route path="/cno" element={<CNO />} />
      <Route path="/sysadmin" element={<SysAdmin />} />

      {/* Catch unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default App;