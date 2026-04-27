import Dashboard from "./components/Dashboard";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
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
      <Dashboard />
    </>
  );
}

export default App;