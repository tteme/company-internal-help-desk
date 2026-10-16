import { useState } from "react";
import { Link } from "react-router-dom";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { requestPasswordReset } from "../../services/auth.service";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await requestPasswordReset(email);
      setMessage(
        response.message ||
          "If an eligible account exists for that email, you will receive a password reset link.",
      );
      setEmail("");
    } catch (err) {
      setError(
        err.message || "Unable to process your request. Please try again.",
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
            Forgot your password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Enter your work email address. If your account is eligible, we will
            send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email"
            name="email"
            label="Work email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            {isLoading ? "Sending request..." : "Send reset link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Remember your password?{" "}
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

export default ForgotPassword;
