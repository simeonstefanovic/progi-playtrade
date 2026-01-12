import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navigation from "./components/navigation.jsx";
import PrivateRoute from "./components/privateroute.jsx";
import PublicRoute from "./components/publicroute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import AddGamePage from "./pages/add.jsx";

import EditProfile from "./pages/EditProfile.jsx";
import Games from "./pages/Games.jsx";
import EditPhoto from "./pages/EditPhoto.jsx";

import "./pages/Profile.css";

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container-fluid">
        <Routes>
          {/* Main Home Route */}
          <Route path="/" element={<Home />} />

          {/* VIEW ALL GAMES ROUTE */}
          <Route path="/games" element={<Games />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/logout"
            element={
              <PrivateRoute>
                <Login />
              </PrivateRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* EDIT PROFILE ROUTE (Private because you must be logged in to edit) */}
          <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />

          <Route
            path="/add-game"
            element={
              <PrivateRoute>
                <AddGamePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-photo"
            element={
              <PrivateRoute>
                <EditPhoto />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;