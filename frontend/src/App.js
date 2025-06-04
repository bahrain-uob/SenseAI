import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./logIn";
import HomePage from "./pages/HomePage";
import Home from "./pages/Home";
import Upload from "./Upload";
import Activities from "./pages/EmployeeActivities";
import Auditing from "./pages/Auditing";
import Chatbot from "./pages/Chatbot";
import Air from "./pages/Air";
import Land from "./Land";
import Sea from "./Sea";
import AllPorts from "./pages/Allports";
import TransactionDetail from "./pages/TransactionDetail";
import ScrollToTop from './ScrollToTop';

import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { poolData } from './awsConfig';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true); // Wait until we check session

  useEffect(() => {
    const userPool = new CognitoUserPool(poolData);
    const user = userPool.getCurrentUser();

    if (user) {
      user.getSession((err, session) => {
        if (err || !session?.isValid()) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
        setLoadingAuth(false);
      });
    } else {
      setIsAuthenticated(false);
      setLoadingAuth(false);
    }
  }, []);

  if (loadingAuth) return <div>Loading...</div>; // Optional loading screen

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <HomePage>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/pages/upload" element={<Upload />} />
                  <Route path="/pages/activities" element={<Activities />} />
                  <Route path="/pages/auditing" element={<Auditing />} />
                  <Route path="/pages/chatbot" element={<Chatbot />} />
                  <Route path="/pages/airport" element={<Air />} />
                  <Route path="/pages/landport" element={<Land />} />
                  <Route path="/pages/seaport" element={<Sea />} />
                  <Route path="/pages/allports" element={<AllPorts />} />
                  <Route path="/pages/transaction/:referenceNumber/:itemNumber" element={<TransactionDetail />} />
                </Routes>
              </HomePage>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
