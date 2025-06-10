// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
// import './styles/NavBar.css';

const NavBar = () => {
    return (
        <header>
            <img src="./assets/logo.jpg" alt="AyurBot Logo" />
            <nav>
                <ul>
                    <li><Link to="/home">Home</Link></li>  {/* Use Link for routing */}
                    {/* <li><Link to="/myths">Myths</Link></li>
                    <li><Link to="/geetha">Geetha</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/chat_dynamic">Chat</Link></li> */}
                </ul>
            </nav>
        </header>
    );
};

export default NavBar;