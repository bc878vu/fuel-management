import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "./components/Dashboard";
import DashboardHome from "./components/DashboardHome";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingLogin from "./components/FloatingLogin";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: "#111",
            color: "#fff",
            borderRadius: "10px",
            padding: "10px 14px"
          }
        }}
      />

      <FloatingLogin />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<DashboardHome />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;