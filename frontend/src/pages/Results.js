
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaDownload, FaChevronDown, FaChevronUp } from "react-icons/fa";
import fileDownload from "js-file-download";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListJobDescriptionResults = () => {
  const [rankings, setRankings] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [expandedJDIndex, setExpandedJDIndex] = useState(null); // For "Read more"
  const [loading, setLoading] = useState(true);
  const BASE_URL = process.env.REACT_APP_SERVER_URL;

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/get_ranking_results`);
        setRankings(res.data);
      } catch (err) {
        console.error("Failed to fetch rankings", err);
        toast.error(`Failed to fetch JD results. ${err}`);
      } finally {
        setLoading(false); // stop loader
      }
    };
    fetchRankings();
  }, []);

  const handleDownload = async (resumeId, filename = "resume.pdf") => {
    try {
      const res = await axios.get(`${BASE_URL}/download_resume/${resumeId}`, {
        responseType: "blob",
      });
      fileDownload(res.data, filename);
    } catch (err) {
      console.error("Download failed", err);
      toast.error(`Failed to download resume. ${err}`);
    }
  };

  const toggle = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const toggleJD = (index) => {
    setExpandedJDIndex((prev) => (prev === index ? null : index));
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column", // stack vertically
          justifyContent: "center",
          alignItems: "center",
          background: "#0f172a",
          color: "#9ca3af",
        }}
      >
        <div
          className="spinner"
          style={{
            width: 48,
            height: 48,
            border: "5px solid #d1d5db",
            borderTop: "5px solid #1e40af",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: 12, // spacing below spinner
          }}
        />
        <p style={{ fontSize: 18 }}>Fetching all the job description results ...</p>
    
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );    
  }

  return (
    <div style={{ padding: 24, backgroundColor: "#0f172a", color: "#fff", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h2 style={{ color: "#fff", marginBottom: 20 }}>📊 JD-wise Resume Results</h2>

      {rankings.length ? rankings.map((entry, index) => {
        const isJDExpanded = expandedJDIndex === index;
        const isTableExpanded = expandedIndex === index;

        return (
          <div
            key={index}
            style={{
              background: "#1e293b",
              padding: 16,
              marginBottom: 24,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(255,255,255,0.05)",
            }}
          >
            <div
              onClick={() => toggle(index)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <h3 style={{ color: "#fff" }}>📄 Job Description #{index + 1}</h3>
              {isTableExpanded ? <FaChevronUp color="#fff" /> : <FaChevronDown color="#fff" />}
            </div>

            <p style={{ fontSize: 18, color: "#ccc", marginTop: 10, marginBottom: 8 }}>
              {isJDExpanded || entry.job_description.length <= 200
                ? entry.job_description
                : entry.job_description.slice(0, 200) + "..."}
              {entry.job_description.length > 200 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleJD(index);
                  }}
                  style={{
                    color: "#4f46e5",
                    cursor: "pointer",
                    marginLeft: 8,
                    fontSize: 14,
                  }}
                >
                  {isJDExpanded ? "Show less" : "Read more"}
                </span>
              )}
            </p>

            <p style={{ fontSize: 13, color: "#999" }}>
              Processed {entry.count} resumes on{" "}
              {new Date(entry.created_at).toLocaleString()}
            </p>

            <div
              style={{
                maxHeight: isTableExpanded ? "1000px" : "0px",
                opacity: isTableExpanded ? 1 : 0,
                overflow: "hidden",
                transition: "all 0.4s ease",
              }}
            >
              <table
              style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 16,
              color: "#e2e8f0",
              }}
              >
            <thead>
            <tr style={{ background: "#334155" }}>
              <th style={{ padding: 10, borderRight: "1px solid #475569" }}>#</th>
              <th style={{ padding: 10, borderRight: "1px solid #475569" }}>Filename</th>
              <th style={{ padding: 10, borderRight: "1px solid #475569" }}>Remarks</th>
              <th style={{ padding: 10, borderRight: "1px solid #475569" }}>Score</th>
              <th style={{ padding: 10, borderRight: "1px solid #475569" }}>Experience</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entry.results.map((r, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "#1e293b" : "#0f172a",
                  borderBottom: "1px solid #475569",
                }}
              >
                <td style={{ padding: 10 }}>{i + 1}</td>
                <td style={{ padding: 10 }}>{r.filename}</td>
                <td style={{ padding: 10 }}>{r.remarks ?? "-"}</td>
                <td style={{ padding: 10 }}>{r.score}%</td>
                <td style={{ padding: 10 }}>{r.experience ?? "-"}</td>
                <td style={{ padding: 10 }}>
                  {r.resume_id && (
                    <button
                      onClick={() => handleDownload(r.resume_id, r.filename)}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#60a5fa",
                      }}
                      title="Download Resume"
                    >
                      <FaDownload />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
              </table>
            </div>
          </div>
        );
      }) : (
        <p style={{ color: "#777" }}>No JD results found.</p>
      )}
    </div>
  );
};

export default ListJobDescriptionResults;
