import { useEffect, useState, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import {
  changePassword,
  changeUsername,
  getEmployeeMe,
  type EmployeeMe,
} from "../../api/employee.api";
import { useEmployeeAuth } from "../../auth/EmployeeAuthContext";

function sanitize(raw: string) {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors  = ["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];
  const textCol = ["text-rose-500","text-orange-500","text-amber-600","text-emerald-600","text-emerald-700"];
  const darkTxt = ["dark:text-rose-400","dark:text-orange-400","dark:text-amber-400","dark:text-emerald-400","dark:text-emerald-400"];
  const idx = Math.max(0, Math.min(score - 1, 4));

  return (
    <div className="mt-2.5 space-y-1.5 animate-[fadeSlideIn_0.3s_ease-out]">
      <div className="flex gap-1">
        {[0,1,2,3,4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= idx ? colors[idx] : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-semibold ${textCol[idx]} ${darkTxt[idx]}`}>{labels[idx]}</p>
    </div>
  );
}

function EyeBtn({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5"
    >
      {show ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );
}

function AlertBanner({ type, message }: { type: "success" | "error"; message: string }) {
  if (type === "success") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 animate-[scaleIn_0.25s_ease-out]">
        <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 animate-[checkPop_0.4s_ease-out]">
          <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{message}</p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 animate-[scaleIn_0.25s_ease-out]">
      <svg className="h-4 w-4 flex-shrink-0 text-rose-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{message}</p>
    </div>
  );
}

function CollapsibleSection({
  open, onToggle, label,
}: { open: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl px-1 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
    >
      <span>{open ? "Collapse" : label}</span>
      <span className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 ${open ? "rotate-180" : ""}`}>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { refresh } = useEmployeeAuth();
  const [me, setMe] = useState<EmployeeMe | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Username form
  const [unameOpen, setUnameOpen] = useState(false);
  const [unameCurrentPw, setUnameCurrentPw] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [unameSubmitting, setUnameSubmitting] = useState(false);
  const [unameError, setUnameError] = useState<string | null>(null);
  const [unameSuccess, setUnameSuccess] = useState<string | null>(null);
  const [showUnamePw, setShowUnamePw] = useState(false);

  // Password form
  const [pwOpen, setPwOpen] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await getEmployeeMe();
        if (!cancelled) setMe(r.data);
      } catch {
        if (!cancelled) setLoadError("Could not load profile. Please try refreshing.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault();
    setUnameError(null); setUnameSuccess(null);
    const u = sanitize(newUsername);
    if (u.length < 3) { setUnameError("Username must be at least 3 characters (letters, digits, underscore)."); return; }
    setUnameSubmitting(true);
    try {
      await changeUsername({ current_password: unameCurrentPw, new_username: u });
      setUnameSuccess("Username updated successfully!");
      setUnameCurrentPw(""); setNewUsername("");
      const r = await getEmployeeMe(); setMe(r.data); await refresh();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setUnameError(typeof detail === "string" ? detail : "Could not update username.");
    } finally { setUnameSubmitting(false); }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError(null); setPwSuccess(null);
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwSubmitting(true);
    try {
      await changePassword({ old_password: oldPw, new_password: newPw });
      setPwSuccess("Password updated successfully!");
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch { setPwError("Incorrect current password or server error."); }
    finally { setPwSubmitting(false); }
  }

  const inputCls = `
    block w-full rounded-xl border px-4 py-2.5 pr-10 text-sm
    bg-white dark:bg-[#1e293b]
    border-slate-300 dark:border-white/10
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-600
    input-focus transition-all duration-200
    shadow-sm dark:shadow-none
  `;

  const initials = me
    ? (me.name || me.email || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      {/* ── Profile hero banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-xl animate-[fadeSlideIn_0.4s_ease-out_both]"
        style={{ background: "linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl font-black text-white shadow-xl backdrop-blur-sm">
            {initials}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-black text-white truncate">
              {me?.name || "Employee"}
            </h2>
            <p className="text-sm text-blue-100/80 truncate mt-0.5">
              {me?.email || "—"}
            </p>
            {me?.username && (
              <p className="text-xs text-blue-200/60 font-mono mt-0.5">@{me.username}</p>
            )}
            {me?.roles && me.roles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {me.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 border border-white/25 px-2.5 py-0.5 text-[11px] font-semibold text-white"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Load error */}
      {loadError && <AlertBanner type="error" message={loadError} />}

      {/* ── Account details ── */}
      {me && (
        <Card
          title="Account Details"
          description="Your profile information at a glance."
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          accentColor="indigo"
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Full Name",  value: me.name    || "—", mono: false },
              { label: "Email",      value: me.email   || "—", mono: false, breakAll: true },
              { label: "Username",   value: me.username ? `@${me.username}` : "—", mono: true },
              { label: "User ID",    value: me.user_id,         mono: true, small: true },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] px-4 py-3"
              >
                <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  {f.label}
                </dt>
                <dd className={`text-sm font-semibold text-slate-900 dark:text-white ${f.mono ? "font-mono" : ""} ${f.small ? "text-xs" : ""} ${f.breakAll ? "break-all" : ""}`}>
                  {f.value}
                </dd>
              </div>
            ))}

            {/* Roles row (full width) */}
            <div className="sm:col-span-2 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] px-4 py-3">
              <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Roles
              </dt>
              <dd className="flex flex-wrap gap-2">
                {me.roles?.length ? me.roles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {r}
                  </span>
                )) : <span className="text-sm text-slate-400 dark:text-slate-600">—</span>}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      {/* ── Change Username ── */}
      <Card
        title="Change Username"
        description="Update your unique login username."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
        accentColor="amber"
      >
        <CollapsibleSection
          open={unameOpen}
          onToggle={() => { setUnameOpen(!unameOpen); setUnameError(null); setUnameSuccess(null); }}
          label="Click to change username"
        />

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${unameOpen ? "mt-5 max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showUnamePw ? "text" : "password"}
                  autoComplete="current-password"
                  value={unameCurrentPw}
                  onChange={(e) => setUnameCurrentPw(e.target.value)}
                  className={inputCls}
                  placeholder="Enter current password"
                  required
                />
                <EyeBtn show={showUnamePw} onToggle={() => setShowUnamePw(!showUnamePw)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                New Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={newUsername}
                onChange={(e) => setNewUsername(sanitize(e.target.value))}
                className={`${inputCls} font-mono`}
                placeholder="e.g. jane_doe"
                minLength={3}
                maxLength={32}
                required
              />
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-600">Only lowercase letters, digits and underscores.</p>
            </div>

            {unameError   && <AlertBanner type="error"   message={unameError} />}
            {unameSuccess && <AlertBanner type="success" message={unameSuccess} />}

            <button
              type="submit"
              disabled={unameSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {unameSubmitting && <span className="h-3.5 w-3.5 rounded-full border-2 border-white/50 border-t-white animate-spin" />}
              {unameSubmitting ? "Saving…" : "Update Username"}
            </button>
          </form>
        </div>
      </Card>

      {/* ── Change Password ── */}
      <Card
        title="Change Password"
        description="Keep your account secure with a strong password."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
        accentColor="rose"
      >
        <CollapsibleSection
          open={pwOpen}
          onToggle={() => { setPwOpen(!pwOpen); setPwError(null); setPwSuccess(null); }}
          label="Click to change password"
        />

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${pwOpen ? "mt-5 max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Current Password</label>
              <div className="relative">
                <input type={showOldPw ? "text" : "password"} autoComplete="current-password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className={inputCls} placeholder="Your current password" required />
                <EyeBtn show={showOldPw} onToggle={() => setShowOldPw(!showOldPw)} />
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">New Password</label>
              <div className="relative">
                <input type={showNewPw ? "text" : "password"} autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls} placeholder="At least 8 characters" required minLength={8} />
                <EyeBtn show={showNewPw} onToggle={() => setShowNewPw(!showNewPw)} />
              </div>
              <PasswordStrengthBar password={newPw} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirmPw ? "text" : "password"} autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={inputCls} placeholder="Repeat new password" required minLength={8} />
                <EyeBtn show={showConfirmPw} onToggle={() => setShowConfirmPw(!showConfirmPw)} />
              </div>
              {confirmPw && newPw && confirmPw !== newPw && (
                <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400">✗ Passwords do not match</p>
              )}
              {confirmPw && newPw && confirmPw === newPw && confirmPw.length >= 8 && (
                <p className="mt-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">✓ Passwords match</p>
              )}
            </div>

            {pwError   && <AlertBanner type="error"   message={pwError} />}
            {pwSuccess && <AlertBanner type="success" message={pwSuccess} />}

            <button
              type="submit"
              disabled={pwSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-rose-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {pwSubmitting && <span className="h-3.5 w-3.5 rounded-full border-2 border-white/50 border-t-white animate-spin" />}
              {pwSubmitting ? "Saving…" : "Update Password"}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
