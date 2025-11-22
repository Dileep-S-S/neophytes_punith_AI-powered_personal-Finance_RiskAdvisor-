import React from "react";
import Header from "./Header";
import "../Styles/Account.css";

export default function Account() {
  const user = {
    name: "Vinay Kumar",
    email: "vinay@example.com",
    phone: "+91 98765 43210",
    accountNo: "XXXX-XXXX-1234",
    bank: "Example Bank",
  };

  function handleLogout() {
    alert("Logged out (placeholder)");
  }

  function handleAction(action) {
    alert(action + " — placeholder");
  }

  return (
    <div>
      <Header />

      <div className="account-container">
        <div className="account-header">
          <div>
            <h2>Account</h2>
            <p className="sub">Manage your account and banking actions</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="account-grid">
          {/* LEFT CARD */}
          <div className="left-card">
            <div className="profile-row">
              <div className="avatar">{user.name[0]}{user.name[1]}</div>

              <div className="user-meta">
                <h3 className="user-name">{user.name}</h3>
                <p className="email">{user.email}</p>
                <p className="bank-info">
                  {user.bank} • Account: {user.accountNo}
                </p>
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-box">
                <p className="label">Phone</p>
                <p>{user.phone}</p>
              </div>

              <div className="detail-box">
                <p className="label">Member Since</p>
                <p>Jan 2022</p>
              </div>

              <div className="detail-box">
                <p className="label">Preferred Currency</p>
                <p>INR (₹)</p>
              </div>

              <div className="detail-box">
                <p className="label">Plan</p>
                <p>Free</p>
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="right-card">
            <h3 className="right-title">Bank Actions</h3>

            <div className="action-box">
              <button
                className="action-btn"
                onClick={() => handleAction("Update Bank Statement")}
              >
                Update Bank Statement
              </button>

              <button
                className="action-btn"
                onClick={() => handleAction("View Bank Statement")}
              >
                View Bank Statement
              </button>

              <button
                className="action-btn"
                onClick={() => handleAction("Average Spending")}
              >
                Average Spending
              </button>
            </div>

            <p className="tip">
              Tip: "Update Bank Statement" helps you upload recent transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
