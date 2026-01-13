import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { AuthContext } from "../components/authcontext.jsx";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ------------------- EMAIL/PASSWORD LOGIN -------------------
  function handleSubmit(e) {
    e.preventDefault();

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }

        login(data.token);
        localStorage.setItem("yourEmail", email);
        navigate("/profile");
      });
  }

  // ------------------- GOOGLE LOGIN -------------------
  async function handleGoogleSuccess(response) {
    try {
      const res = await fetch("/api/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      // Auto-login via Google OAuth
      login(data.token);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("Dogodila se greška kod Google prijave.");
    }
  }

  function handleGoogleError() {
    setError("Google prijava nije uspjela. Pokušajte ponovno.");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-brand-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img src="/logo.png" alt="Play Trade" className="mx-auto h-12 w-auto object-contain" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-900">
          Prijavite se u svoj račun
        </h2>
        <p className="mt-2 text-center text-sm text-brand-700">
          Ili{" "}
          <Link to="/signup" className="font-medium text-accent-600 hover:text-accent-700">
            kreirajte novi račun
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {/* ------------------ GOOGLE LOGIN BUTTON ------------------ */}
          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="pill"
            />
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-brand-700">
                ili se prijavite emailom
              </span>
            </div>
          </div>

          {/* ------------------ EMAIL/PASSWORD FORM ------------------ */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-700">
                Adresa e-pošte
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-600 focus:border-accent-600 sm:text-sm"
                  placeholder="primjer@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-700">
                Lozinka
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent-600 focus:border-accent-600 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-600"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Prijavi se
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
