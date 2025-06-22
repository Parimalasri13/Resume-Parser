import React, { useState } from "react";

const ChatWidget = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);

  const sendQuery = async () => {
    if (!query.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: query }]);

    try {
      const res = await fetch("http://localhost:5000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "❌ Error getting response from server." },
      ]);
    }

    setQuery("");
  };

  return (
    <div style={styles.chatBox}>
      <div style={styles.header}>Chat Assistant</div>
      <div style={styles.body}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.role === "user" ? "#4b5563" : "#334155"

            }}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div style={styles.footer}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuery()}
          placeholder="Type your question..."
          style={styles.input}
        />
        <button onClick={sendQuery} style={styles.sendButton}>Send</button>
      </div>
    </div>
  );
};

const styles = {
  chatBox: {
    position: "fixed",
    bottom: 100,
    right: 20,
    width: 300,
    height: 400,
    backgroundColor: "#1e293b", // dark navy
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
    zIndex: 1000,
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    padding: 10,
    background: "linear-gradient(to bottom right, #6366f1, #8b5cf6)",
    color: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    padding: 10,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  footer: {
    padding: 10,
    display: "flex",
    gap: 5,
    borderTop: "1px solid #334155",
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    border: "1px solid #475569",
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
  },
  sendButton: {
    padding: "8px 12px",
    background: "linear-gradient(to bottom right, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  message: {
    padding: 8,
    borderRadius: 8,
    maxWidth: "80%",
    color: "#f1f5f9",
    backgroundColor: "#334155",
  },
};


export default ChatWidget;
