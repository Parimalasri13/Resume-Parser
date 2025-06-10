import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // You should create corresponding page components
import UploadResume from './pages/UploadResume';
import Navbar from './components/NavBar';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Default route for Home page */}
        <Route path="/" element={<Home />} />
        <Route path="/upload-resume" element={<UploadResume />} />
      </Routes>
      {/* <Footer /> */}
    </Router>

  );
}

export default App;