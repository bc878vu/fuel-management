import { useState } from "react";
import EntryForm from "./EntryForm";
import Report from "./Report";
import DashboardHome from "./DashboardHome";

export default function Dashboard() {

  const [view, setView] = useState("home");
  const [open, setOpen] = useState(false); // 🔥 mobile menu

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">

      {/* 🔥 MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">⚡ Fuel</h1>

        <button
          onClick={() => setOpen(!open)}
          className="bg-slate-700 px-3 py-2 rounded"
        >
          ☰
        </button>
      </div>

      {/* 🔥 SIDEBAR */}
      <div className={`fixed md:static top-0 left-0 h-half w-48 bg-slate-900 md:bg-transparent p-5 border-r border-slate-700 transform transition-transform duration-300 z-50
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>

        <h1 className="text-2xl font-bold mb-8 text-blue-400 tracking-wide hidden md:block">
          ⚡ Fuel System
        </h1>

        {/* CLOSE BUTTON (MOBILE) */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden mb-4 text-right w-full text-gray-400"
        >
          ✖
        </button>

        <div className="space-y-2">

          <NavBtn label="Dashboard" active={view === "home"} onClick={() => { setView("home"); setOpen(false); }} />
          <NavBtn label="New Entry" active={view === "entry"} onClick={() => { setView("entry"); setOpen(false); }} />
          <NavBtn label="Reports" active={view === "report"} onClick={() => { setView("report"); setOpen(false); }} />

        </div>
<div className="mt-6">
  <button
    onClick={() => {
      localStorage.removeItem("isAdmin");
      window.location.href = "/";
    }}
    className="w-full p-3 bg-red-600 rounded-lg hover:bg-red-700"
  >
    Logout
  </button>
</div>
      </div>

      {/* 🔥 OVERLAY (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* 🔥 CONTENT */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">

        {view === "home" && <DashboardHome />}
        {view === "entry" && <EntryForm />}
        {view === "report" && <Report />}

      </div>

    </div>
  );
}


// 🔥 NAV BUTTON COMPONENT
const NavBtn = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all ${
        active
          ? "bg-blue-600 shadow-lg"
          : "hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );
};