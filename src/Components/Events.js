import React, { useEffect, useState } from "react";
import Header from "./Header"; 
import "../Styles/Events.css"; 
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthDays(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function Events() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [events, setEvents] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: "", expense: "" });

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("events_v2");
      if (raw) setEvents(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem("events_v2", JSON.stringify(events));
  }, [events]);

  function openModal(year, month, day) {
    const d = new Date(year, month, day);
    setSelectedDate(d);
    setForm({ title: "", expense: "" });
    setModalOpen(true);
  }

  function saveEvent(e) {
    e.preventDefault();
    if (!selectedDate) return;

    const key = formatDateKey(selectedDate);
    const ev = { title: form.title, expense: Number(form.expense) };

    setEvents((prev) => ({
      ...prev,
      [key]: prev[key] ? [...prev[key], ev] : [ev],
    }));

    setModalOpen(false);
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = getMonthDays(viewYear, viewMonth);

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <Header />

      <div className="events-container">
        <div className="events-header">
          <h2>Events Calendar</h2>

          <div className="events-controls">
            <button
              className="btn-nav"
              onClick={() => {
                setViewMonth((m) => (m - 1 + 12) % 12);
                if (viewMonth === 0) setViewYear((y) => y - 1);
              }}
            >
              ← Prev
            </button>

            <div className="month-label">
              {monthNames[viewMonth]} {viewYear}
            </div>

            <button
              className="btn-nav"
              onClick={() => {
                setViewMonth((m) => (m + 1) % 12);
                if (viewMonth === 11) setViewYear((y) => y + 1);
              }}
            >
              Next →
            </button>
          </div>
        </div>

        <div className="calendar-layout">
          <div className="calendar-card">
            <div className="weekdays">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="calendar-grid">
              {cells.map((day, idx) => {
                if (day === null)
                  return <div key={idx} className="empty-cell"></div>;

                const date = new Date(viewYear, viewMonth, day);
                const key = formatDateKey(date);
                const list = events[key] || [];

                return (
                  <div
                    key={idx}
                    className="day-cell"
                    onClick={() => openModal(viewYear, viewMonth, day)}
                  >
                    <div className="date-number">{day}</div>

                    {list.slice(0, 2).map((ev, i) => (
                      <div key={i} className="event-preview">
                        • {ev.title} (₹{ev.expense})
                      </div>
                    ))}

                    {list.length > 2 && (
                      <div className="more-events">+{list.length - 2} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="month-sidebar">
            <h3>Months</h3>

            {monthNames.map((mn, i) => (
              <button
                key={mn}
                className={`month-btn ${viewMonth === i ? "active" : ""}`}
                onClick={() => setViewMonth(i)}
              >
                {mn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedDate && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Add Event — {formatDateKey(selectedDate)}</h3>

            <form onSubmit={saveEvent}>
              <label>Event Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />

              <label>Expense (₹)</label>
              <input
                type="number"
                value={form.expense}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expense: e.target.value }))
                }
                required
              />

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
