import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaDownload, FaTrash } from "react-icons/fa";
import fileDownload from "js-file-download"; // install js-file-download if not already
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ListResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // constants
  const BASE_URL = process.env.REACT_APP_SERVER_URL;
  const PAGE_SIZE = 5;

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get_resumes`);
      const data = response.data.resumes;
      setResumes(data);
    } catch (err) {
      toast.error(`Error fetching resumes: ${err}`);
      setResumes([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  // Fetch resumes on mount
  useEffect(() => {
    fetchResumes();
  }, []);  

  // Delete resume
  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await axios.delete(`${BASE_URL}/delete_resume/${resumeId}`);
      setResumes(prev => prev.filter(r => r.id !== resumeId));
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


  // Pagination logic
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
          background: "#f9fafb",
          color: "#4b5563",
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
    <div style={{ padding: 24 }}>
      {/* Show toast notifications */}
    <ToastContainer position="top-right" autoClose={3000} />
      <h2 style={{ marginBottom: 16, color: "#374151" }}>📁 All Resumes</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: 12 }}>#</th>
            <th style={{ padding: 12 }}>Filename</th>
            <th style={{ padding: 12 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedResumes.length ? paginatedResumes.map((resume, idx) => (
            <tr key={resume.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: 12 }}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
              <td style={{ padding: 12 }}>{resume.filename}</td>
              <td style={{ padding: 12 }}>
                {resume.id && (
                <button
                    onClick={() => handleResumeDownload(resume.id, resume.filename)}
                    style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    margin: 0,
                    color: "#2563eb",
                    marginRight: 16
                    }}
                    title="Download Resume"
                >
                    <FaDownload />
                </button>
                )}
                <button
                  onClick={() => handleDelete(resume.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#ef4444",
                    cursor: "pointer"
                  }}
                  title="Delete Resume"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={3} style={{ padding: 16, textAlign: "center", color: "#9ca3af" }}>
                No resumes found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 12 }}>
        <button
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            background: "#e5e7eb",
            border: "none",
            cursor: page === 1 ? "not-allowed" : "pointer"
          }}
        >
          Prev
        </button>
        <span style={{ alignSelf: "center" }}>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            background: "#e5e7eb",
            border: "none",
            cursor: page === totalPages ? "not-allowed" : "pointer"
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ListResumes;