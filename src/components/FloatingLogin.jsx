import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FloatingLogin() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* 🔥 Invisible Hover Area (Top Right Corner) */}
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="fixed top-0 right-0 w-32 h-24 z-40"
      />

      {/* 🔥 Login Button */}
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Login
        </button>
      </div>
    </>
  );
}