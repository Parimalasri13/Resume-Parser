

const Styles = {
  container: {
    backgroundColor: "#0f172a", // dark slate
    padding: "24px",
    fontFamily: "Arial, sans-serif",
    color: "#e5e7eb", // light gray text
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
    backgroundColor: "#1e293b", // dark card
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    padding: "16px",
    color: "#f1f5f9", // card content
  },
  cardText: {
    color: "#cbd5e1", // lighter slate
    fontSize: "14px",
  },
  cardValue: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#ffffff",
  },
  smallNote: {
    fontSize: "12px",
    color: "#94a3b8", // slate
  },
  uploadSection: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    marginBottom: "32px",
    color: "#e2e8f0",
  },
  dashedBox: {
    border: "2px dashed #475569",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    color: "#cbd5e1",
  },
  floatingButton: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
    color: "#ffffff",
    padding: "12px",
    borderRadius: "9999px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
  jobSection: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    padding: "24px",
    marginBottom: "32px",
    color: "#e2e8f0",
  },
  jobTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#4ade80", // green-400
  },
  jobDesc: {
    color: "#cbd5e1",
    fontSize: "14px",
    marginBottom: "12px",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #475569",
    marginBottom: "16px",
    resize: "vertical",
    boxSizing: "border-box",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    outline: "none",
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
    color: "#6366f1", // indigo-300
  },
  progressBar: {
    width: "100%",
    height: "30px",
    backgroundColor: "#334155",
    borderRadius: "25px",
    overflow: "hidden",
    border: "2px solid #64748b",
  },
  fill: {
    height: "100%",
    background: "linear-gradient(to right, #6366f1, #c084fc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontWeight: "bold",
    transition: "width 0.4s ease-in-out",
  },
  toggleContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#e2e8f0",
    
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
    background: "linear-gradient(to right, rgb(141, 143, 224), rgb(204, 163, 245))",
    color: "white",
    fontSize: 16,
  },
  transcriptBox: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    color: "#e2e8f0",
  },
   jobSection: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    padding: 24,
    marginBottom: 32,
    color: "#e2e8f0",
  },
  jobHeading: {
    color: "#38bdf8", // cyan-400
    marginBottom: 20,
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  thead: {
    backgroundColor: "#1e40af",
    color: "#ffffff",
  },
  th: (index, total) => ({
    padding: 12,
    textAlign: "left",
    borderBottom: "2px solid #334155",
    ...(index === 0 && { borderTopLeftRadius: 12 }),
    ...(index === total - 1 && { borderTopRightRadius: 12 }),
  }),
  trEven: {
    backgroundColor: "#1e293b",
  },
  trOdd: {
    backgroundColor: "#0f172a",
  },
  td: {
    padding: 10,
    fontSize: "14px",
    color: "#e2e8f0",
    whiteSpace: "pre-wrap",
  },
  fileNameCell: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#e2e8f0",
  },
  downloadButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    margin: 0,
    color: "#38bdf8",
  },
  scoreBarWrapper: {
    position: "relative",
    background: "#334155",
    borderRadius: 10,
    overflow: "hidden",
    height: 20,
    width: 100,
  },
  scoreFill: (score) => ({
    width: `${score || 0}%`,
    height: "100%",
    background:
      score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444",
  }),
  scoreText: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f1f5f9",
    fontWeight: "bold",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  paginationButton: (disabled) => ({
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid #64748b",
    background: "#1e293b",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  }),
  paginationInfo: {
    alignSelf: "center",
    color: "#cbd5e1",
  },
  candidateHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  backgroundColor: "#1e293b", // dark background
},

candidateTitle: {
  fontSize: "20px",
  fontWeight: "bold",
  color: "white",
},

candidateControls: {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  
  
},

searchInput: {
  padding: "10px 12px",
  borderRadius: "8px",
  fontSize: "14px",
  minWidth: "200px",
  border: "1px solid #64748b",
  background: "#1e293b",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
 
  outline: "none",
},

csvDownloadButton: {
  background: "linear-gradient(to right, #34d399, #10b981)",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: "8px",
  
  fontWeight: "600",
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
},
filterSortContainer: {
  margin: 24,
  display: "flex",
  gap: 16,
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

filterControls: {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flex: 1,
},

sortControls: {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flex: 1,
  justifyContent: "flex-end",
},

label: {
  color: "#e2e8f0", // light text for dark background
  fontWeight: 500,
  
  
  
},

input: {
  width: 60,
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #64748b",
  background: "#1e293b",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "14px",
  
  outline: "none",
},

select: {
  padding: "6px 12px",
  borderRadius: 6,
  background: "#1e293b",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "14px",
  border: "1px solid #64748b",
  outline: "none",
},
resumeHeading: {
  color: "#f1f5f9", // sky blue for dark mode
  marginBottom: 20,
},

errorText: {
  color: "#ef4444",
},

tableWrapper: {
  overflowX: "auto",
},

table: {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
},

tableHead: {
  backgroundColor: "#1e3a8a", // deep blue
  color: "#fff",
},

tableHeader: (i, length) => ({
  padding: 12,
  textAlign: "left",
  borderBottom: "2px solid #374151",
  borderTopLeftRadius: i === 0 ? 12 : 0,
  borderTopRightRadius: i === length - 1 ? 12 : 0,
}),

tableRowEven: {
  backgroundColor: "#1f2937",
},

tableRowOdd: {
  backgroundColor: "#111827",
},

filenameCell: {
  padding: 10,
  fontSize: "14px",
  color: "#f3f4f6",
  display: "flex",
  alignItems: "center",
  gap: 8,
},

downloadButton: {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  margin: 0,
  color: "#60a5fa",
},

scoreCell: {
  padding: 10,
},

scoreBarWrapper: {
  position: "relative",
  background: "#374151",
  borderRadius: 10,
  overflow: "hidden",
  height: 20,
  width: 100,
},

scoreFillBase: {
  height: "100%",
},

scoreText: {
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#f9fafb",
  fontWeight: "bold",
},

remarksCell: {
  padding: 10,
  fontSize: "14px",
  color: "#d1d5db",
  whiteSpace: "pre-wrap",
},

paginationWrapper: {
  display: "flex",
  justifyContent: "center",
  gap: 8,
  marginTop: 20,
},

paginationButton: (disabled) => ({
  padding: "6px 12px",
  borderRadius: 4,
  border: "1px solid #94a3b8",
  background: "#334155",
  color: "white",
  cursor: disabled ? "not-allowed" : "pointer",
}),

paginationInfo: {
  alignSelf: "center",
  color: "#f9fafb",
},


};


export default Styles;