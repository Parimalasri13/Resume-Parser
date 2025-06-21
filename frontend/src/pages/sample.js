

import React, { useEffect, useState } from "react";

const VoiceToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  let recognition;

  if ("webkitSpeechRecognition" in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
  }

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const speech = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + speech + " ");
          } else {
            interimTranscript += speech;
          }
        }
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
      };
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

};

export default VoiceToText;






  return (
    <div style={{ padding: 20 }}>
      <h2>🎤 Voice to Text</h2>
      <button onClick={startListening} disabled={isListening}>Start Listening</button>
      <button onClick={stopListening} disabled={!isListening}>Stop Listening</button>
      <div style={{ marginTop: 20 }}>
        <h4>Transcript:</h4>
        <p>{transcript}</p>
      </div>
    </div>
  );






  <div style={styles.jobSection}>
      <h2 style={styles.jobTitle}>📄 Job Description</h2>
      <p style={styles.jobDesc}>Paste or speak the job description to intelligently match candidates</p>

      <div style={styles.toggleContainer}>
        <label style={styles.toggleLabel}>
          <input
            type="radio"
            value="text"
            checked={inputMode === "text"}
            onChange={() => setInputMode("text")}
          />
          Text Input
        </label>
        <label style={styles.toggleLabel}>
          <input
            type="radio"
            value="voice"
            checked={inputMode === "voice"}
            onChange={() => setInputMode("voice")}
          />
          Voice Input
        </label>
      </div>

      {inputMode === "text" ? (
        <textarea
          value={job_Description}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Enter the job description, required skills, and experience..."
          style={styles.textarea}
        />
      ) : (
        <>
          <button
            onClick={startListening}
            disabled={isListening}
            style={styles.button}
          >
            🎤 Start Listening
          </button>
          <button
            onClick={stopListening}
            disabled={!isListening}
            style={{ ...styles.button, backgroundColor: "#c0392b" }}
          >
            🛑 Stop Listening
          </button>
          <div style={styles.transcriptBox}>
            <h4>Live Transcript:</h4>
            <p>{transcript}</p>
          </div>
        </>
      )}
    </div>






import React, { useState, useRef } from "react";

const JobDescriptionInput = () => {
  const [job_Description, setJobDescription] = useState("");
  const [inputMode, setInputMode] = useState("text"); // "text" or "voice"
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  if ("webkitSpeechRecognition" in window && !recognitionRef.current) {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
  }

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      setTranscript("");
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const speech = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + speech + " ");
          } else {
            interimTranscript += speech;
          }
        }
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
      };
    }
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      setJobDescription((prev) => prev + " " + transcript);
    }
  };

  return (
    <div style={styles.jobSection}>
      <h2 style={styles.jobTitle}>📄 Job Description</h2>
      <p style={styles.jobDesc}>
        Paste or speak the job description to intelligently match candidates
      </p>

      {/* Input Mode Toggle */}
      <div style={styles.toggleContainer}>
        <label style={styles.toggleLabel}>
          <input
            type="radio"
            value="text"
            checked={inputMode === "text"}
            onChange={() => setInputMode("text")}
          />
          Text Input
        </label>
        <label style={styles.toggleLabel}>
          <input
            type="radio"
            value="voice"
            checked={inputMode === "voice"}
            onChange={() => setInputMode("voice")}
          />
          Voice Input
        </label>
      </div>

      {/* Text or Voice Input */}
      {inputMode === "text" ? (
        <textarea
          value={job_Description}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Enter or speak the job description, required skills, and experience..."
          style={styles.textarea}
        />
      ) : (
        <>
          <div style={styles.buttonGroup}>
            <button
              onClick={startListening}
              disabled={isListening}
              style={styles.button}
            >
              🎤 Start Listening
            </button>
            <button
              onClick={stopListening}
              disabled={!isListening}
              style={{ ...styles.button, backgroundColor: "#c0392b" }}
            >
              🛑 Stop Listening
            </button>
          </div>
          <div style={styles.transcriptBox}>
            <h4>Live Transcript:</h4>
            <p>{transcript || "Waiting for input..."}</p>
          </div>
        </>
      )}
    </div>
  );
};

// ===== CSS in JS =====
const styles = {
  jobSection: {
    padding: 30,
    backgroundColor: "#f4f6f9",
    borderRadius: 12,
    maxWidth: 800,
    margin: "40px auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Segoe UI, sans-serif",
  },
  jobTitle: {
    fontSize: 24,
    marginBottom: 10,
    color: "#2c3e50",
  },
  jobDesc: {
    fontSize: 16,
    marginBottom: 20,
    color: "#34495e",
  },
  toggleContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#2c3e50",
  },
  textarea: {
    width: "100%",
    minHeight: 250,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    border: "1px solid #ccc",
    resize: "vertical",
    backgroundColor: "#ffffff",
    outline: "none",
  },
  buttonGroup: {
    marginBottom: 20,
  },
  button: {
    padding: "10px 20px",
    marginRight: 10,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: 16,
  },
  transcriptBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
  },
};

export default JobDescriptionInput;
