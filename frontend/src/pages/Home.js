import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Typewriter } from "react-simple-typewriter";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

function App() {
  const BASE_URL = process.env.REACT_APP_SERVER_URL;
  const [loading, setLoading] = useState(false);
  const [job_Description, setJobDescription] = useState("");
  const [tableData, setTableData] = useState([]);
  const [tableError, setTableError] = useState("");
  const [showTable, setShowTable] = useState(false);

  // const formatReasoning = (text) => {
  //   const entries = [];
  //   const pattern = /\*\*(.*?)\*\*:? ?(.*?)(?=(\*\*.*?\*\*|$))/gs;
  //   let match;
  //   let matchedIndices = [];

  //   while ((match = pattern.exec(text)) !== null) {
  //     const key = match[1].trim();
  //     const value = match[2].trim();
  //     entries.push({ key, value });
  //     matchedIndices.push([match.index, pattern.lastIndex]);
  //   }

  //   let remainingText = text;
  //   matchedIndices.reverse().forEach(([start, end]) => {
  //     remainingText =
  //       remainingText.slice(0, start) +
  //       " ".repeat(end - start) +
  //       remainingText.slice(end);
  //   });

  //   const extraText = remainingText
  //     .trim()
  //     .split("\n")
  //     .map((line) => line.trim())
  //     .filter((line) => line);

  //   extraText.forEach((line) => {
  //     if (line) {
  //       entries.push({ key: "Note", value: line });
  //     }
  //   });

  //   return entries;
  // };

  const handleSubmit = async () => {
    setLoading(true);
    setTableData([]);
    setShowTable(false);
    if (job_Description.trim() === "") {
      toast.error("Please enter a job description.");
      setLoading(false);
      return;
    }
    try {
      toast.info("Sending job description...");
      const res = await axios.post(
        `${BASE_URL}/process_resumes`,
        { job_Description },
        { headers: { "Content-Type": "application/json" } }
      );

      const { count, results } = res.data;
      toast.success(`${count} resumes processed!`);

      if (results && results.length > 0) {
        setTableData(results);
        setShowTable(true);
      } else {
        setTableError("No results found.");
        setShowTable(false);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Error processing resumes.");
      setShowTable(false);
    } finally {
      setLoading(false);
    }
  };

  const headers = ["filename", "score", "Remarks"];
  const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee",
  };

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#f4f6f9",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Form Container */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto 40px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          display: "flex",
          gap: "30px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Form */}
        <div style={{ flex: "1 1 400px", minWidth: "300px" }}>
          <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
            Enter Job Description
          </h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              value={job_Description}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste your job description..."
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
                minWidth: "250px",
              }}
            />
            <button
              disabled={loading}
              onClick={handleSubmit}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                backgroundColor: "#2c3e50",
                color: "#ffffff",
                fontSize: "16px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Image */}
        <div style={{ flex: "1 1 300px", textAlign: "center" }}>
          <img
            src="Hand coding-pana.png"
            alt="Job illustration"
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "auto",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
            }}
          />
        </div>
      </div>
      {/* Loading Indicator */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            margin: "80px 0",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#2c3e50",
          }}
        >
          <Typewriter
            words={[
              "Initializing",
              "Parsing Resume",
              "Standby Mode: Active Learning",
              "Ingesting new data streams...",
              "Our AI system is adapting, evolving, every moment.",
              "Knowledge base expanded. Ready for next query.",
            ]}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={100} // slow typing
            deleteSpeed={30} // slow deleting
            delaySpeed={1500} // pause between messages
          />
        </div>
      )}

      {/* Results Table Section */}
      {showTable && (
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
            Processed Resume Results
          </h2>

          {tableError && <p style={{ color: "red" }}>{tableError}</p>}

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
            >
              <thead style={{ backgroundColor: "#2c3e50", color: "white" }}>
                <tr>
                  {headers.map((head, index) => (
                    <th
                      key={head}
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                        ...(index === 0 && { borderTopLeftRadius: "12px" }),
                        ...(index === headers.length - 1 && {
                          borderTopRightRadius: "12px",
                        }),
                      }}
                    >
                      {head.charAt(0).toUpperCase() + head.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => {
                  return (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#fdfdfd" : "#f7f9fc",
                      }}
                    >
                      <td style={tdStyle}>{row.filename}</td>
                      <td style={tdStyle}>
                        <div
                          style={{
                            position: "relative", // make container a positioning context
                            background: "#e0e0e0",
                            borderRadius: "10px",
                            overflow: "hidden",
                            height: "20px",
                            width: "100px",
                          }}
                        >
                          <div
                            style={{
                              width: `${row.score || 0}%`,
                              background:
                                row.score >= 75
                                  ? "#27ae60"
                                  : row.score >= 50
                                  ? "#f39c12"
                                  : "#e74c3c",
                              height: "100%",
                            }}
                          ></div>

                          {/* Centered text */}
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              height: "100%",
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#2c3e50",
                              fontWeight: "bold",
                            }}
                          >
                            {row.score}%
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "pre-wrap" }}>
                        {/* <div style={{ textAlign: "left" }}>
                          {row.reason.map(({ key, value }, i) => (
                            <p key={i} style={{ marginBottom: "6px" }}>
                              <strong>{key}:</strong> {value}
                            </p>
                          ))}
                        </div> */}
                        {row.remarks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </div>
  );
}
export default App;
