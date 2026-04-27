import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email === "admin@gmail.com" && password === "123456") {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "/admin";
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-6 rounded-xl w-80 shadow-lg">
        <h2 className="text-xl mb-4 font-bold">Admin Login</h2>

        <input
          className="w-full p-2 mb-3 rounded bg-slate-700"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 mb-3 rounded bg-slate-700"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}