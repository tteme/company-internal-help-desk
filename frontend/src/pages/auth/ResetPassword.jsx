import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { resetPassword } from "../../services/auth.service";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("The password reset link is missing its token.");
      return;
    }

    if (password.length < 8 || password.length > 100) {
      setError("Password must be between 8 and 100 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(token, password, confirmPassword);

      setMessage(response.message || "Your password has been reset.");

      setPassword("");
      setConfirmPassword("");

      // Allow the user to read the success message before navigating.
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setError(
        err.message || "Unable to reset your password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-8 text-center">
          <img
            src="/digafLogo.svg"
            alt="Digaf Microfinance"
            className="mx-auto mb-6 h-12 w-auto object-contain"
          />

          <p className="mb-2 text-sm font-semibold text-accent">
            ACCOUNT RECOVERY
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-text">
            Set a new password
          </h1>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Choose a new password for your Digaf Help Desk account.
          </p>
        </div>

        {!token ? (
          <div className="space-y-5">
            <div
              className="rounded-md border border-danger/20 bg-danger-light px-3 py-3 text-sm text-danger"
              role="alert"
            >
              The password reset link is missing its token. Request a new link
              to continue.
            </div>

            <Link
              to="/forgot-password"
              className="block text-center text-sm font-semibold text-primary hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="password"
              name="password"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your new password again"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            {message && (
              <div
                className="rounded-md border border-success/20 bg-success-light px-3 py-3 text-sm text-text"
                role="status"
              >
                {message}
              </div>
            )}

            {error && (
              <div
                className="rounded-md border border-danger/20 bg-danger-light px-3 py-3 text-sm text-danger"
                role="alert"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="accent"
              className="w-full py-2.5"
              disabled={isLoading}
            >
              {isLoading ? "Resetting password..." : "Reset password"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-text-muted">
          Digaf Microfinance · Access Beyond Limits
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;
