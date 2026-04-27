import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

import {
  calculateTotal,
  calculateStock,
  calculateEngineFuel
} from "../utils/calculations";

import toast from "react-hot-toast"; // ✅ NEW
const timeToHours = (time) => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h + (m || 0) / 60;
};

export default function EntryForm() {

  const [userName, setUserName] = useState("");
 const formatTime = (time) => {
  if (!time) return "-";

  const [h, m] = time.split(":");
  let hour = Number(h);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${m} ${ampm}`;
};

const parseTime = (value) => {
  if (!value) return 0;

  value = String(value);
  value = value.replace(".", ":");

  const parts = value.split(":");

  const hours = Number(parts[0] || 0);
  const minutes = Number(parts[1] || 0);

  return hours + minutes / 60;
};
  const [form, setForm] = useState({
    date: "",
    engine: "1400kva",
    startTime: "",
    runHours: "",
    stopTime: "",
    kwh: "",
    engineFuel: "",
    incoming: "",
    currentStock: "",
    previousStock: "",
    other: [{ name: "", amount: "" }]
  });

  const [total, setTotal] = useState(0);
 const [previousHours, setPreviousHours] = useState("");
 const [saving, setSaving] = useState(false);
  const LOCAL_KEY = "fuel_form_draft_v1";
const LAST_SAVED_KEY = "fuel_last_saved_v1";

// ✅ LOAD LOCAL STORAGE
useEffect(() => {
  const saved = localStorage.getItem(LOCAL_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.form) setForm(parsed.form);
      if (parsed?.userName) setUserName(parsed.userName);
    } catch {}
  }
}, []);

// ✅ AUTO SAVE
useEffect(() => {
  localStorage.setItem(
    LOCAL_KEY,
    JSON.stringify({ form, userName })
  );
}, [form, userName]);


// ✅ OFFLINE → ONLINE AUTO SYNC
useEffect(() => {
  const sync = async () => {
    const offline = localStorage.getItem("offline_entry");

    if (offline && navigator.onLine) {
      const data = JSON.parse(offline);

      const stock = calculateStock(
  Number(form.previousStock || 0),
  Number(form.incoming || 0),
  Number(total || 0)
);

const current = parseTime(form.runHours);
const prev = parseTime(previousHours);

const engines = [
  {
    name: form.engine,
    fuel: form.engineFuel,
    duration: current > prev ? current - prev : 0
  }
];

const otherTotal = form.other.reduce(
  (s, o) => s + Number(o.amount || 0),
  0
);

   await addDoc(collection(db, "entries"), {
  userName,

  ...form,

  // 🔥 FORCE correct values
  previousStock: Number(form.previousStock || 0),
  incoming: Number(form.incoming || 0),
  currentStock: Number(form.currentStock || 0),

  engines,
  totalConsumption: Number(total || 0),
  otherTotal: Number(otherTotal || 0),
  stock: Number(stock || 0),

  createdAt: new Date()
});

      localStorage.removeItem("offline_entry");
      toast.success("Offline data synced ✅");
    }
  };
sync();
  window.addEventListener("online", sync);

  return () => window.removeEventListener("online", sync);
}, []);

 useEffect(() => {

  const cached = localStorage.getItem("latest_stock");

  // 🔥 instant load
  if (cached) {
    const stock = Number(cached);

    setForm(prev => ({
      ...prev,
      previousStock: stock,
      currentStock: stock
    }));

    return;
  }

  // 🔥 fallback firebase
  const load = async () => {

    const snap = await getDocs(
      query(collection(db, "entries"), orderBy("createdAt", "desc"), limit(1))
    );

    if (!snap.empty) {
      const d = snap.docs[0].data();

      const stock = Number(d.stock || d.currentStock || 0);

      localStorage.setItem("latest_stock", stock);

      setForm(prev => ({
        ...prev,
        previousStock: stock,
        currentStock: stock
      }));
    }
  };

  load();

}, []);
  // 🔥 PREVIOUS RUNNING HOURS
 useEffect(() => {
  setPreviousHours(""); // ⚡ no API call → instant
}, [form.engine]);

  // ⏱ STOP TIME
useEffect(() => {
  if (!form.startTime || !form.runHours) return;

  const current = parseTime(form.runHours);
  const prev = parseTime(previousHours);

  const duration = current - prev;

  if (duration <= 0) {
    setForm(p => ({ ...p, stopTime: "" }));
    return;
  }

  // ✅ FIX: Proper Date-based calculation
  const start = new Date();
  const [h, m] = form.startTime.split(":");

  start.setHours(Number(h));
  start.setMinutes(Number(m));
  start.setSeconds(0);

  // add duration
  start.setMinutes(start.getMinutes() + duration * 60);

  const hh = String(start.getHours()).padStart(2, "0");
  const mm = String(start.getMinutes()).padStart(2, "0");

  const stop = `${hh}:${mm}`;

  setForm(p => ({ ...p, stopTime: stop }));

}, [form.startTime, form.runHours, previousHours]);

  // 🔥 ENGINE FUEL
  useEffect(() => {

  const current = parseTime(form.runHours);
  const prev = parseTime(previousHours);
  const duration = current > prev ? current - prev : 0;

  const fuel = calculateEngineFuel(
    form.engine,
    duration,
    Number(form.kwh || 0)
  );

  setForm(prev => ({ ...prev, engineFuel: fuel }));

}, [form.engine, form.runHours, form.kwh, previousHours]);

  // 🔥 TOTALS
  const otherTotal = form.other.reduce((s, o) => s + Number(o.amount || 0), 0);
const current = parseTime(form.runHours);
const prev = parseTime(previousHours);

const duration = current > prev ? current - prev : 0;

const hoursToTime = (h) => {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  return `${hr}:${String(min).padStart(2, "0")}`;
};

useEffect(() => {

  const stock = calculateStock(
    Number(form.previousStock || 0),
    Number(form.incoming || 0),
    Number(total || 0)
  );

  // 🔥 sirf tab update karo jab value different ho
  if (String(stock) !== String(form.currentStock)) {
    setForm(prev => ({
      ...prev,
      currentStock: stock
    }));
  }

}, [form.incoming, total, form.previousStock]);
  useEffect(() => {
    const t = calculateTotal(
      [{ fuel: form.engineFuel }],
      form.other
    );

    setTotal(t);

  }, [form.engineFuel, form.other]);

  // ➕ ADD OTHER
  const addOther = () => {
    setForm({
      ...form,
     other: [...form.other, { name: "", amount: "" }]
    });
  };

const save = async () => {

  if (saving) return;

  setSaving(true);

  try {

    if (!userName) {
  toast.error("User Name Required");
  setSaving(false);
  return;
}

   if (!form.date) {
  toast.error("Date Required");
  setSaving(false);
  return;
}

// ❌ BLOCK FUTURE DATE
const selected = new Date(form.date);
const today = new Date();

today.setHours(0,0,0,0);
selected.setHours(0,0,0,0);

if (selected > today) {
  toast.error("Future date not allowed ❌");
  setSaving(false);
  return;
}

    const currentData = JSON.stringify({ userName, form });
    const lastSaved = localStorage.getItem(LAST_SAVED_KEY);

    if (lastSaved === currentData) {
      toast.error("Entry already saved");
      setSaving(false); // ✅ FIX
      return;
    }

    const stock = calculateStock(
      Number(form.previousStock || 0),
      Number(form.incoming || 0),
      Number(total || 0)
    );

    const current = parseTime(form.runHours);
    const prev = parseTime(previousHours);

    const engines = [
      {
        name: form.engine,
        fuel: form.engineFuel,
        duration: current > prev ? current - prev : 0
      }
    ];

    const docPromise = addDoc(collection(db, "entries"), {
  userName,
  ...form,
  engines,
  totalConsumption: total,
  otherTotal,
  stock,
  createdAt: new Date()
});

// 🔥 parallel UI update (no wait)
toast.success("Data saved successfully ✅");

await docPromise;

    // 🔥 instant update
    localStorage.setItem("latest_stock", stock);

    localStorage.setItem(LAST_SAVED_KEY, currentData);
    localStorage.removeItem(LOCAL_KEY);

    setPreviousHours(form.runHours);

    toast.success("Data saved successfully ✅");

    // ✅ OPTIONAL RESET (FAST UX)
    setForm(prev => ({
      ...prev,
      incoming: "",
      other: [{ name: "", amount: "" }]
    }));

  } catch (err) {
    console.error(err);
    toast.error("Error saving data ❌");
  }

  setSaving(false); // ✅ ALWAYS RESET
};

  return (
    <div className="bg-white/90 backdrop-blur-md text-gray-900 p-4 md:p-6 rounded-2xl shadow-lg max-w-5xl mx-auto">

      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Daily Fuel Entry</h2>

      {/* USER NAME */}
      <div className="mb-4">
        <label className="text-sm font-semibold">User Name *</label>
      <input
  value={userName}
  className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
  placeholder="Enter your name"
  onChange={e => setUserName(e.target.value)}
/>
      </div>

      {/* DATE */}
      <div className="mb-4">
        <label className="text-sm font-semibold">Date</label>
       <input
  type="date"
  value={form.date}
 className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
  onChange={e => setForm({ ...form, date: e.target.value })}
/>
      </div>

      {/* REST CODE 100% SAME (NO CHANGE) */}
      {/* ⚠️ I DID NOT REMOVE OR CHANGE ANYTHING BELOW */}

      {/* ENGINE */}
      <h3 className="font-bold mb-3">Generator Details</h3>

     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

        <div>
          <label>Engine</label>
         <select
  value={form.engine}
 className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
  onChange={e => setForm({ ...form, engine: e.target.value })}
>
            <option>1400kva</option>
            <option>1020kva</option>
            <option>650kva</option>
          </select>
        </div>

        <div>
          <label>Previous Running Hours</label>
         <input
  value={previousHours || ""}
  placeholder="Previous hours"
  className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
  onChange={e => setPreviousHours(e.target.value)}
/>
        </div>

        <div>
          <label>Start Time</label>
         <input
  type="time"
  value={form.startTime} 
    // ✅ ADD THIS
  className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
  onChange={e => setForm({ ...form, startTime: e.target.value })}
/>
<div className="text-xs text-gray-500 mt-1">
  {formatTime(form.startTime)}
</div>
        </div>

        <div>
          <label>Running Hours</label>
     <input
  type="text"
  value={form.runHours || ""}
  placeholder="e.g 1:30 or 1.30"
  className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
  onChange={e => setForm({ ...form, runHours: e.target.value })}
/>
        </div>

       <div>
  <label>Stop Time</label>
  <div className="p-2 bg-gray-100">
    {formatTime(form.stopTime)}
  </div>
</div>
        <div>
  <label>Duration</label>
  <div className="p-2 bg-blue-100">
    {hoursToTime(duration > 0 ? duration : 0)}
  </div>
</div>

        <div>
          <label>kWh</label>
      <input
  type="number"
  value={form.kwh || ""}
  placeholder="Enter kWh"
 className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
  onChange={e => setForm({ ...form, kwh: e.target.value })}
/>
        </div>

        <div>
          <label>Engine Fuel</label>
          <div className="p-2 bg-green-100">{form.engineFuel} L</div>
        </div>

      </div>

      {/* OTHER */}
      <h3 className="font-bold mt-6">Other Usage</h3>

      {form.other.map((o, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
  value={o.name}
  placeholder="Boiler / CEO / etc"
  className="border p-2 flex-1"
  onChange={e => {
              const arr = [...form.other];
              arr[i].name = e.target.value;
              setForm({ ...form, other: arr });
            }}
          />
<input
  type="number"
  step="0.01"
  value={o.amount || ""}
  placeholder="Liters"
  className="border p-2 w-32"
  onChange={e => {
    const arr = [...form.other];
    arr[i].amount = e.target.value;
    setForm({ ...form, other: arr });
  }}
/>
        </div>
      ))}

      <button onClick={addOther} className="text-blue-600 mt-2">
        + Add Usage
      </button>

      {/* STOCK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">

        <div>
          <label>Previous Stock</label>
         <input
  value={form.previousStock || ""}
  placeholder="Previous stock"
  onChange={e => setForm({ ...form, previousStock: e.target.value })}
 className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
/>
        </div>

        <div>
          <label>Incoming</label>
     <input
  type="number"
  step="0.01"
  value={form.incoming || ""}
  placeholder="Liters"
  className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
  onChange={e => setForm({ ...form, incoming: e.target.value })}
/>
        </div>

        <div>
          <label>Current Stock</label>
   <input
  type="number"
  step="0.01"
  value={form.currentStock === "" ? "" : form.currentStock}
  placeholder="Liters"
  className="border p-2 w-full rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
  onChange={(e) => {
    const val = e.target.value;

    setForm(prev => ({
      ...prev,
      currentStock: val === "" ? "" : Number(val)
    }));
  }}
/>
        </div>

      </div>

      {/* SUMMARY */}
      <div className="mt-6 bg-gray-100 p-4 rounded-xl shadow-inner">
        <p><b>Engine Fuel:</b> {form.engineFuel}</p>
        <p><b>Other Total:</b> {otherTotal}</p>
        <p><b>Total Consumption:</b> {total}</p>
        <p><b>Duration:</b> {hoursToTime(duration)}</p>
      </div>

     <button
  onClick={save}
  disabled={saving}
  className={`mt-6 px-6 py-2 rounded-lg text-white transition ${
    saving
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {saving ? "Saving..." : "Save Entry"}
</button>
      

    </div>
  );
}