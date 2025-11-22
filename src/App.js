import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Overview from "./Components/Overview";
import Events from "./Components/Events";
import Account from "./Components/Account";
import Example from "./Example";
import ChatBox from "./Components/ChatBox";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <Routes>
      {/* Login first */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" />
          ) : (
            <Login setIsLoggedIn={setIsLoggedIn} />
          )
        }
      />

      <Route
        path="/dashboard"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
      />

       <Route
          path="/chatbot"
          element={isLoggedIn ? <ChatBox /> : <Navigate to="/" />}
        />

      <Route
        path="/overview"
        element={isLoggedIn ? <Overview /> : <Navigate to="/" />}
      />

      <Route
        path="/events"
        element={isLoggedIn ? <Events /> : <Navigate to="/" />}
      />

       
      <Route
        path="/account"
        element={isLoggedIn ? <Account /> : <Navigate to="/" />}
      />

    </Routes>

    
  );
}

export default App;
