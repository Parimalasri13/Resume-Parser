import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const [job_Description, setJobDescription] = useState("");
  const [response, setResponse] = useState("");

  const [tableData, setTableData] = useState([]);
  const [tableError, setTableError] = useState("");


 const formatReasoning = (text) => {
  const entries = [];
  const pattern = /\*\*(.*?)\*\*:? ?(.*?)(?=(\*\*.*?\*\*|$))/gs;
  let match;
  let matchedIndices = [];

  // Extract key-value pairs
  while ((match = pattern.exec(text)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    entries.push({ key, value });
    matchedIndices.push([match.index, pattern.lastIndex]);
  }

  // Add any unmatched text (outside key-value patterns)
  let remainingText = text;
  matchedIndices.reverse().forEach(([start, end]) => {
    remainingText =
      remainingText.slice(0, start) + " ".repeat(end - start) + remainingText.slice(end);
  });

  const extraText = remainingText
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  extraText.forEach((line) => {
    if (line) {
      entries.push({ key: "Note", value: line });
    }
  });

  return entries;
};


  // Fetch CSV data once component mounts
   useEffect(() => {
    if (response) { // Only fetch if response is not empty
      fetch("http://localhost:5000/get_csv_data")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) setTableError(data.error);
          else setTableData(data);
          console.log("CSV Data:", data);
        })
        .catch(() => setTableError("Error fetching CSV data"));
    }
  }, [response]); 

  // const handleSubmit = async () => {
  //   try {
  //     const res = await axios.post(
  //       "http://localhost:5000/get_job_description",
  //       { job_Description },
  //       { headers: { "Content-Type": "application/json" } }
  //     );
  //     setResponse(res.data.message);

  //   } catch (error) {
  //     console.error("Error fetching job description:", error);
  //     if (error.response) {
  //       setResponse(`Server Error: ${error.response.data.message || error.response.statusText}`);
  //     } else {
  //       setResponse("Network error or server not reachable");
  //     }
  //   }
  // };
  const handleSubmit = async () => {
  try {
    // add a toster 
   // setResponse(`Job description received successfully and resumes are being processed...`);
   toast.success("Job description sent successfully!");
    const res = await axios.post(
      "http://localhost:5000/get_job_description",
      { job_Description },
      { headers: { "Content-Type": "application/json" } }
    );

    const count = res.data.count;

    setResponse(`✅ ${res.data.message} `);

  } catch (error) {
    console.error("Error fetching job description:", error);
    if (error.response) {
      setResponse(`Server Error: ${error.response.data.message || error.response.statusText}`);
    } else {
      setResponse("Network error or server not reachable");
    }
  }
};


  // For CSV table headers
  const headers = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
  
 <div
  style={{
    padding: "40px",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  }}
>
  {/* Container for form and image */}
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
      flexWrap: "wrap", // responsive on smaller screens
    }}
  >
    {/* Job Description Form */}
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
          onClick={handleSubmit}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            backgroundColor: "#2c3e50",
            color: "#ffffff",
            fontSize: "16px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>

      {response && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#ecf0f1",
            padding: "15px 20px",
            borderRadius: "10px",
            color: "#34495e",
            fontSize: "15px",
          }}
        >
          <strong>Response from backend:</strong> <br />
          {response}
        </div>
      )}
    </div>

    {/* Image on the Right */}
    <div style={{ flex: "1 1 300px", textAlign: "center" }}>
      <img
        src="Hand coding-pana.png" // Replace with your preferred image
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



    {/* CSV Table Section */}
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
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>CSV Data Table</h2>

      {tableError && <p style={{ color: "red" }}>{tableError}</p>}
      {!tableError && tableData.length === 0 && <p>Loading CSV data...</p>}

      {tableData.length > 0 && (
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
                const parsedReasoning = formatReasoning(row.reason || "");
                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#fdfdfd" : "#f7f9fc",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {row.filename}
                    </td>

                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          background: "#e0e0e0",
                          borderRadius: "10px",
                          overflow: "hidden",
                          height: "20px",
                          width: "100px",
                        }}
                      >
                        <div
                          style={{
                            width: `${row.match_score || 0}%`,
                            background:
                              row.match_score >= 75
                                ? "#27ae60"
                                : row.match_score >= 50
                                ? "#f39c12"
                                : "#e74c3c",
                            height: "100%",
                            textAlign: "center",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {row.match_score}%
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #eee",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <div style={{ textAlign: "left" }}>
                        {parsedReasoning.map(({ key, value }, i) => (
                          <p key={i} style={{ marginBottom: "6px" }}>
                            <strong>{key}:</strong> {value}
                          </p>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
  </div>
);
}
export default App;

