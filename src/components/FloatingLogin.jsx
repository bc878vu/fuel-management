import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FloatingLogin() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="fixed top-4 right-4 z-50"
    >
      {visible && (
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition"
        >
          Login
        </button>
      )}
    </div>
  );
}