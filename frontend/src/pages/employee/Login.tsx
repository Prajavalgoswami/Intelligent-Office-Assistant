import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  employeePasswordLogin,
  employeeGoogleLogin,
} from "../../api/employee.api";

export function EmployeeLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleCallback = useCallback(
    async (response: { credential: string }) => {
      setError(null);
      setLoading(true);
      try {
        const res = await employeeGoogleLogin({ id_token: response.credential });
        localStorage.setItem("access_token", res.data.access_token);
        navigate("/app");
      } catch {
        setError("Google sign-in failed. Use your company email or try again.");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const el = document.getElementById("employee-google-signin");
    if (!el) return;

    const loadGoogleScript = () => {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]'))
        return;
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => {
        const g = (window as unknown as { google?: { accounts: { id: { initialize: (c: object) => void; renderButton: (el: HTMLElement | null, o: object) => void } } } }).google;
        if (g) {
          g.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback,
          });
          g.accounts.id.renderButton(el, {
            theme: "outline",
            size: "large",
            width: "100%",
            type: "standard",
          });
        }
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, [handleGoogleCallback]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await employeePasswordLogin({ username, password });
      localStorage.setItem("access_token", res.data.access_token);
      navigate("/app");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 shadow-xl backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <span className="text-lg font-bold text-white">IO</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Employee Login</h1>
            <p className="text-sm text-slate-400">Intelligent Office Assistant</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="emp-username"
              className="block text-xs font-medium text-slate-400 mb-2"
            >
              Username
            </label>
            <input
              id="emp-username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="emp-password"
              className="block text-xs font-medium text-slate-400 mb-2"
            >
              Password
            </label>
            <input
              id="emp-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign in with username"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-800/50 px-2 text-xs text-slate-500">
              Or continue with
            </span>
          </div>
        </div>

        <div id="employee-google-signin" className="w-full [&>div]:!justify-center" />

        <p className="mt-6 text-center text-xs text-slate-500">
          Use the credentials provided by your administrator or sign in with
          your company Google account.
        </p>
      </div>
    </div>
  );
}
