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
import Admin from "./pages/Admin.jsx";

import EditProfile from "./pages/EditProfile.jsx";
import Games from "./pages/Games.jsx";
import EditPhoto from "./pages/EditPhoto.jsx";
import EditMap from "./pages/EditMap.jsx";

import "./pages/Profile.css";

function App() {
  return (
    <Router>
      <Navigation />
      <div className="container-fluid">
        <Routes>
          <Route path="/" element={<Home />} />

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

          <Route
            path="/edit-map"
            element={
              <PrivateRoute>
                <EditMap />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;