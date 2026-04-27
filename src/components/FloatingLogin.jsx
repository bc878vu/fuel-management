import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FloatingLogin() {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 60000);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <div
      onMouseEnter={() => setVisible(true)}
      className="fixed top-4 right-4 z-50"
    >
      {visible && (
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Login
        </button>
      )}
    </div>
  );
}