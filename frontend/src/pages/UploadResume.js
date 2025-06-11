import React, { useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UploadResume() {
  const BASE_URL = process.env.REACT_APP_SERVER_URL;
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // match backend key

    try {
      setUploading(true);
      const res = await axios.post(`${BASE_URL}/upload_resume`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message);
      setSelectedFile(null);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || "Upload failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
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
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
          Upload Resume (PDF)
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={uploading}
          style={{
            display: "block",
            marginBottom: "20px",
            fontSize: "16px",
          }}
        />

        <button
          disabled={uploading}
          onClick={handleUpload}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            backgroundColor: uploading ? "#5c6d7a" : "#2c3e50",
            color: "#ffffff",
            fontSize: "16px",
            border: "none",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.5 : 1,
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {/* Image */}
        <div style={{ flex: "1 1 300px", textAlign: "center" }}>
          <img
            src="upload-resume.png"
            alt="Job illustration"
            style={{
              maxWidth: "300px",
            }}
          />
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default UploadResume;
