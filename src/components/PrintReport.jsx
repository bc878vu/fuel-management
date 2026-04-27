import React from "react";

const PrintReport = ({ data, userName }) => {
  const reportTime = new Date().toLocaleString();
  const engines = ["1400kva", "1020kva", "650kva"];

  const formatTime = (time) => {
    if (!time || time === "NILL") return "-";
    const [h, m] = time.split(":");
    let hour = Number(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const getDuration = (on, off) => {
    if (!on || !off || on === "NILL" || off === "NILL") return "-";
    const [h1, m1] = on.split(":").map(Number);
    const [h2, m2] = off.split(":").map(Number);

    let start = h1 * 60 + m1;
    let end = h2 * 60 + m2;
    if (end < start) end += 24 * 60;

    const diff = end - start;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  // --- STYLING CONSTANTS (EXACT BORDERS) ---
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
    border: "2px solid black",
  };

  const cellStyle = {
    border: "1px solid black",
    padding: "4px 2px",
    textAlign: "center",
  };

  const headerMain = {
    ...cellStyle,
    backgroundColor: "#E2E2E2",
    fontWeight: "bold",
    textTransform: "uppercase",
  };

  const headerSub = {
    ...cellStyle,
    backgroundColor: "#F2F2F2",
    fontWeight: "bold",
  };

  const fromDate = data?.[0]?.date || "-";
  const toDate = data?.[data.length - 1]?.date || "-";

  return (
    <div style={{ padding: "10mm", background: "white" }}>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; }
        }
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
      `}</style>

      {/* TOP META INFO */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "12px" }}>
        <div style={{ fontWeight: "bold" }}>⚡ Diesel Management System</div>
        <div><b>Generated:</b> {reportTime}</div>
      </div>

      {/* MAIN TITLES */}
      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <h1 style={{ margin: "0", fontSize: "18px", textDecoration: "underline" }}>
          Daily Diesel Consumption & Generator Running Report
        </h1>
        <h2 style={{ margin: "5px 0", fontSize: "16px" }}>Future Fashion (Pvt.) Ltd LHR</h2>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "11px" }}>
        <div><b>Prepared By:</b> {userName || "Admin"}</div>
        <div><b>Reporting Period:</b> {fromDate} — {toDate}</div>
        <div><b>Standard Shift Start:</b> 08:00 AM</div>
      </div>

      <table style={tableStyle}>
        <thead>
          {/* Row 1: Main Groups */}
          <tr>
            <th rowSpan="3" style={headerMain}>Date</th>
            <th colSpan="6" style={headerMain}>Generator Run Time</th>
            <th colSpan="3" style={headerMain}>KWh Reading</th>
            <th colSpan="3" style={headerMain}>Fuel Consumption (Ltr)</th>
            <th colSpan="3" style={headerMain}>Total Duration</th>
            <th colSpan="4" style={headerMain}>Fuel Stock Status</th>
          </tr>

          {/* Row 2: Sub Groups (Engines & Details) */}
          <tr>
            <th colSpan="2" style={headerSub}>1400 KVA</th>
            <th colSpan="2" style={headerSub}>1020 KVA</th>
            <th colSpan="2" style={headerSub}>650 KVA</th>
            
            <th style={headerSub}>1400</th>
            <th style={headerSub}>1020</th>
            <th style={headerSub}>650</th>

            <th style={headerSub}>1400</th>
            <th style={headerSub}>1020</th>
            <th style={headerSub}>650</th>

            <th style={headerSub}>1400</th>
            <th style={headerSub}>1020</th>
            <th style={headerSub}>650</th>

            <th rowSpan="2" style={headerSub}>Lifter/MC</th>
            <th rowSpan="2" style={headerSub}>Total Consumed</th>
            <th rowSpan="2" style={headerSub}>Current Stock</th>
            <th rowSpan="2" style={headerSub}>Incoming</th>
          </tr>

          {/* Row 3: ON/OFF labels */}
          <tr>
            <th style={headerSub}>ON</th><th style={headerSub}>OFF</th>
            <th style={headerSub}>ON</th><th style={headerSub}>OFF</th>
            <th style={headerSub}>ON</th><th style={headerSub}>OFF</th>
            <th colSpan="9" style={{...cellStyle, backgroundColor: "#f9f9f9", fontSize: '8px'}}>Performance Metrics</th>
          </tr>
        </thead>

        <tbody>
          {(data || []).map((d, i) => {
            let rowFuelSum = 0;
            const otherFuel = d.other?.reduce((s, o) => s + Number(o.amount || 0), 0) || 0;

            return (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#fcfcfc" }}>
                <td style={{ ...cellStyle, fontWeight: "bold" }}>{d.date}</td>

                {/* Times */}
                {engines.map((eng) => {
                  const e = d.engines?.find((x) => x.name === eng);
                  return (
                    <React.Fragment key={`${eng}-time`}>
                      <td style={cellStyle}>{formatTime(e?.on)}</td>
                      <td style={cellStyle}>{formatTime(e?.off)}</td>
                    </React.Fragment>
                  );
                })}

                {/* kWh */}
                {engines.map((eng) => {
                  const e = d.engines?.find((x) => x.name === eng);
                  return <td key={`${eng}-kwh`} style={cellStyle}>{e?.kwh || "0"}</td>;
                })}

                {/* Fuel */}
                {engines.map((eng) => {
                  const e = d.engines?.find((x) => x.name === eng);
                  const f = Number(e?.fuel || 0);
                  rowFuelSum += f;
                  return <td key={`${eng}-fuel`} style={cellStyle}>{f || "-"}</td>;
                })}

                {/* Duration */}
                {engines.map((eng) => {
                  const e = d.engines?.find((x) => x.name === eng);
                  return <td key={`${eng}-dur`} style={cellStyle}>{getDuration(e?.on, e?.off)}</td>;
                })}

                {/* Stock Columns */}
                <td style={cellStyle}>{otherFuel}</td>
                <td style={{ ...cellStyle, fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                   {d.totalConsumption || (rowFuelSum + otherFuel)}
                </td>
                <td style={cellStyle}>{d.stock}</td>
                <td style={cellStyle}>{d.incoming || 0}</td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr style={{ backgroundColor: "#D9D9D9", fontWeight: "bold" }}>
            <td colSpan="10" style={{ ...cellStyle, textAlign: "right" }}>GRAND TOTAL (LTR):</td>
            <td colSpan="3" style={cellStyle}>
              {data.reduce((s, d) => s + (Number(d.totalConsumption) || 0), 0)} Ltr
            </td>
            <td colSpan="3" style={cellStyle}>--</td>
            <td colSpan="4" style={cellStyle}>Report Verified</td>
          </tr>
        </tfoot>
      </table>

      {/* SIGNATURE SECTION */}
      <div style={{ marginTop: "50px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ textAlign: "center", width: "200px" }}>
          <div style={{ borderTop: "1px solid black", paddingTop: "5px" }}><b>Prepared By</b></div>
          <div style={{ fontSize: "10px" }}>Plant Operator</div>
        </div>
        <div style={{ textAlign: "center", width: "200px" }}>
          <div style={{ borderTop: "1px solid black", paddingTop: "5px" }}><b>Checked By</b></div>
          <div style={{ fontSize: "10px" }}>Mechanical Engineer</div>
        </div>
        <div style={{ textAlign: "center", width: "200px" }}>
          <div style={{ borderTop: "1px solid black", paddingTop: "5px" }}><b>Approved By</b></div>
          <div style={{ fontSize: "10px" }}>General Manager</div>
        </div>
      </div>
    </div>
  );
};

export default PrintReport;