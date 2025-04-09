
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";

// Import your routed page components (capitalized)
import Home from "./Home";
import Upload from "./Upload";
import Activities from "./Activities";
import Visualization from "./Visualizations";
import Chatbot from "./Chatbot";
import Air from "./Air";
import Land from "./Land";
import Sea from "./Sea";
import AllPorts from "./Allports";

function App() {
  return (
    <Router>
      <HomePage>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/visualization" element={<Visualization />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/airport" element={<Air />} />
          <Route path="/landport" element={<Land />} />
          <Route path="/seaport" element={<Sea />} />
          <Route path="/allports" element={<AllPorts />} />
        </Routes>
      </HomePage>
    </Router>
  );
}

export default App;


/*import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage"; // Your main layout
import home from "./pages/home";
import upload from "./pages/upload";
import activities from "./pages/activities";
import air from "./pages/air";
import land from "./pages/land";
import sea from "./pages/sea";
import allports from "./pages/allports";


function App(){
  return(
    <Router>
      <HomePage>
        <Routes>
          <Route path="/" element={<home />} />
          <Route path="/upload" element={<upload />} />
          <Route path="/activities" element={<activities />} />
          <Route path="/airport" element={<air />} />
          <Route path="/landport" element={<land />} />
          <Route path="/seaport" element={<sea />} />
          <Route path="/allports" element={<allports />} />
        </Routes>
      </HomePage>
    </Router>




   /* <div>
      <HomePage />
    </div>*/
 /* )
}

export default App;
/*function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Replace YOUR_API_GATEWAY_URL with the actual API Gateway URL
    fetch("YOUR_API_GATEWAY_URL")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div>
      <h1>Welcome to [ChallengeName].bh</h1>
      <p>Message from the Backend system: {message}</p>
      <p></p>
    </div>
      
  );
}*/




























