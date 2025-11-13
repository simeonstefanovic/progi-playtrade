import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './components/authcontext.jsx';
import Navigation from './components/navigation.jsx';
import PrivateRoute from './components/privateroute.jsx';
import PublicRoute from './components/publicroute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Profile from './pages/Profile.jsx';
import AddGamePage from './pages/add.jsx'; 

import './pages/Profile.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <div className="container-fluid"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute> } />
            <Route path="/logout" element={<PrivateRoute> <Login /> </PrivateRoute> } />
            <Route path="/signup" element={<PublicRoute> <Signup /> </PublicRoute> } />
            <Route path="/profile" element={<PrivateRoute> <Profile /> </PrivateRoute> } />
            <Route path="/add-game" element={<PrivateRoute> <AddGamePage /> </PrivateRoute> } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;


