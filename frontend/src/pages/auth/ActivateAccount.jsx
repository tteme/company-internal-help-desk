import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../services/api";

function ActivateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("Invalid activation link.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8 || password.length > 100) {
      setError("Password must be between 8 and 100 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/users/activate", {
        method: "POST",
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err?.message || "Failed to activate your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUCCESS STATE
  // ============================================================

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <img
            src="/digafLogo.svg"
            alt="Digaf Microfinance"
            className="mx-auto mb-8 h-10 w-auto"
          />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <LockKeyhole aria-hidden="true" className="h-7 w-7 text-accent" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-text">
            Account Activated
          </h1>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Your DIGAF Help Desk account has been activated successfully. You
            can now sign in using your email and new password.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-7 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // ACTIVATION FORM
  // ============================================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="text-center">
          <img
            src="/digafLogo.svg"
            alt="Digaf Microfinance"
            className="mx-auto h-10 w-auto"
          />

          <h1 className="mt-7 text-2xl font-semibold tracking-tight text-text">
            Activate Your Account
          </h1>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Create a password to activate your DIGAF Internal Help Desk account.
          </p>
        </div>

        {!token && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Invalid activation link. Please use the activation link sent to your
            email.
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {/* NEW PASSWORD */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-text"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={!token || loading}
                autoComplete="new-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-11 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                disabled={!token || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text disabled:cursor-not-allowed"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-text-muted">
              Password must be at least 8 characters.
            </p>
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-text"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={!token || loading}
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-11 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                disabled={!token || loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text disabled:cursor-not-allowed"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={!token || loading}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Activating Account..." : "Activate Account"}
          </button>
        </form>

        <div className="mt-7 border-t border-border pt-5 text-center">
          <p className="text-xs text-text-muted">
            This activation link is valid for 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ActivateAccount;
