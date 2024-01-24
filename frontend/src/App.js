import React, { useState } from "react";
import "./App.css";
import { Button, Card, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

function App() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const getChankyaTeaching = async () => {
    if(loading){
      console.log('already a request in progress ')
      return 
    }
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
      setResult(`${result["output"]}`);
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
          marginBottom: "10%",
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
          onPressEnter={getChankyaTeaching}
        />
        <Space>
          {!loading ? (
            <Button
              type="secondary"
              icon={<SearchOutlined />}
              style={{
                color: "whitesmoke",
              }}
              hidden={loading}
              onClick={getChankyaTeaching}
            />
          ) : (
            ""
          )}
        </Space>
      </div>
      <Card
        bordered={false}
        type="inner"
        style={{
          backgroundColor: "#000000",
          color: "#04A57D",
          marginLeft: "20%",
          marginTop: "5%",
          marginBottom: "5%",
          width: "60%",
          fontSize: "20px",
        }}
      >
        {loading ? "thinking ..." : result}
      </Card>
    </div>
  );
}

export default App;
