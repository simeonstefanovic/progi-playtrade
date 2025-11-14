import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, UserPlus } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../components/authcontext.jsx";

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ------------------- EMAIL/PASSWORD SIGNUP -------------------
  function handleSubmit(e) {
    e.preventDefault();

    fetch("/api/signup", {
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

        navigate("/login");
      });
  }

  // ------------------- GOOGLE SIGNUP / LOGIN -------------------
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
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Box className="mx-auto h-12 w-auto text-indigo-600" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Kreirajte novi račun
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ili{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            se prijavite u postojeći račun
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {/* ------------------ GOOGLE SIGNUP BUTTON ------------------ */}
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
              <span className="px-2 bg-white text-gray-500">
                ili se registrirajte emailom
              </span>
            </div>
          </div>

          {/* ------------------ EMAIL/PASSWORD FORM ------------------ */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresa e-pošte
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="primjer@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Lozinka
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password-confirm"
                className="block text-sm font-medium text-gray-700"
              >
                Potvrdite lozinku
              </label>
              <div className="mt-1">
                <input
                  id="password-confirm"
                  name="password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Registriraj se
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
