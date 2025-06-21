// import React from "react";
// import { Link, useLocation } from "react-router-dom";

// const Navbar = () => {
//   const location = useLocation();

//   const linkStyle = (path) => ({
//     color: location.pathname === path ? "#ffffff" : "#dfe6e9",
//     textDecoration: "none",
//     padding: "10px 20px",
//     borderRadius: "8px",
//     backgroundColor: location.pathname === path ? "#2c3e50" : "transparent",
//     transition: "background-color 0.3s",
//   });

//   return (
//     <nav
//       style={{
//         backgroundColor: "#1e272e",
//         padding: "20px 30px",
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         fontFamily: "Segoe UI, sans-serif",
//         boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//       }}
//     >
//       <h2 style={{ color: "#ffffff", margin: 0 }}>Resume Matcher</h2>
//       <div>
//         <Link to="/" style={linkStyle("/")}>
//           Home
//         </Link>
//         <Link to="/upload-resume" style={linkStyle("/upload-resume")}>
//           Upload Resume
//         </Link>
//         <Link to="/main" style={linkStyle("/main")}>
//           Dashboard
//         </Link>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#ffffff" : "#cbd5e1",
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: location.pathname === path ? "#1e40af" : "transparent",
    transition: "background-color 0.3s ease",
    fontWeight: 500,
    fontSize: "14px",
  });

  return (
    <nav
      style={{
        backgroundColor: "#ffffff",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "Segoe UI, sans-serif",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <h2 style={{ color: "#1e40af", margin: 0, fontSize: "20px" }}>HR Portal</h2>
      <div>
        {/* <Link to="/" style={linkStyle("/")}>Home</Link>
        <Link to="/upload-resume" style={linkStyle("/upload-resume")}>Upload Resume</Link> */}
        <Link to="/" style={linkStyle("/")}>Dashboard</Link>
      </div>
    </nav>
  );
};

export default Navbar;
