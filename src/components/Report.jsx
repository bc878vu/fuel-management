import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useReactToPrint } from "react-to-print";
import PrintReport from "./PrintReport";
import html2pdf from "html2pdf.js"; // 🔥 ADD

export default function Report() {

  const [data, setData] = useState([]);
  const [engineFilter, setEngineFilter] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [userName, setUserName] = useState("");
  const [printReady, setPrintReady] = useState(false);

  const printRef = useRef(null);

 useEffect(() => {
  const unsub = onSnapshot(collection(db, "entries"), (snap) => {
    const arr = snap.docs.map(d => d.data());
    setData(arr);
  });

  return () => unsub();
}, []);

  // 🔥 TIME FORMAT (AM/PM)
  const formatTime = (time) => {
    if (!time) return "-";

    const [h, m] = time.split(":");
    let hour = Number(h);

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${m} ${ampm}`;
  };

  // 🔍 FILTER
  const filtered = data.filter(d => {

    if (fromDate && new Date(d.date) < new Date(fromDate)) return false;
    if (toDate && new Date(d.date) > new Date(toDate)) return false;

    if (engineFilter) {
      return (
        d.engines?.some(e => e.name === engineFilter) ||
        d.engine === engineFilter
      );
    }

    return true;
  });

  // 🧮 TOTALS
  const totalFuel = filtered.reduce((s, d) =>
    s + (d.engines?.reduce((a, e) => a + Number(e.fuel || 0), 0) || 0)
  , 0);

  const totalConsumption = filtered.reduce((s, d) =>
    s + Number(d.totalConsumption || 0)
  , 0);

  // 🖨 PRINT
const handlePrint = useReactToPrint({
  content: () => printRef.current,
  documentTitle: "Diesel Report",
  removeAfterPrint: true
});

const handlePrintClick = async () => {
  setPrintReady(true); // 🔥 force render

  setTimeout(() => {
    handlePrint(); // 🔥 print after render
    setPrintReady(false); // reset
  }, 500);
};
// 🔥 PDF DOWNLOAD FUNCTION
const handlePDF = () => {
  setPrintReady(true); // ensure render

  setTimeout(() => {
    const element = printRef.current;

    if (!element) {
      alert("Nothing to export");
      return;
    }

    const opt = {
      margin: 0.5,
      filename: "diesel-report.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "landscape" }
    };

    html2pdf().set(opt).from(element).save();

    setPrintReady(false);
  }, 500);
};

  // ✅ FIXED EXPORT CSV (DOWNLOAD WORKING)
  const exportCSV = () => {

    if (!filtered.length) {
      alert("No data to export");
      return;
    }

    const rows = filtered.map(d => ({
      date: d.date,
      engine: d.engine || (d.engines?.map(e => e.name).join("|") || ""),
      fuel: d.engineFuel || (d.engines?.reduce((a,e)=>a+Number(e.fuel||0),0) || 0),
      total: d.totalConsumption,
      stock: d.stock
    }));

    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map(r => Object.values(r).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    // ✅ FIX START
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `fuel-report-${Date.now()}.csv`);
    document.body.appendChild(link); // REQUIRED

    link.click();

    document.body.removeChild(link); // CLEANUP
    URL.revokeObjectURL(url); // MEMORY FIX
    // ✅ FIX END
  };

  return (
  <div className="bg-white/90 backdrop-blur-md text-gray-900 p-4 md:p-6 rounded-2xl shadow-lg">

      <h2 className="text-lg md:text-xl font-bold mb-4">Fuel Reports</h2>

      {/* NAME */}
      <div className="mb-4">
        <input
          placeholder="Enter Your Name"
         className="border p-2 w-full md:w-1/3 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          onChange={e => setUserName(e.target.value)}
        />
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-4">

        <select
         className="border p-2 w-full rounded"
          onChange={e => setEngineFilter(e.target.value)}
        >
          <option value="">All Engines</option>
          <option value="1400kva">1400kva</option>
          <option value="1020kva">1020kva</option>
          <option value="650kva">650kva</option>
        </select>

        <input
          type="date"
          className="border p-2 w-full rounded"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
        />

        <input
          type="date"
         className="border p-2 w-full rounded"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
        />

        <button
         onClick={handlePrintClick}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Download / Print Report
        </button>

        {/* ✅ CSV BUTTON */}
        <button
          onClick={exportCSV}
         className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Export CSV
        </button>
<button
  onClick={handlePDF}
  className="bg-purple-600 text-white px-4 py-2 rounded w-full"
>
  Download PDF
</button>
      </div>

      {/* TABLE */}
     <div className="overflow-x-auto">
  <table className="w-full min-w-[900px] border text-sm text-gray-900">
       <thead className="bg-gray-200 text-gray-900 text-xs md:text-sm">
          <tr>
            <th>Date</th>
            <th>Engine</th>
            <th>Start</th>
            <th>Stop</th>
            <th>Duration</th>
            <th>kWh</th>
            <th>Fuel</th>
            <th>Incoming</th>
            <th>Total</th>
            <th>Stock</th>
            <th>Other Usage</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((d, i) => {

            const engines = d.engines || [{
              name: d.engine,
              fuel: d.engineFuel,
              duration: d.runHours
            }];

            const otherText = d.other?.map(o =>
              `${o.name}: ${o.amount}L`
            ).join(", ");

            return engines.map((e, j) => (
             <tr key={i + "-" + j} className="text-center border text-xs md:text-sm">

                <td>{d.date}</td>
                <td>{e.name}</td>
                <td>{formatTime(d.startTime)}</td>
                <td>{formatTime(d.stopTime)}</td>
                <td>{e.duration || "-"}</td>
                <td>{d.kwh || "-"}</td>
                <td>{e.fuel || "-"}</td>
                <td>{d.incoming || 0}</td>
                <td>{d.totalConsumption}</td>
                <td>{d.stock}</td>
                <td>{otherText || "-"}</td>

              </tr>
            ));
          })}
        </tbody>
     </table>
</div>

      {/* TOTALS */}
     <div className="bg-gray-100 p-4 rounded-xl shadow-inner mt-4">
        <p><b>Total Engine Fuel:</b> {totalFuel.toFixed(2)}</p>
        <p><b>Total Consumption:</b> {totalConsumption.toFixed(2)}</p>
      </div>

     {/* PRINT VIEW */}
{printReady && (
  <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
    <div ref={printRef}>
      <PrintReport data={filtered} userName={userName} />
    </div>
  </div>
)}
{/* 🔥 PAGE NUMBER */}
<div style={{
  position: "fixed",
  bottom: 10,
  right: 20,
  fontSize: 10
}}>
  Page <span className="pageNumber"></span>
</div>

<style>
{`
@media print {
  .pageNumber:after {
    content: counter(page);
  }
}
`}
</style>
    </div>
  );
}