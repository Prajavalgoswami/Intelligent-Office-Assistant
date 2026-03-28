import { useEffect, useState, type FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import {
  changePassword,
  changeUsername,
  getEmployeeMe,
  type EmployeeMe,
} from "../../api/employee.api";
import { useEmployeeAuth } from "../../auth/EmployeeAuthContext";

function sanitizeUsernameInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

export function ProfilePage() {
  const { refresh } = useEmployeeAuth();
  const [me, setMe] = useState<EmployeeMe | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [unameCurrentPw, setUnameCurrentPw] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [unameSubmitting, setUnameSubmitting] = useState(false);
  const [unameError, setUnameError] = useState<string | null>(null);
  const [unameSuccess, setUnameSuccess] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getEmployeeMe();
        if (!cancelled) setMe(res.data);
      } catch {
        if (!cancelled) setLoadError("Could not load profile.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUsernameSubmit(e: FormEvent) {
    e.preventDefault();
    setUnameError(null);
    setUnameSuccess(null);
    const u = sanitizeUsernameInput(newUsername);
    if (u.length < 3) {
      setUnameError("Username must be at least 3 characters (letters, digits, underscore).");
      return;
    }
    setUnameSubmitting(true);
    try {
      await changeUsername({
        current_password: unameCurrentPw,
        new_username: u,
      });
      setUnameSuccess("Username updated.");
      setUnameCurrentPw("");
      setNewUsername("");
      const res = await getEmployeeMe();
      setMe(res.data);
      await refresh();
    } catch (err: unknown) {
      const detail =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail;
      setUnameError(
        typeof detail === "string" ? detail : "Could not update username.",
      );
    } finally {
      setUnameSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwSubmitting(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword });
      setPwSuccess("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPw("");
    } catch {
      setPwError("Could not update password. Check your current password.");
    } finally {
      setPwSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card
        title="Profile"
        description="Your account details and security settings."
      >
        {loadError && (
          <p className="text-sm text-rose-600 mb-4">{loadError}</p>
        )}
        {me && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Name
              </dt>
              <dd className="text-slate-900 dark:text-slate-100">
                {me.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Email
              </dt>
              <dd className="text-slate-900 dark:text-slate-100 break-all">
                {me.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Username
              </dt>
              <dd className="text-slate-900 dark:text-slate-100 font-mono">
                {me.username ? `@${me.username}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                User ID
              </dt>
              <dd className="text-slate-600 dark:text-slate-300 font-mono text-xs break-all">
                {me.user_id}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Roles
              </dt>
              <dd className="text-slate-900 dark:text-slate-100">
                {me.roles?.length ? me.roles.join(", ") : "—"}
              </dd>
            </div>
          </dl>
        )}
      </Card>

      <Card
        title="Change username"
        description="Enter your current password and choose a new unique username (3–32 characters: lowercase letters, digits, underscores)."
      >
        <form onSubmit={handleUsernameSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Current password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={unameCurrentPw}
              onChange={(e) => setUnameCurrentPw(e.target.value)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              New username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={newUsername}
              onChange={(e) => setNewUsername(sanitizeUsernameInput(e.target.value))}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. jane_doe"
              minLength={3}
              maxLength={32}
              required
            />
          </div>
          {unameError && <p className="text-xs text-rose-600">{unameError}</p>}
          {unameSuccess && (
            <p className="text-xs text-emerald-600">{unameSuccess}</p>
          )}
          <button
            type="submit"
            disabled={unameSubmitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {unameSubmitting ? "Saving…" : "Update username"}
          </button>
        </form>
      </Card>

      <Card
        title="Change password"
        description="Use your current password to set a new one."
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Current password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              New password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              required
              minLength={8}
            />
          </div>
          {pwError && <p className="text-xs text-rose-600">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-emerald-600">{pwSuccess}</p>}
          <button
            type="submit"
            disabled={pwSubmitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {pwSubmitting ? "Saving…" : "Update password"}
          </button>
        </form>
      </Card>
    </div>
  );
}
