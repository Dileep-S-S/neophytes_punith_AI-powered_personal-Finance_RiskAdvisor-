import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css";

function LoginRegister({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true); // toggle login/register

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    income: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------------------------
  // REGISTER API
  // -------------------------
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/api/user/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        income: formData.income
      });

      alert("Registered Successfully!");
      setIsLogin(true);
    } catch (error) {
      console.error(error);
      alert("Registration failed!");
    }
  };

  // -------------------------
  // LOGIN API
  // -------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/api/user/login", {
        email: formData.email,
        password: formData.password
      });

      if (res.data === "Login Success") {
        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        alert("Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed!");
    }
  };

  return (
    <div className="container login-container">
      <div className="card login-card p-4">
        <h3 className="text-center mb-3">
          {isLogin ? "Login" : "Register"}
        </h3>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
              <div className="mb-3">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Income:</label>
                <input
                  type="number"
                  name="income"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="mb-3">
            <label>Email:</label>
            <input
              type="text"
              name="email"
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              className="form-control"
              onChange={handleChange}
            />
          </div>

          <button className="btn btn-primary w-100" type="submit">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p
          className="text-center mt-3"
          style={{ cursor: "pointer", color: "blue" }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default LoginRegister;
