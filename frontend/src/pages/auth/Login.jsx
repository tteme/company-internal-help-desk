import { useState } from "react";
import { Eye, EyeOff} from "lucide-react";
import { Link} from "react-router-dom";
import { useDispatch } from "react-redux";

import { setCredentials } from "../../store/slices/authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { login } from "../../services/auth.service";

function Login() {
  const dispatch = useDispatch();
 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await login(email, password);

      dispatch(
        setCredentials({
          user: data.data.user,
        }),
      );
    } catch (error) {
      setError(error.message || "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* LEFT SIDE — BRANDING */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex xl:p-14">
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/digafLogo.svg"
            alt="Digaf Microfinance"
            className="h-12 w-auto object-contain"
          />

          <div>
            <p className="text-lg font-semibold tracking-tight">
              Digaf Help Desk
            </p>
            <p className="text-xs text-white/60">Internal Support Portal</p>
          </div>
        </div>
        {/* Main message */}
        <div className="relative z-10 max-w-xl py-12">
          <div className="mb-6 h-1 w-16 rounded-full bg-accent" />

          <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Every request,
            <br />
            answered on time.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            Raise an issue, follow its progress and confirm the fix — with
            service-level timers keeping everyone accountable.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
              Request tracking
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
              Timely support
            </span>
          </div>
        </div>
        {/* Customer feedback link */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <Link
            to="/client-feedback"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-accent"
          >
            Customer? Share your feedback
            <span aria-hidden="true">→</span>
          </Link>

          <p className="mt-2 text-xs text-white/40">
            Your feedback helps us serve you better.
          </p>
        </div>
      </section>

      {/* RIGHT SIDE — LOGIN FORM */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}

          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <img
              src="/digafLogo.svg"
              alt="Digaf Microfinance"
              className="h-10 w-auto object-contain"
            />

          </div>

          {/* Form heading */}
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold text-accent">
              WELCOME BACK
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-text">
              Sign in
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Use your work email and password to access your account.
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-surface px-3 py-2.5 pr-11 text-sm text-text outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text focus:outline-none focus:ring-2 focus:ring-accent/30"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="rounded-md border border-danger/20 bg-danger-light px-3 py-3 text-sm text-danger"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              variant="accent"
              className="w-full py-2.5"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Mobile feedback link */}
          <div className="mt-8 border-t border-border pt-5 text-center lg:hidden">
            <Link
              to="/client-feedback"
              className="text-sm font-medium text-primary transition hover:text-accent"
            >
              Customer? Share your feedback →
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-text-muted">
            Digaf Microfinance · Access Beyond Limits
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
