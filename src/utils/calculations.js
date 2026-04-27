// 🔥 ENGINE TABLES (AVERAGE VALUES)

const engineTables = {

  "1400kva": [
    { load: 1, fuel: 22 },
    { load: 5, fuel: 34 },
    { load: 10, fuel: 52 },
    { load: 15, fuel: 68 },
    { load: 20, fuel: 84 },
    { load: 25, fuel: 98 },
    { load: 30, fuel: 114 },
    { load: 35, fuel: 130 },
    { load: 40, fuel: 146 },
    { load: 45, fuel: 162 },
    { load: 50, fuel: 178 },
    { load: 55, fuel: 194 },
    { load: 60, fuel: 210 },
    { load: 65, fuel: 226 },
    { load: 70, fuel: 242 },
    { load: 75, fuel: 258 },
    { load: 80, fuel: 275 },
    { load: 85, fuel: 292 },
    { load: 90, fuel: 310 },
    { load: 100, fuel: 345 }
  ],

  "1020kva": [
    { load: 1, fuel: 19 },
    { load: 5, fuel: 28 },
    { load: 10, fuel: 40 },
    { load: 15, fuel: 52 },
    { load: 20, fuel: 64 },
    { load: 25, fuel: 75 },
    { load: 30, fuel: 87 },
    { load: 35, fuel: 99 },
    { load: 40, fuel: 112 },
    { load: 45, fuel: 124 },
    { load: 50, fuel: 136 },
    { load: 55, fuel: 148 },
    { load: 60, fuel: 160 },
    { load: 65, fuel: 173 },
    { load: 70, fuel: 185 },
    { load: 75, fuel: 198 },
    { load: 80, fuel: 212 },
    { load: 85, fuel: 225 },
    { load: 90, fuel: 240 },
    { load: 100, fuel: 265 }
  ],

  "650kva": [
    { load: 1, fuel: 13 },
    { load: 5, fuel: 20 },
    { load: 10, fuel: 27 },
    { load: 15, fuel: 34 },
    { load: 20, fuel: 42 },
    { load: 25, fuel: 48 },
    { load: 30, fuel: 56 },
    { load: 35, fuel: 64 },
    { load: 40, fuel: 72 },
    { load: 45, fuel: 80 },
    { load: 50, fuel: 88 },
    { load: 55, fuel: 96 },
    { load: 60, fuel: 105 },
    { load: 65, fuel: 114 },
    { load: 70, fuel: 123 },
    { load: 75, fuel: 132 },
    { load: 80, fuel: 141 },
    { load: 85, fuel: 150 },
    { load: 90, fuel: 160 },
    { load: 100, fuel: 178 }
  ]

};

// ⚡ ENGINE kW (0.8 PF)
const engineKW = {
  "1400kva": 1120,
  "1020kva": 816,
  "650kva": 520
};

// ✅ SAFE NUMBER HELPER (NEW - NO LOGIC CHANGE)
const safe = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

// 🔥 INTERPOLATION
const interpolateFuel = (table, load) => {

  if (load <= 1) return table[0].fuel;
  if (load >= 100) return table[table.length - 1].fuel;

  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];

    if (load >= a.load && load <= b.load) {

      const ratio = (load - a.load) / (b.load - a.load);

      return a.fuel + ratio * (b.fuel - a.fuel);
    }
  }

  return table[table.length - 1].fuel;
};


// 🔥 FINAL FUNCTION
export const calculateEngineFuel = (engine, hours, kwh) => {

  if (!engine || !hours) return 0;

  const kw = engineKW[engine];
  const table = engineTables[engine];

  if (!kw || !table) return 0;

  // 👉 Expected generation
 const h = Number(hours || 0);
const expectedKwh = kw * h;

  let loadPercent = 50;

 const k = Number(kwh || 0);

if (k > 0 && expectedKwh > 0) {
  loadPercent = (k / expectedKwh) * 100;
}

  // clamp
  if (loadPercent < 1) loadPercent = 1;
  if (loadPercent > 100) loadPercent = 100;

  // fuel per hour
  const fuelPerHour = interpolateFuel(table, loadPercent);

  // total fuel
  const totalFuel = fuelPerHour * h;

  // ✅ SAFE RETURN (UPDATED)
  return Number(safe(totalFuel).toFixed(2));
};


// ➕ TOTAL
export const calculateTotal = (engines, other) => {

  const engineTotal = engines.reduce(
    (sum, e) => sum + Number(e.fuel || 0),
    0
  );

  const otherTotal = other.reduce(
    (sum, o) => sum + Number(o.amount || 0),
    0
  );

  // ✅ SAFE RETURN (UPDATED)
  return Number(safe(engineTotal + otherTotal).toFixed(2));
};


// 📦 STOCK
export const calculateStock = (current, incoming, total) => {

  // ✅ SAFE RETURN (UPDATED)
  return Number(
    safe(
      Number(current || 0) +
      Number(incoming || 0) -
      Number(total || 0)
    ).toFixed(2)
  );
};