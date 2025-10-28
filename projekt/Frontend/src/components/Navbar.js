import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <nav style={{ padding: "1rem", backgroundColor: "#ddd" }}>
      <Link to="/">Home</Link>

      {!isLoggedIn ? (
        <>
          {" | "}
          <Link to="/login">Login</Link>
          {" | "}
          <Link to="/signup">Sign Up</Link>
        </>
      ) : (
        <>
          {" | "}
          <Link to="/profile">Profile</Link>
        </>
      )}
    </nav>
  );
}
