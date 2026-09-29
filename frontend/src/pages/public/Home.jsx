import { ArrowRight, LogIn, MessageSquareText } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <img
              src="/digafLogo.svg"
              alt="Digaf Microfinance"
              className="h-9 w-auto"
            />

          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MessageSquareText
              className="h-8 w-8 text-primary"
              aria-hidden="true"
            />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Digaf Microfinance
          </p>

          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Welcome to Digaf Micro Credit Service Provider S.C
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            We value your experience. If you have a suggestion, concern, or
            feedback about our services, we would love to hear from you.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/client-feedback")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
            >
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
              Send Feedback
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mt-10 text-sm text-text-muted">
            Your feedback helps us improve our services.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Home;
