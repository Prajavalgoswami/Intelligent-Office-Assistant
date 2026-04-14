import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  employeePasswordLogin,
  employeeGoogleLogin,
} from "../../api/employee.api";

// ── Icon helpers ──────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = ({ show }: { show: boolean }) =>
  show ? (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

const AlertIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// ── Feature list shown on left panel ─────────────────────────────────────────
const features = [
  { icon: "📋", label: "Smart Task Management" },
  { icon: "💬", label: "Real-time Team Chat" },
  { icon: "📢", label: "Company Broadcasts" },
  { icon: "🎫", label: "Service Request Tracking" },
  { icon: "📁", label: "Document Center" },
  { icon: "📧", label: "Gmail Integration" },
];

export function EmployeeLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

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
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) return;
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => {
        const g = (window as unknown as { google?: { accounts: { id: { initialize: (c: object) => void; renderButton: (el: HTMLElement | null, o: object) => void } } } }).google;
        if (g) {
          g.accounts.id.initialize({ client_id: clientId, callback: handleGoogleCallback });
          g.accounts.id.renderButton(el, { theme: "outline", size: "large", width: "100%", type: "standard" });
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
      setError("Invalid credentials. Please check your username and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0b0f1a] overflow-hidden">
      {/* ── Left branding panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, white 1.5px, transparent 0)`,
            backgroundSize: "36px 36px",
          }}
        />
        {/* Orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-[orb1_14s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-blue-400/15 blur-3xl animate-[orb2_18s_ease-in-out_infinite]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-xl backdrop-blur-sm">
            <span className="text-white font-black text-base tracking-tighter">IO</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Intelligent Office</p>
            <p className="text-white/60 text-[10px] font-medium uppercase tracking-widest">Enterprise Suite</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-5">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight">
            Your smart<br />
            <span className="text-blue-200">workspace</span><br />
            awaits.
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Everything you need to stay productive, connected, and organized — all in one place.
          </p>

          {/* Feature list */}
          <ul className="grid grid-cols-1 gap-2.5 mt-6">
            {features.map((f, i) => (
              <li
                key={f.label}
                className="flex items-center gap-3 animate-[fadeSlideIn_0.5s_ease-out_both]"
                style={{ animationDelay: `${i * 80 + 200}ms` }}
              >
                <span className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-sm flex-shrink-0">
                  {f.icon}
                </span>
                <span className="text-white/90 text-sm font-semibold">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom attribution */}
        <div className="relative z-10">
          <p className="text-white/40 text-[10px] font-medium">
            © 2025 Intelligent Office Assistant. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-[pulseGlow_3s_ease-in-out_infinite]">
            <span className="text-white font-black text-sm">IO</span>
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-bold text-sm">Intelligent Office</p>
            <p className="text-slate-500 dark:text-slate-400 text-[10px]">Employee Portal</p>
          </div>
        </div>

        {/* Form card */}
        <div
          className={`w-full max-w-md transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              Welcome back 👋
            </h2>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400 leading-relaxed">
              Sign in to your employee account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div className={`transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <label htmlFor="emp-username" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <UserIcon />
                </span>
                <input
                  id="emp-username"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  className="
                    w-full rounded-xl border pl-11 pr-4 py-4 text-[1rem]
                    bg-white dark:bg-[#1e293b]
                    border-slate-300 dark:border-white/10
                    text-slate-900 dark:text-white font-medium
                    placeholder:text-slate-400 dark:placeholder:text-slate-600
                    input-focus
                    transition-all duration-200
                    shadow-sm dark:shadow-none
                  "
                />
              </div>
            </div>

            {/* Password field */}
            <div className={`transition-all duration-500 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <label htmlFor="emp-password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <LockIcon />
                </span>
                <input
                  id="emp-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="
                    w-full rounded-xl border pl-11 pr-12 py-4 text-[1rem]
                    bg-white dark:bg-[#1e293b]
                    border-slate-300 dark:border-white/10
                    text-slate-900 dark:text-white font-medium
                    placeholder:text-slate-400 dark:placeholder:text-slate-600
                    input-focus
                    transition-all duration-200
                    shadow-sm dark:shadow-none
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 animate-[scaleIn_0.25s_ease-out]">
                <span className="text-rose-500 dark:text-rose-400 mt-0.5 flex-shrink-0">
                  <AlertIcon />
                </span>
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className={`transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <button
                type="submit"
                disabled={loading}
                id="emp-login-submit"
                className="
                  btn-brand w-full rounded-xl
                  py-4 px-6
                  text-lg font-extrabold tracking-tight
                  flex items-center justify-center gap-3
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                "
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Workspace</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-50 dark:bg-[#0b0f1a] px-4 text-xs text-slate-400 dark:text-slate-600 font-medium">
                or continue with
              </span>
            </div>
          </div>

          {/* Google button */}
          <div
            id="employee-google-signin"
            className={`w-full [&>div]:!justify-center transition-all duration-500 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          />

          {/* Footer note */}
          <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-600 leading-relaxed">
            Use your admin-assigned credentials or your company Google account.
          </p>
        </div>
      </div>
    </div>
  );
}
