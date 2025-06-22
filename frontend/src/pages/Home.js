import React, { useState, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Typewriter } from "react-simple-typewriter";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";
import  {  useEffect } from "react";


function Home() {
  const BASE_URL = process.env.REACT_APP_SERVER_URL;
  const [loading, setLoading] = useState(false);
  const [job_Description, setJobDescription] = useState("");
  const [tableData, setTableData] = useState([]);
  const [tableError, setTableError] = useState("");
  const [showTable, setShowTable] = useState(false);

  // Sorting
  const [sortKey, setSortKey] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filtering
  const [minScore, setMinScore] = useState("");
  const [minExp, setMinExp] = useState("");

  // Pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const [resumeCount, setResumeCount] = useState( 1);
  const [updatedCount, setUpdatedCount] = useState(0);
 


useEffect(() => {
  const fetchResumeCount = async () => {
    setResumeCount(1);  // default to 1 to avoid div-by-zero
    try {
      const res = await axios.get(`${BASE_URL}/resume_count`);
      setResumeCount(res.data.count || 0);
      console.log("Fetched resume count:", res.data.count);
    } catch (err) {
      console.error("Failed to fetch resume count", err);
    }
  };

  fetchResumeCount();
}, []);





  let eventSource; // Declare in outer scope

const startStreaming = async () => {
  setLoading(true);
  setTableData([]);
  setShowTable(false);
  setTableError("");
  setPage(1);
  setUpdatedCount(0); // reset count


  if (!job_Description.trim()) {
    toast.error("Please enter a job description.");
    setLoading(false);
    return;
  }

  try {
    toast.info("Streaming resume analysis...");
    eventSource = new EventSource(`${BASE_URL}/progress_stream`);

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === "complete") {
        if (data.message) toast.success(data.message);
        else {
          const { count, results } = data;
          setResumeCount(count); // final count
          toast.success(`${count} resumes processed!`);
          if (results?.length) {
            setTableData(results);
            setShowTable(true);
          } else {
            setTableError("No results found.");
            setShowTable(false);
          }
        }
        eventSource.close(); // ✅ works now because it's in scope
      } else {
        if (data.message?.includes("Processing")) {
          setUpdatedCount((prev) => prev + 1);
        }
        toast.info(data.message);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      toast.error(`Error streaming data.`);
      eventSource.close();
    };

    await axios.post(`${BASE_URL}/process_resumes`, { job_Description }, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Submission failed:", error);
    toast.error(`Failed to start streaming. Error: ${error.message}`);
  } finally {
    setLoading(false);
    setJobDescription("");
  }
};


  const paginatedData = useMemo(() => {
    let data = [...tableData];

    if (minScore !== "") {
      const ms = Number(minScore);
      if (!isNaN(ms)) data = data.filter((r) => (r.score ?? 0) >= ms);
    }
    if (minExp !== "") {
      const me = Number(minExp);
      if (!isNaN(me)) data = data.filter((r) => (r.experience ?? 0) >= me);
    }

    data.sort((a, b) => {
      const aVal = Number(a[sortKey] ?? 0);
      const bVal = Number(b[sortKey] ?? 0);
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    const start = (page - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [tableData, minScore, minExp, sortKey, sortOrder, page]);

  const totalPages = useMemo(() => {
    let count = tableData.length;
    if (minScore !== "") {
      const ms = Number(minScore);
      if (!isNaN(ms)) count = tableData.filter((r) => (r.score ?? 0) >= ms).length;
    }
    if (minExp !== "") {
      const me = Number(minExp);
      if (!isNaN(me)) count = tableData.filter((r) => (r.experience ?? 0) >= me).length;
    }
    return Math.max(1, Math.ceil(count / PAGE_SIZE));
  }, [tableData, minScore, minExp]);

  const headers = ["filename", "score", "remarks"];
  const tdStyle = { padding: "12px", borderBottom: "1px solid #eee" };


  const styles = {
  container: {
    width: "80%",
    maxWidth: "500px",
    margin: "80px auto",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  topText: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#2c3e50",
  },
  progressBar: {
    width: "100%",
    height: "30px",
    backgroundColor: "#f3f3f3",
    borderRadius: "25px",
    overflow: "hidden",
    border: "2px solid #555",
  },
  fill: {
    height: "100%",
    backgroundColor: "#2c3e50",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    transition: "width 0.4s ease-in-out",
  },
  countText: {
    padding: "0 10px",
  },
};


  return (
<div style={{
  padding: 40,
  backgroundColor: "#f4f6f9",
  minHeight: "100vh",
  fontFamily: "Segoe UI, sans-serif"
}}>
  {/* Form */}
  <div style={{
    maxWidth: 1000,
    margin: "0 auto 40px",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    display: "flex",
    gap: 30,
    alignItems: "center",
    flexWrap: "wrap"
  }}>
    {/* Left Section */}
    <div style={{ flex: "1 1 400px", minWidth: 500 }}>
  <h2 style={{ color: "#2c3e50", marginBottom: 20 }}>Enter Job Description</h2>
  
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <textarea
      value={job_Description}
      onChange={(e) => setJobDescription(e.target.value)}
      placeholder="Paste your job description..."
      style={{
        padding: "12px 16px",
        borderRadius: 8,
        border: "1px solid #ccc",
        fontSize: 16,
        minWidth: 450,
        minHeight: 250,
        resize: "vertical",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        outline: "none",
        transition: "border-color 0.3s",
      }}
    />
    
    <button
      disabled={loading}
      onClick={startStreaming}
      style={{
        alignSelf: "flex-start",
        marginLeft: "40%",
        padding: "12px 24px",
        borderRadius: 8,
        backgroundColor: "#2c3e50",
        color: "#fff",
        fontSize: 16,
        border: "none",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        minHeight: 50,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.5 : 1,
      }}
    >
      Send
    </button>
  </div>
</div>


    {/* Right Section - Image */}
    <div style={{ flex: "1 1 300px", textAlign: "center" }}>
      <img
        src="Hand coding-pana.png"
        alt="Job illustration"
        style={{
          width: "100%",
          maxWidth: 300,
          height: "auto",
          borderRadius: 12,
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
        }}
      />
    </div>
  </div>


{loading && (
  <div style={styles.container}>
    {/* Title and Typewriter */}
    <div style={styles.topText}>
      <p>Processing {resumeCount !== null ? resumeCount : "..."} resumes</p>
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
        typeSpeed={100}
        deleteSpeed={30}
        delaySpeed={1500}
      />
    </div>

    {/* Progress Bar */}
    <div style={styles.progressBar}>
      <div
        style={{
          ...styles.fill,
          width: `${Math.min((updatedCount / resumeCount) * 100, 100)}%`,
        }}
      >
        <span style={styles.countText}>
          {updatedCount} / {resumeCount}
        </span>
      </div>
    </div>
  </div>
)}

      {/* Table & Filters */}
      {showTable && (
        <>
          {/* Filters & Sort */}
          <div style={{
            maxWidth: 1000, margin: "0 auto 16px", display: "flex",
            gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label style={{ color: "#2c3e50", fontWeight: 500 }}>
                Min Score:&nbsp;
                <input
                  type="number"
                  value={minScore}
                  onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
                  onWheel={(e) => e.currentTarget.blur()}
                  min="0"
                  max="100"
                  placeholder="0"
                  style={{ width: 60, padding: 4, borderRadius: 4, border: "1px solid #ccc" }}
                />
              </label>
              <label style={{ color: "#2c3e50", fontWeight: 500 }}>
                Min Exp:&nbsp;
                <input
                  type="number"
                  value={minExp}
                  onChange={(e) => { setMinExp(e.target.value); setPage(1); }}
                  onWheel={(e) => e.currentTarget.blur()}
                  min="0"
                  placeholder="0"
                  style={{ width: 60, padding: 4, borderRadius: 4, border: "1px solid #ccc" }}
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <label style={{ color: "#2c3e50", fontWeight: 500 }}>
                Sort by:&nbsp;
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  style={{
                    padding: "6px 12px", borderRadius: 6, border: "1px solid #2c3e50",
                    backgroundColor: "#2c3e50", color: "#fff", fontWeight: 500, cursor: "pointer"
                  }}
                >
                  <option value="score">Score</option>
                  <option value="experience">Experience</option>
                </select>
              </label>
              <label style={{ color: "#2c3e50", fontWeight: 500 }}>
                Order:&nbsp;
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    padding: "6px 12px", borderRadius: 6, border: "1px solid #2c3e50",
                    backgroundColor: "#2c3e50", color: "#fff", fontWeight: 500, cursor: "pointer"
                  }}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </label>
            </div>
          </div>

          {/* Table */}
          <div style={{
            maxWidth: 1000, margin: "0 auto", backgroundColor: "#fff",
            borderRadius: 16, padding: 30, boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ color: "#2c3e50", marginBottom: 20 }}>Processed Resume Results</h2>
            {tableError && <p style={{ color: "red" }}>{tableError}</p>}
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "separate", borderSpacing: 0,
                borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}>
                <thead style={{ backgroundColor: "#2c3e50", color: "#fff" }}>
                  <tr>
                    {headers.map((h, i) => (
                      <th key={h} style={{
                        padding: 12, textAlign: "left", borderBottom: "2px solid #ddd",
                        ...(i === 0 && { borderTopLeftRadius: 12 }),
                        ...(i === headers.length - 1 && { borderTopRightRadius: 12 })
                      }}>
                        {h.charAt(0).toUpperCase() + h.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#fdfdfd" : "#f7f9fc" }}>
                      <td style={tdStyle}>{row.filename}</td>
                      <td style={tdStyle}>
                        <div style={{
                          position: "relative", background: "#e0e0e0",
                          borderRadius: 10, overflow: "hidden", height: 20, width: 100
                        }}>
                          <div style={{
                            width: `${row.score || 0}%`,
                            background: row.score >= 75 ? "#27ae60" : row.score >= 50 ? "#f39c12" : "#e74c3c",
                            height: "100%"
                          }}/>
                          <div style={{
                            position: "absolute", top: 0, left: 0, height: "100%",
                            width: "100%", display: "flex", alignItems: "center",
                            justifyContent: "center", color: "#2c3e50", fontWeight: "bold"
                          }}>
                            {row.score}%
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "pre-wrap" }}>
                        {row.remarks}
                        {row.phone && <p><strong>Phone:</strong> {row.phone}</p>}
                        {row.email && <p><strong>Email:</strong> {row.email}</p>}
                        {row.experience != null && <p><strong>Exp:</strong> {row.experience} yrs</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 8, marginTop: 20
            }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid #2c3e50", background: "#2c3e50", color:"white",cursor: page===1 ? "not-allowed" : "pointer"  }}
              >
                Previous
              </button>
              <span style={{ alignSelf: "center" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid #2c3e50", background: "#2c3e50", color:"white",cursor: page===totalPages ? "not-allowed" : "pointer" }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
export default Home;
