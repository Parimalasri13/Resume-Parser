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
  const BASE_URL = process.env.REACT_APP_SERVER_URL;

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/get_ranking_results`);
        setRankings(res.data);
      } catch (err) {
        console.error("Failed to fetch rankings", err);
        toast.error("Failed to fetch JD results.");
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
      toast.error("Failed to download resume.");
    }
  };

  const toggle = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const toggleJD = (index) => {
    setExpandedJDIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div style={{ padding: 24 }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 style={{ color: "#374151", marginBottom: 20 }}>📊 JD-wise Resume Results</h2>

      {rankings.length ? rankings.map((entry, index) => {
        const isJDExpanded = expandedJDIndex === index;
        const isTableExpanded = expandedIndex === index;

        return (
          <div
            key={index}
            style={{
              background: "#fff",
              padding: 16,
              marginBottom: 24,
              borderRadius: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            {/* Toggle Header */}
            <div
              onClick={() => toggle(index)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <h3 style={{ color: "#1f2937" }}>📄 Job Description #{index + 1}</h3>
              {isTableExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {/* JD Preview */}
            <p style={{ fontSize: 18, color: "#6b7280", marginTop: 10, marginBottom: 8 }}>
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
                    color: "#6366f1",
                    cursor: "pointer",
                    marginLeft: 8,
                    fontSize: 14,
                  }}
                >
                  {isJDExpanded ? "Show less" : "Read more"}
                </span>
              )}
            </p>

            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              Processed {entry.count} resumes on{" "}
              {new Date(entry.created_at).toLocaleString()}
            </p>

            {/* Expandable Table */}
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
                }}
              >
                <thead>
                  <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                    <th style={{ padding: 10, borderRight: "1px solid #e5e7eb" }}>#</th>
                    <th style={{ padding: 10, borderRight: "1px solid #e5e7eb" }}>Filename</th>
                    <th style={{ padding: 10, borderRight: "1px solid #e5e7eb" }}>Remarks</th>
                    <th style={{ padding: 10, borderRight: "1px solid #e5e7eb" }}>Score</th>
                    <th style={{ padding: 10, borderRight: "1px solid #e5e7eb" }}>Experience</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.results.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
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
                              color: "#2563eb",
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
        <p style={{ color: "#9ca3af" }}>No JD results found.</p>
      )}
    </div>
  );
};

export default ListJobDescriptionResults;
