import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#ffffff" : "#9ca3af",
    textDecoration: "none",
    padding: "10px 16px",
    margin: "0 4px",
    borderRadius: "8px",
    backgroundColor: location.pathname === path ? "#1e3a8a" : "transparent",
    transition: "all 0.3s ease",
    fontWeight: 500,
    fontSize: "14px",
  });

  return (
    <nav
      style={{
        backgroundColor: "#0f172a", // dark navy
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "Segoe UI, sans-serif",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
        borderBottom: "1px solid #1e293b",
      }}
    >
      <h2 style={{ color: "#1e40af", margin: 0, fontSize: "24px" }}>HR Portal</h2>
      <div>
        <Link to="/" style={linkStyle("/")}>Dashboard</Link>
        <Link to="/resumes" style={linkStyle("/resumes")}>Resumes</Link>
        <Link to='/results' style={linkStyle('/results')}>Results</Link>
      </div>
    </nav>
  );
};

export default Navbar;
