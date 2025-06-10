import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home'; // You should create corresponding page components


function App() {
  return (
    <Router>
      {/* <NavBar /> */}
      <Routes>
        {/* Default route for Home page */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

      </Routes>
      {/* <Footer /> */}
    </Router>

  );
}

export default App;