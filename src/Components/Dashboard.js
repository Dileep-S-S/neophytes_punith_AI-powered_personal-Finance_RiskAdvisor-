import React, { useMemo, useState } from "react";
import axios from "axios";
import Header from "./Header";
import "../Styles/Dashboard.css";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Dashboard() {
  const defaultData = {
    income: "",
    spendingBreakdown: [
      { name: "Food", value: 0 },
      { name: "Utility", value: 0 },
      { name: "Personal Expenses", value: 0 },
      { name: "Medicine", value: 0 },
      { name: "Others", value: 0 }
    ],
    colors: ["#007acc", "#00509e", "#66a3ff", "#003366", "#cce0ff"],
    prediction: null,
    totalSpend: 0,
    balance: 0
  };

  const [data, setData] = useState(defaultData);
  const [showForm, setShowForm] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  // Upload PDF
  const handlePdfSelect = (e) => {
    setPdfFile(e.target.files[0] || null);
  };

  // Submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!data.income) {
      setErrorMsg("Please enter income.");
      return;
    }
    if (!pdfFile) {
      setErrorMsg("Please upload a PDF file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("income", data.income);
      formData.append("pdf", pdfFile);

      const res = await axios.post(
        "http://127.0.0.1:5000/analyze_pdf",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const r = res.data;

      // ⭐ OVERRIDE LOGIC: If totalSpend >= income → High Risk
      let finalRisk = r.risk_category;
      if (r.total_spend >= Number(data.income)) {
        finalRisk = "High Risk";
      }

      const newBreakdown = [
        { name: "Food", value: r.spending.food },
        { name: "Utility", value: r.spending.utility },
        { name: "Personal Expenses", value: r.spending.personal_expenses },
        { name: "Medicine", value: r.spending.medicine },
        { name: "Others", value: r.spending.others }
      ];

      setData((prev) => ({
        ...prev,
        spendingBreakdown: newBreakdown,
        prediction: {
          risk_category: finalRisk,
          probabilities: r.probabilities
        },
        totalSpend: r.total_spend,
        balance: r.balance
      }));

      setShowForm(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to process PDF. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  // ANALYTICS
  const totalSpending = data.totalSpend;
  const balance = data.balance;
  const income = Number(data.income || 1);
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  const aiRisk = data.prediction?.risk_category || "Not Calculated";

  const risk = useMemo(() => {
    if (aiRisk === "Low Risk") return { label: "SAFE", class: "risk-safe" };
    if (aiRisk === "Medium Risk") return { label: "MODERATE", class: "risk-medium" };
    if (aiRisk === "High Risk") return { label: "DANGER", class: "risk-danger" };
    return { label: "UNKNOWN", class: "risk-medium" };
  }, [aiRisk]);

  const safeScore =
    data.prediction?.probabilities?.[0]?.[0] != null
      ? (data.prediction.probabilities[0][0] * 100).toFixed(1)
      : "0.0";

  const categoryLimits = {
    Food: 25,
    Utility: 15,
    "Personal Expenses": 20,
    Medicine: 10,
    Others: 10
  };

  const overspentCategories =
    income > 0
      ? data.spendingBreakdown.filter(
          (cat) => (cat.value / income) * 100 > (categoryLimits[cat.name] || 100)
        ).map((cat) => cat.name)
      : [];

  const suggestionLine =
    overspentCategories.length > 0
      ? "Spend less in " + overspentCategories.join(", ") + "."
      : null;

  return (
    <div>
      <Header />

      {/* FORM */}
      {showForm && (
        <div className="popup-overlay">
          <div className="popup-box">

            <h2>Upload Bank Statement</h2>

            <form className="popup-form" onSubmit={handleSubmit}>
              <label>Monthly Income</label>
              <input
                type="number"
                name="income"
                value={data.income}
                onChange={(e) => setData({ ...data, income: e.target.value })}
                placeholder="Enter your income"
                required
              />

              <label style={{ marginTop: 12 }}>Upload PDF</label>
              <input type="file" accept="application/pdf" onChange={handlePdfSelect} />

              {loading && <p style={{ color: "#666" }}>Analyzing PDF…</p>}
              {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Processing…" : "Analyze"}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {!showForm && (
        <div className="dashboard-container">

          <div className="dashboard-header">
            <h2>Financial Dashboard</h2>
            <p>Your financial summary and AI risk prediction</p>
          </div>

          <div className="dashboard-grid">

            {/* LEFT SECTION */}
            <div className="left-section">

              <div className="indicator-row">
                <Indicator title="Income" value={`₹${income}`} />
                <Indicator title="Balance" value={`₹${balance}`} />
                <Indicator title="Spend" value={`₹${totalSpending}`} />
              </div>

              <div className="side-by-side">

                {/* ANALYTICS */}
                <div className="analytics-box">
                  <h3>AI Prediction</h3>

                  <div className="savings-row">
                    <div className={`risk-circle ${risk.class}`}>{risk.label}</div>
                    <div>
                      <p>Risk Category</p>
                      <h2>{aiRisk}</h2>
                    </div>
                  </div>

                  {(aiRisk === "Medium Risk" || aiRisk === "High Risk") && suggestionLine && (
                    <div className="anomaly-warning">
                      <h4>⚠ Suggestion</h4>
                      <p>{suggestionLine}</p>
                    </div>
                  )}

                  <div className="metric-grid">
                    <div className="metric-card">Savings Rate: {savingsRate.toFixed(1)}%</div>
                    <div className="metric-card">Total Spend: ₹{totalSpending}</div>
                    <div className="metric-card">AI Safe Score: {safeScore}%</div>
                  </div>
                </div>

                {/* SAVE BUDDY */}
                <div className="save-buddy">
                  <h3>Save Buddy</h3>

                  <div className="locker">
                    <svg width="48" height="48" fill="none" stroke="#003366" strokeWidth="1.4" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <path d="M7 11V8a5 5 0 0110 0v3" />
                    </svg>
                  </div>

                  <h2>₹{(balance * 0.20).toFixed(2)}</h2>
                  <p style={{ textAlign: "center" }}>
                    Suggested Monthly Savings (20%)
                  </p>
                </div>

              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="right-section">
              <div className="actions-card">

                <h3>Spending Categories</h3>

                <div className="category-add-list">
                  {data.spendingBreakdown.map((item, index) => (
                    <div className="category-item" key={index}>
                      <span>{item.name}: ₹{item.value}</span>
                    </div>
                  ))}
                </div>

                <h3 style={{ marginTop: "20px" }}>Spending Chart</h3>

                <div className="chart-wrapper">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={data.spendingBreakdown}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        label
                      >
                        {data.spendingBreakdown.map((item, index) => (
                          <Cell key={index} fill={data.colors[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}


/* INDICATOR */
function Indicator({ title, value }) {
  return (
    <div className="indicator">
      <p className="indicator-title">{title}</p>
      <h2 className="indicator-value">{value}</h2>
    </div>
  );
}
