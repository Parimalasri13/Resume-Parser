import React from "react";
import { Upload } from "lucide-react";

const styles = {
  container: {
    minHeight: "100vh",
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
};

const Card = ({ children }) => <div style={styles.card}>{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;

const HRPortalDashboard = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          {/* <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e40af" }}>HR Portal</h1> */}
          <p style={styles.cardText}>Intelligent Candidate Management</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={styles.cardText}>0 Total Candidates</p>
          <p style={styles.smallNote}>0 Showing</p>
        </div>
      </header>

      <div style={styles.cardGrid}>
        <Card>
          <CardContent>
            <p style={styles.cardText}>Total Resumes</p>
            <p style={styles.cardValue}>0</p>
            <p style={styles.smallNote}>Uploaded resumes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p style={styles.cardText}>Shortlisted</p>
            <p style={styles.cardValue}>0</p>
            <p style={styles.smallNote}>Matching candidates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p style={styles.cardText}>Match Rate</p>
            <p style={styles.cardValue}>0%</p>
            <p style={styles.smallNote}>Job relevance</p>
          </CardContent>
        </Card>
      </div>

      <div style={styles.uploadSection}>
        <h2 style={{ ...styles.cardValue, color: "#1e40af", fontSize: "18px" }}>Upload Resumes</h2>
        <p style={styles.cardText}>Upload PDF or DOC files to extract candidate information</p>
        <div style={styles.dashedBox}>
          <Upload style={{ margin: "0 auto", color: "#3b82f6", marginBottom: "12px" }} size={32} />
          <p style={styles.cardText}>Drop files here or click to browse</p>
        </div>
      </div>

      <div style={styles.jobSection}>
        <h2 style={styles.jobTitle}>📄 Job Description</h2>
        <p style={styles.jobDesc}>Paste the job description to intelligently match candidates</p>
        <textarea
          placeholder="Enter job description, required skills, and experience..."
          style={styles.textarea}
        />
        <button style={styles.buttonGradient}>🔍 Shortlist Candidates</button>
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

        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>👤</div>
          <p style={{ fontWeight: "600", fontSize: "16px" }}>No candidates found</p>
          <p style={styles.cardText}>Upload resumes to get started</p>
        </div>
      </div>

      <button style={styles.floatingButton}>💬</button>
    </div>
  );
};

export default HRPortalDashboard;
