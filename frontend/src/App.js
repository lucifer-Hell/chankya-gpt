import React, { useState } from "react";
import "./App.css";

function App() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading,setLoading] =useState(false);

  const getChankyaTeaching = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8000/predict_output", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });
      const result = await response.json();
      setResult(`Chankya's Teaching: ${result["output"]}`);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching data:", error);
      setResult("An error occurred. Please try again.");
      setLoading(false)
    }
  };

  return (
    <div className="App">
      <h1>Chankya Teachings</h1>
      <label htmlFor="inputText">Enter your question:</label>
      <input
        type="text"
        id="inputText"
        placeholder="E.g., How to determine true friendship?"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button disabled={loading} onClick={getChankyaTeaching}>Get Chankya's Teaching</button>
      <div id="result">{loading?"thinking ...":result}</div>
    </div>
  );
}

export default App;
