
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Home from "./pages/Home";
import Upload from "./Upload";
import Activities from "./pages/Activities";
import Auditing from "./pages/Auditing";
import Chatbot from "./pages/Chatbot";
import Air from "./pages/Air";
import Land from "./Land";
import Sea from "./Sea";
import AllPorts from "./pages/Allports";


function App() {
  return (
    <Router>
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
        </Routes>
      </HomePage>
    </Router>
  );
}

export default App;































