import { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export default function DashboardHome() {

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [range, setRange] = useState([0, 20]);

useEffect(() => {
  const q = query(
    collection(db, "entries"),
    orderBy("createdAt", "asc")
  );

  const unsub = onSnapshot(q, (snap) => {
    const arr = snap.docs.map(d => d.data());
   setData([...arr]); // force re-render
  });

  return () => unsub();
}, []);

  // 🔥 FILTER
  const todayData = useMemo(() => {
  const now = new Date();

  return data.filter(d => {
    if (!d.createdAt?.seconds) return false;

    const dt = new Date(d.createdAt.seconds * 1000);
    return dt.toDateString() === now.toDateString();
  });
}, [data]);
const filteredData = useMemo(() => {
  const now = new Date();

  return data.filter(d => {
    if (!d.createdAt) return true;

    const date = d.createdAt?.seconds
      ? new Date(d.createdAt.seconds * 1000)
      : new Date();

    if (filter === "today") return date.toDateString() === now.toDateString();

    if (filter === "yesterday") {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      return date.toDateString() === y.toDateString();
    }

    if (filter === "weekly") {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      return date >= lastWeek;
    }

    if (filter === "monthly") return date.getMonth() === now.getMonth();
    if (filter === "yearly") return date.getFullYear() === now.getFullYear();

    return true;
  });
}, [data, filter]);

  // 🔥 STATS
  const source =
  filter === "all"
    ? data            // 🔥 ALL = full history
    : filter === "today"
    ? todayData       // 🔥 only today
    : filteredData;   // 🔥 बाकी filters

const stats = useMemo(() => {

  const totalFuel = source.reduce((s, d) =>
    s + (d.engines?.reduce((a, e) => a + Number(e.fuel || 0), 0) || 0)
  , 0);

  const totalConsumption = source.reduce((s, d) =>
    s + Number(d.totalConsumption || 0)
  , 0);

  const incomingFuel = source.reduce((s, d) =>
    s + Number(d.incoming || 0)
  , 0);

  const avgFuel = source.length ? totalFuel / source.length : 0;

  const engineHours = {
    "1400kva": 0,
    "1020kva": 0,
    "650kva": 0
  };

  source.forEach(d => {
    d.engines?.forEach(e => {
      engineHours[e.name] += Number(e.duration || 0);
    });
  });

  const sorted = [...data].sort(
  (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
);

const currentStock = sorted.reduce((acc, d, i) => {
  const prev = i === 0
    ? Number(d.previousStock || 0)
    : acc;

  return prev
    + Number(d.incoming || 0)
    - Number(d.totalConsumption || 0);
}, 0);

  return {
    totalFuel,
    totalConsumption,
    avgFuel,
    incomingFuel,
    currentStock,
    engineHours
  };

}, [source]);

const chartData = [...data]   // 🔥 IMPORTANT CHANGE
  .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
  .map((d, i) => {
    const time = d.createdAt?.seconds
      ? new Date(d.createdAt.seconds * 1000)
      : new Date();

    return {
      index: i,
      date: time.toLocaleDateString("en-GB"),
      fuel: d.engines?.reduce((a, e) => a + Number(e.fuel || 0), 0) || 0,
      consumption: Number(d.totalConsumption || 0),
    };
  });
  const visibleData = useMemo(() => {
  return chartData.slice(range[0], range[1]);
}, [chartData, range]);
 const last7Days = useMemo(() => {
  const today = new Date();

  return chartData.filter(d => {
    const parts = d.date.split(" ")[0].split("/");
    const dt = new Date(parts.reverse().join("-")); // dd/mm/yyyy → yyyy-mm-dd

    const diff = (today - dt) / (1000 * 60 * 60 * 24);
    return diff <= 6;
  });
}, [chartData]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <h1 className="text-xl md:text-2xl font-bold text-white">
        📊 Dashboard Overview
      </h1>

      {/* FILTER */}
      <div className="flex flex-wrap gap-2">
        {["all","today","yesterday","weekly","monthly","yearly"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm capitalize transition ${
              filter === f
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* MAIN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">

        <Card title="Total Fuel" value={stats.totalFuel} color="blue" />
        <Card title="Consumption" value={stats.totalConsumption} color="green" />
        <Card title="Incoming Fuel" value={stats.incomingFuel} color="yellow" />
        <Card title="Avg Fuel" value={stats.avgFuel} color="purple" />
        <Card title="Stock" value={stats.currentStock} color="blue" />

      </div>

      {/* ENGINE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">

        <Card title="⚡ 1400 KVA" value={stats.engineHours["1400kva"]} color="blue" />
        <Card title="⚡ 1020 KVA" value={stats.engineHours["1020kva"]} color="green" />
        <Card title="⚡ 650 KVA" value={stats.engineHours["650kva"]} color="purple" />

      </div>

      {/* LINE CHART */}
      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-lg">

        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
          📈 Fuel Trend
        </h2>

        {source.length === 0 ? (
          <Empty />
        ) : (
         <ResponsiveContainer width="100%" height={260}>
          <LineChart
  data={last7Days}
  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
>
              <CartesianGrid stroke="#e5e7eb" />
             <XAxis
  dataKey="index"
  tickFormatter={(i) => {
  const d = chartData[i];
  return d ? d.date.split(" ")[0] : "";
}}
/>
              <YAxis
  domain={['auto', 'auto']}
  allowDataOverflow={false}
/>
             <Tooltip
  formatter={(value, name) => [
    value,
    name === "fuel" ? "Fuel (L)" : "Consumption (L)"
  ]}
/>
<Line
  type="natural"
  dataKey="fuel"
  stroke="#2563eb"
  strokeWidth={3}
  dot={false}
  activeDot={{ r: 6 }}
  isAnimationActive={true}
/>

<Line
  type="natural"
  dataKey="consumption"
  stroke="#f59e0b"
  strokeWidth={2}
  dot={false}
  isAnimationActive={true}
/>
            </LineChart>
          </ResponsiveContainer>
        )}

      </div>

      {/* BAR CHART */}
      <div className="bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-lg">

        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
          📊 Consumption
        </h2>

        {source.length === 0 ? (
          <Empty />
        ) : (
         <ResponsiveContainer width="100%" height={260}>
           <BarChart
 data={last7Days}
  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
>
              <CartesianGrid stroke="#e5e7eb" />
            <XAxis
  dataKey="index"
 tickFormatter={(i) => {
  const d = chartData[i];
  return d ? d.date.split(" ")[0] : "";
}}
/>
             <YAxis
  domain={['auto', 'auto']}
  allowDataOverflow={false}
/>
              <Tooltip
  formatter={(value, name) => [
    value,
    name === "fuel" ? "Fuel (L)" : "Consumption (L)"
  ]}
/>

           <Bar
  dataKey="consumption"
  fill="#10b981"
  radius={[6,6,0,0]}
  barSize={20}
/>
            </BarChart>
          </ResponsiveContainer>
          
        )}
        <div className="flex items-center gap-3 mt-4">
 <input
  type="range"
  min="0"
  max={Math.max(0, chartData.length - 7)}
  value={range[0]}
  step="1"
  onChange={(e) => {
    const start = Number(e.target.value);
    setRange([start, start + 7]);
  }}
  className="w-full accent-blue-600"
/>
</div>

      </div>

    </div>
  );
}

const Card = ({ title, value, color }) => {

  const styles = {
    blue: "from-blue-600 to-blue-400",
    green: "from-emerald-600 to-emerald-400",
    yellow: "from-amber-500 to-yellow-300",
    purple: "from-purple-600 to-pink-500"
  };

  const isLowStock = title === "Stock" && Number(value) < 3000;

  return (
    <div
      className={`p-4 md:p-6 rounded-2xl shadow-lg transition
      ${
        isLowStock
          ? "bg-red-600 animate-pulse text-white"
          : `bg-gradient-to-br ${styles[color]} text-white`
      }`}
    >
      <p className="text-xs md:text-sm opacity-80">{title}</p>

      <h2 className="text-xl md:text-3xl font-bold mt-2">
        {Number(value || 0).toFixed(2)}
      </h2>

      {isLowStock && (
        <p className="text-xs mt-2 font-semibold">
          ⚠ Low Fuel Stock
        </p>
      )}
    </div>
  );
};

// 🔥 EMPTY
const Empty = () => (
  <div className="text-center py-10 text-gray-400">
    <p className="text-lg">📭 No Data</p>
    <p className="text-sm">Add entries to see analytics</p>
  </div>
);