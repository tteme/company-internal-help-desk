import { ArrowRight, LogIn, MessageSquareText } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left promotional panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex xl:p-14">
        {/* Decorative circles */}
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full border border-white/10" />

        <header className="relative z-10 flex items-center gap-3">
          <img
            src="/digafLogo.svg"
            alt="Digaf Microfinance"
            className="h-10 w-auto"
          />
          <div>
            <p className="text-lg font-semibold">Digaf Help Desk</p>
            <p className="text-xs text-white/70">Access Beyond Limits</p>
          </div>
        </header>

        <div className="relative z-10 max-w-lg py-12">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <MessageSquareText className="h-6 w-6 text-accent" />
          </div>

          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Every voice matters.
            <br />
            Every request counts.
          </h1>

          <p className="mt-5 max-w-md text-base leading-7 text-white/75">
            Your experience helps us improve. Share your feedback, raise
            concerns, and help us deliver better services.
          </p>
        </div>

        <p className="relative z-10 text-sm text-white/60">
          Digaf Micro Credit Service Provider S.C
        </p>
      </section>

      {/* Right content panel */}
      <section className="flex min-h-screen flex-col justify-between px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <img
            src="/digafLogo.svg"
            alt="Digaf Microfinance"
            className="h-9 w-auto lg:hidden"
          />

          <span className="hidden text-sm font-medium text-text-secondary lg:block">
            Customer Feedback Portal
          </span>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Login
          </button>
        </header>

        {/* Main content */}
        <div className="mx-auto w-full max-w-lg py-16 lg:py-12">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <MessageSquareText
              className="h-7 w-7 text-accent"
              aria-hidden="true"
            />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            We value your experience
          </p>

          <h2 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
            How can we serve you better?
          </h2>

          <p className="mt-5 text-base leading-7 text-text-secondary sm:text-lg">
            Have a suggestion, concern, or feedback about our services? We would
            love to hear from you. Your voice helps us improve the experience we
            provide.
          </p>

          <button
            type="button"
            onClick={() => navigate("/client-feedback")}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 sm:w-auto"
          >
            <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            Send Feedback
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <p className="mt-6 text-sm text-text-muted">
            Your feedback helps us improve our services.
          </p>
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-5 text-sm text-text-muted">
          Digaf Microfinance · Access Beyond Limits
        </footer>
      </section>
    </main>
  );
}

export default Home;
