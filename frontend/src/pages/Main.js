
import { Upload } from "lucide-react";
import React, { useState, useRef, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Typewriter } from "react-simple-typewriter";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";
import  {  useEffect } from "react";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';


const styles = {
  container: {
    // minHeight: "100vh",
    backgroundColor: "#f9fafb",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  cardGrid: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    padding: "16px",
  },
  cardText: {
    color: "#6b7280",
    fontSize: "14px",
  },
  cardValue: {
    fontSize: "24px",
    fontWeight: "600",
  },
  smallNote: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  uploadSection: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    marginBottom: "32px",
  },
  dashedBox: {
    border: "2px dashed #d1d5db",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
  },
  floatingButton: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
    color: "#ffffff",
    padding: "12px",
    borderRadius: "9999px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
  jobSection: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    padding: "24px",
    marginBottom: "32px",
  },
  jobTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#15803d",
  },
  jobDesc: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "12px",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #e5e7eb",
    marginBottom: "16px",
    resize: "vertical",
  },
  buttonGradient: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to right, #6366f1, #c084fc)",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    width: "100%",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
    topText: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#6366f1",
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
    background: "linear-gradient(to right, #6366f1, #c084fc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
    transition: "width 0.4s ease-in-out",
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
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
  },
};

const Card = ({ children }) => <div style={styles.card}>{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;

const HRPortalDashboard = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const BASE_URL = process.env.REACT_APP_SERVER_URL;
  const [loading, setLoading] = useState(false);
  const [job_Description, setJobDescription] = useState("");
  const [tableData, setTableData] = useState([]);
  const [tableError, setTableError] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [inputMode, setInputMode] = useState("text");

  // Sorting
  const [sortKey, setSortKey] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  // Filtering
  const [minScore, setMinScore] = useState("");
  const [minExp, setMinExp] = useState("");

  // Pagination
  const PAGE_SIZE = 10;
  const matchRate = 75;
  const [page, setPage] = useState(1);

  const [resumeCount, setResumeCount] = useState();
  const [updatedCount, setUpdatedCount] = useState(0);
  const [shortListCount,setShortListCount] = useState(0);
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

  

  // Function to handle CSV download and resume zippin
  const handleDownload = () => {
    const csvHeaders = ["Filename", "Score", "Remarks", "Phone", "Email", "Experience"];
    const rows = paginatedData.map(row => [
      row.filename,
      `${row.score}%`,
      row.remarks?.replace(/\n/g, ' ') || '',
      row.phone || '',
      row.email || '',
      row.experience !== null ? `${row.experience} yrs` : ''
    ]);
  
    const csvContent = [csvHeaders, ...rows]
      .map(e => e.map(field => `"${field}"`).join(","))
      .join("\n");
  
    // Create Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
    // Format filename with date-time
    const now = new Date();
    const formatted = now.toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).replace(/[/:, ]+/g, "_"); // Replace invalid filename characters
  
    const filename = `candidates_${formatted}.csv`;
  
    // Trigger download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };  

  
  useEffect(() => {
  const fetchResumeCount = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/resume_count`);
      setResumeCount(res.data.count || 0);
      console.log("Fetched resume count:", res.data.count);
    } catch (err) {
      console.error("Failed to fetch resume count", err);
    }
  };

  fetchResumeCount();
}, [resumeCount]);

 let eventSource; // Declare in outer scope

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const startStreaming = async () => {
  setLoading(true);
  setTableData([]);
  setShowTable(false);
  setTableError("");
  setPage(1);
  setUpdatedCount(0);

  // Combine voice transcript and job_Description
  const finalDescription = (job_Description + " " + transcript).trim();

  if (!finalDescription) {
    toast.error("Please enter or speak a job description.");
    setLoading(false);
    return;
  }

  try {
    toast.info("Streaming resume analysis...");
    eventSource = new EventSource(`${BASE_URL}/progress_stream?t=${Date.now()}`);

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "complete") {
        setUpdatedCount(0);
        // setTotalCount(0);
        if(data.message) toast.success(data.message);
        else {
          const { count, results } = data;
          toast.success(`${count} resumes processed!`);
          if (results?.length) {
            setTableData(results);
            for (let i = 0; i < results.length; i++) {
              if(results[i].score >= matchRate) setShortListCount(prev => prev + 1);
            }
            setShowTable(true);
          } else {
            setTableError("No results found.");
            setShowTable(false);
          }
        }
        eventSource.close();
      } else {
        if (typeof data.done === "number" && typeof data.total === "number") {
          setUpdatedCount(data.done);
          // setTotalCount(data.total);
        }
        // toast.info(data.message);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      toast.error(`Error streaming data. ${err}`);
      eventSource.close();
    };

    // Send finalDescription (merged text + voice) to backend
    await axios.post(`${BASE_URL}/process_resumes`, {
      job_Description: finalDescription,
    }, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Submission failed:", error);
    toast.error(`Failed to start streaming. Error: ${error.message}`);
  } finally {
    setLoading(false);
    setJobDescription("");
    setTranscript(""); // Clear transcript for next input
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


  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select one or more PDF files to upload.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      setUploading(true);
      const res = await axios.post(`${BASE_URL}/upload_resumes`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "Files uploaded successfully!");
      setResumeCount();
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || "Upload failed. Please try again.";
      console.error("Upload error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }


    

  };



  

  return (
    
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          {/* <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e40af" }}>HR Portal</h1> */}
          <p style={styles.cardText}>Intelligent Candidate Management</p>
        </div>
      </header>

      <div style={styles.cardGrid}>
        <Card>
          <CardContent>
            <p style={styles.cardText}>Total Resumes</p>
            <p style={styles.cardValue}>{resumeCount}</p>
            <p style={styles.smallNote}>Uploaded resumes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p style={styles.cardText}>Shortlisted</p>
            <p style={styles.cardValue}>{shortListCount}</p>
            <p style={styles.smallNote}>Matching candidates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p style={styles.cardText}>Match Rate</p>
            <p style={styles.cardValue}>{matchRate}%</p>
            <p style={styles.smallNote}>Job relevance</p>
          </CardContent>
        </Card>
      </div>

      <div style={styles.uploadSection}>
        <h2 style={{ ...styles.cardValue, color: "#1e40af", fontSize: "18px" }}>
          Upload Resumes
        </h2>
        <p style={styles.cardText}>
          Upload PDF or DOC files to extract candidate information
        </p>

        {/* Wrapper to control layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <label style={styles.dashedBox}>
            <Upload style={{ margin: "0 auto", color: "#3b82f6", marginBottom: "12px" }} size={32} />
            <p style={styles.cardText}>
              {selectedFiles.length === 0
                ? "Drop files here or click to browse"
                : `${selectedFiles.length} file(s) selected`}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: uploading ? "#5c6d7a" : "#1e40af",
              color: "#ffffff",
              fontSize: "14px",
              border: "none",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.6 : 1,
              width: "100%",
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
      {/* Show toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />



        <div style={styles.jobSection}>
        
        <h2 style={styles.jobTitle}>📄 Job Description</h2>
        <p style={styles.jobDesc}>Paste the job description to intelligently match candidates</p>
        
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

        <button 
          onClick={startStreaming}
          disabled={loading}
          style={{
            ...styles.buttonGradient,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            minHeight: 50,
          }}
        >
          🔍 Shortlist Candidates
        </button>
      </div>

    <div style={styles.jobSection}> 
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1e40af" }}>👥 Candidates</h2>
      <p style={styles.cardText}>Review and manage candidate profiles</p>
    </div>
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <input
        type="text"
        placeholder="🔍 Search candidates..."
        style={{
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          fontSize: "14px",
          minWidth: "200px",
        }}
      />
      <button
        onClick={handleDownload}
        style={{
          background: "linear-gradient(to right, #34d399, #10b981)",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          border: "none",
          cursor: "pointer",
        }}
      >
        ⬇️ Download CSV
      </button>
    </div>
  </div>

  {/* Show loading progress only when loading */}
  {loading && (
    <div style={styles.container}>
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

  {/* Show this only when not loading */}
  {!loading &&  !showTable && (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>👤</div>
      <p style={{ fontWeight: "600", fontSize: "16px" }}>No candidates found</p>
      <p style={styles.cardText}>Upload resumes to get started</p>
    </div>
  )}
   {/* Table & Filters */}
{showTable && (
  <>
    {/* Filters & Sort */}
    <div style={{
      margin: "24px",
      display: "flex",
      gap: 16,
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flex:1 }}>
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
            style={{
              width: 60,
              padding: 6,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: "14px"
            }}
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
            style={{
              width: 60,
              padding: 6,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontSize: "14px"
            }}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
        <label style={{ color: "#2c3e50", fontWeight: 500 }}>
          Sort by:&nbsp;
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: "#1e40af",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
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
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #2c3e50",
              background: "#1e40af",
              color: "#fff",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>
    </div>

    {/* Table */}
    <div style={styles.jobSection}>
      <h3 style={{ color: "#1e40af", marginBottom: 20 }}>Processed Resume Results</h3>
      {tableError && <p style={{ color: "red" }}>{tableError}</p>}
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          // borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
        }}>
          <thead style={{ backgroundColor: "#1e40af ", color: "#fff" }}>
            <tr>
              {headers.map((h, i) => (
                <th key={h} style={{
                  padding: 12,
                  textAlign: "left",
                  borderBottom: "2px solid #ddd",
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
                <td style={{ padding: 10, fontSize: "14px", color: "#2c3e50" }}>{row.filename}</td>
                <td style={{ padding: 10 }}>
                  <div style={{
                    position: "relative",
                    background: "#e0e0e0",
                    borderRadius: 10,
                    overflow: "hidden",
                    height: 20,
                    width: 100
                  }}>
                    <div style={{
                      width: `${row.score || 0}%`,
                      background: row.score >= 75 ? "#27ae60" : row.score >= 50 ? "#f39c12" : "#e74c3c",
                      height: "100%"
                    }} />
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2c3e50",
                      fontWeight: "bold"
                    }}>
                      {row.score}%
                    </div>
                  </div>
                </td>
                <td style={{ padding: 10, fontSize: "14px", color: "#2c3e50", whiteSpace: "pre-wrap" }}>
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
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginTop: 20
      }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid #2c3e50",
            background: "#2c3e50",
            color: "white",
            cursor: page === 1 ? "not-allowed" : "pointer"
          }}
        >
          Previous
        </button>
        <span style={{ alignSelf: "center", color: "#2c3e50" }}>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid #2c3e50",
            background: "#2c3e50",
            color: "white",
            cursor: page === totalPages ? "not-allowed" : "pointer"
          }}
        >
          Next
        </button>
      </div>
    </div>
  </>
)}


</div>

<button style={styles.floatingButton}>💬</button>
    </div>
  );
};

export default HRPortalDashboard;




