import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { login } from "../../services/auth.service";

function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
        {/* Branding */}
        <header className="border-b border-border pb-5">
          <img
            src="/digafLogo.svg"
            alt="Digaf Microfinance"
            className="h-9 w-auto"
          />
        </header>

        {/* Sign in */}
        <section className="pt-5">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              Sign in
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Sign in to your Digaf Help Desk account.
            </p>
          </header>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="accent"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </section>
      </section>
    </main>
  );
}

export default Login;
