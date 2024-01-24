import React, { useState } from "react";
import "./App.css";
import { Button, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

function App() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const getChankyaTeaching = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/predict_output", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });
      const result = await response.json();
      setResult(`Chankya's Teaching: ${result["output"]}`);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setResult("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Chankya Teachings</h1>
      <div
        style={{
          backgroundColor: "#343541",
          width: "60%",
          marginLeft: "20%",
          marginTop: "10%",
          marginBottom:"10%",
          display: "flex",
          justifyContent: "space-between",
          border: "1px solid grey",
          borderRadius: "1.2%",
        }}
      >
        <Input
          style={{
            backgroundColor: "#343541",
            boxShadow: "none",
            color: "whitesmoke",
            borderColor: "#343541",
            width: "95%",
          }}
          id="inputText"
          placeholder="E.g., How to determine true friendship?"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <Space>
          <Button
            type="secondary"
            icon={<SearchOutlined />}
            onClick={getChankyaTeaching}
          />
        </Space>
      </div>

      <div id="result">{loading ? "thinking ..." : result}</div>
    </div>
  );
}

export default App;
