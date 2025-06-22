import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaDownload, FaTrash } from "react-icons/fa";
import fileDownload from "js-file-download";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_SERVER_URL;
  const PAGE_SIZE = 5;

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get_resumes`);
      const data = response.data.resumes;
      setResumes(data);
    } catch (err) {
      console.error("Error fetching resumes:", err);
      toast.error(`Error fetching resumes: ${err}`);
      setResumes([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await axios.delete(`${BASE_URL}/delete_resume/${resumeId}`);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err) {
      toast.error(`Error deleting resume: ${err}`);
    }
  };

  const handleResumeDownload = async (resumeId, filename = "resume.pdf") => {
    try {
      const response = await axios.get(`${BASE_URL}/download_resume/${resumeId}`, {
        responseType: "blob",
      });
      fileDownload(response.data, filename);
    } catch (err) {
      console.error("Download failed", err);
      toast.error(`Failed to download resume.${err}`);
    }
  };

  const paginatedResumes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return resumes.slice(start, start + PAGE_SIZE);
  }, [resumes, page]);

  const totalPages = Math.ceil(resumes.length / PAGE_SIZE);

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
        <p style={{ fontSize: 18 }}>Fetching all the resumes ...</p>
    
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
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h2 style={styles.title}>📁 All Resumes</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeadRow}>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Filename</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedResumes.length ? (
            paginatedResumes.map((resume, idx) => (
              <tr key={resume.id} style={styles.tr}>
                <td style={styles.td}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                <td style={styles.td}>{resume.filename}</td>
                <td style={styles.td}>
                  {resume.id && (
                    <button
                      onClick={() => handleResumeDownload(resume.id, resume.filename)}
                      style={styles.downloadBtn}
                      title="Download Resume"
                    >
                      <FaDownload />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(resume.id)}
                    style={styles.deleteBtn}
                    title="Delete Resume"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={styles.emptyRow}>
                No resumes found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={styles.pagination}>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          style={{
            ...styles.pageBtn,
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.5 : 1,
          }}
        >
          Prev
        </button>
        <span style={styles.pageInfo}>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          style={{
            ...styles.pageBtn,
            cursor: page === totalPages ? "not-allowed" : "pointer",
            opacity: page === totalPages ? 0.5 : 1,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 24,
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    color: "#f1f5f9",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    marginBottom: 16,
    color: "#e2e8f0",
    fontSize: 20,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeadRow: {
    background: "#1e293b",
    textAlign: "left",
  },
  th: {
    padding: 12,
    color: "white",
    fontWeight: "bold",
  },
  tr: {
    borderBottom: "1px solid #334155",
  },
  td: {
    padding: 12,
    color: "#cbd5e1",
  },
  downloadBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    marginRight: 16,
    color: "#3b82f6",
  },
  deleteBtn: {
    border: "none",
    background: "transparent",
    color: "#ef4444",
    cursor: "pointer",
  },
  emptyRow: {
    padding: 16,
    textAlign: "center",
    color: "#64748b",
  },
  pagination: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    gap: 12,
  },
  pageBtn: {
    padding: "6px 12px",
    borderRadius: 6,
    background: "#1e293b",
    border: "none",
    color: "#f1f5f9",
  },
  pageInfo: {
    alignSelf: "center",
    color: "#e2e8f0",
  },
};

export default ListResumes;
