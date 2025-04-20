import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      setMessage("Please select a fileeeeeeeeeeeeeee.");
      return;
    }

    try {
      // Replace with your actual API Gateway endpoint
      const apiUrl = "https://jygos38ud0.execute-api.me-south-1.amazonaws.com/prod/uploadobj";
      const response = await fetch(`${apiUrl}?type=${file.type}`);
      const data = await response.json();
      setMessage("uploaded");

      const uploadResponse = await fetch(data.uploadUrl, {
     
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (uploadResponse.ok) {
        setMessage("Upload successful ✅");
      } else {
        setMessage("Upload failed ❌");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("An error occurred during upload ❌");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Welcome ZMXWR</h1>
      <h1>Welcome </h1>
      <p></p>

      <h2>Upload File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile} style={{ marginLeft: "1rem" }}>Upload</button>
      <p>{message}</p>
    </div>
  );
}

export default App;

/* 
import React, { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    // Save selected file in state (if needed)
  };

  const uploadFile = async () => {
    // Upload logic
    setMessage("Upload successful ✅"); // or error message
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Welcome to SensAI.bh</h1>
      <p></p>

      <h2>Upload File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile} style={{ marginLeft: "1rem" }}>
        Upload
      </button>
      <p>{message}</p>
    </div>
  );
}

export default App; */
