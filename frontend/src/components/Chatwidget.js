import React, { useState } from "react";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [messages, setMessages] = useState([]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendQuery = async () => {
    if (!userQuery.trim()) return;

    const userMessage = { role: "user", content: userQuery };
    setMessages([...messages, userMessage]);
    setUserQuery("");

    try {
      const response = await fetch("http://localhost:5000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userQuery }),
      });

      const data = await response.json();
      const botMessage = { role: "bot", content: data.response || "No response." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: "❌ Error contacting backend." }]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button style={styles.floatingButton} onClick={toggleChat}>💬</button>

      {/* Chat Box */}
      {isOpen && (
        <div style={styles.chatBox}>
          <div style={styles.header}>
            <strong>Resume Chat Assistant</strong>
            <button onClick={toggleChat} style={styles.closeButton}>✖</button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? "#DCF8C6" : "#FFF",
                }}
              >
                {msg.content}
              </div>
            ))}
          </div>

          <div style={styles.inputArea}>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ask a question..."
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && sendQuery()}
            />
            <button onClick={sendQuery} style={styles.sendButton}>➤</button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  floatingButton: {
    position: "fixed",
    bottom: 20,
    right: 20,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 60,
    height: 60,
    fontSize: 24,
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  chatBox: {
    position: "fixed",
    bottom: 90,
    right: 20,
    width: 300,
    height: 400,
    backgroundColor: "#f4f6f9",
    border: "1px solid #ccc",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    fontFamily: "Segoe UI, sans-serif",
    zIndex: 1000,
  },
  header: {
    padding: 10,
    backgroundColor: "#007bff",
    color: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    padding: 10,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  message: {
    maxWidth: "80%",
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
  },
  inputArea: {
    display: "flex",
    borderTop: "1px solid #ccc",
    padding: 8,
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    border: "1px solid #ccc",
    outline: "none",
  },
  sendButton: {
    marginLeft: 8,
    padding: "8px 12px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: 5,
    cursor: "pointer",
  },
};

export default ChatWidget;
