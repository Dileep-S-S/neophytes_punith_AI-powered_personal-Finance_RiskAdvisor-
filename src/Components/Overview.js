import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "./Header";
import "../Styles/Overview.css";

// Format YYYY-MM-DD
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parse event key
function parseKey(key) {
  const r = key.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!r) return null;
  return { year: Number(r[1]), month: Number(r[2]) - 1, day: Number(r[3]) };
}

export default function Overview() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [events, setEvents] = useState({});
  const [lockerAmount, setLockerAmount] = useState(() => {
    const raw = localStorage.getItem("locker_amount_v2");
    return raw ? Number(raw) : 2500;
  });
  const [lockKey, setLockKey] = useState("");
  const [locked, setLocked] = useState(true);

  const chartRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, day: null, amount: 0 });

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Load events from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("ep_events_v1");
    if (raw) setEvents(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("locker_amount_v2", String(lockerAmount));
  }, [lockerAmount]);

  // Monthly totals
  const monthData = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totals = Array(daysInMonth).fill(0);
    const transactions = [];

    Object.keys(events).forEach((key) => {
      const d = parseKey(key);
      if (!d) return;
      if (d.year === viewYear && d.month === viewMonth) {
        (events[key] || []).forEach((e) => {
          totals[d.day - 1] += Number(e.expense || 0);
          transactions.push({ date: key, title: e.title, expense: Number(e.expense || 0) });
        });
      }
    });

    const totalSum = totals.reduce((a, b) => a + b, 0);
    const avg = daysInMonth ? totalSum / daysInMonth : 0;

    return {
      totals,
      transactions: transactions.sort((a, b) => a.date.localeCompare(b.date)),
      totalSum,
      avg
    };
  }, [events, viewYear, viewMonth]);

  // Locker release
  function handleRelease() {
    if (!lockKey) return alert("Enter lock key (demo)");
    if (locked) {
      setLocked(false);
      alert("Unlocked (demo)");
    } else {
      setLockerAmount((v) => v - 500);
      alert("Released ₹500!");
    }
  }

  // Tooltip movement
  function onBarMove(e, d, v) {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
      day: d,
      amount: v,
    });
  }

  return (
    <div>
      <Header />

      <div className="overview-container">
        <div className="overview-header">
          <h2>Spending Overview</h2>
          <div className="month-name">{monthNames[viewMonth]} {viewYear}</div>
        </div>

        <div className="overview-grid">
          
          {/* --- DAILY SPEND CHART --- */}
          <div className="card chart-card">
            <div className="card-header">
              <h3>Daily Spending</h3>
              <span>Total: ₹{monthData.totalSum.toFixed(2)}</span>
            </div>

            <div className="chart-area" ref={chartRef}>
              {monthData.totals.map((val, i) => {
                const max = Math.max(...monthData.totals, 1);
                const pct = (val / max) * 100;
                return (
                  <div
                    key={i}
                    className="bar"
                    onMouseMove={(e) => onBarMove(e, i + 1, val)}
                    onMouseEnter={(e) => onBarMove(e, i + 1, val)}
                    onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                  >
                    <div className="bar-fill" style={{ height: `${pct}%` }}></div>
                  </div>
                );
              })}

              {tooltip.visible && (
                <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                  <b>Day {tooltip.day}</b><br />
                  Spent ₹{tooltip.amount}
                </div>
              )}
            </div>

            <div className="chart-footer">
              <span>1</span>
              <span>{Math.ceil(monthData.totals.length / 2)}</span>
              <span>{monthData.totals.length}</span>
            </div>

            <div className="months-row">
              {monthNames.map((m, idx) => (
                <button
                  key={m}
                  className={`month-btn ${idx === viewMonth ? "active" : ""}`}
                  onClick={() => setViewMonth(idx)}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* --- TRANSACTIONS HISTORY --- */}
          <div className="card trans-card">
            <div className="card-header">
              <h3>Spending History</h3>
              <span>{monthData.transactions.length} txns</span>
            </div>

            <div className="trans-list">
              {monthData.transactions.length === 0 && (
                <p className="muted">No spending this month.</p>
              )}

              {monthData.transactions.map((t, idx) => (
                <div key={idx} className="trans-item">
                  <div>
                    <h4>{t.title}</h4>
                    <span className="muted">{t.date}</span>
                  </div>
                  <b>₹{t.expense}</b>
                </div>
              ))}
            </div>

            <div className="avg-row">
              <span className="muted">Average/day</span>
              <b>₹{monthData.avg.toFixed(2)}</b>
            </div>
          </div>

          {/* --- LOCKER --- */}
          <div className="card locker-card">
            <h3>Save Locker</h3>

            <div className="locker-row">
              <div>
                <p className="muted">Balance</p>
                <h2>₹{lockerAmount.toFixed(2)}</h2>
              </div>
              <div>
                <p className="muted">Status</p>
                <b className={locked ? "locked" : "unlocked"}>
                  {locked ? "Locked" : "Unlocked"}
                </b>
              </div>
            </div>

            <label className="muted">Enter Key</label>
            <input
              type="text"
              className="locker-input"
              value={lockKey}
              onChange={(e) => setLockKey(e.target.value)}
              placeholder="Key"
            />

            <button className="locker-btn" onClick={handleRelease}>
              {locked ? "Unlock" : "Release ₹500"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
