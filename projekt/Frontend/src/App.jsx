import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navigation from './components/navigation.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx';
import AddGamePage from './pages/add.jsx'; 

import './pages/Profile.css';

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container-fluid"> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-game" element={<AddGamePage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;


