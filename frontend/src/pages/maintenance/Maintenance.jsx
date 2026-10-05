import { Wrench } from "lucide-react";

function Maintenance() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section
        aria-labelledby="maintenance-title"
        className="w-full max-w-lg rounded-lg border border-border bg-surface p-8 text-center shadow-sm"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
          <Wrench
            size={26}
            strokeWidth={1.8}
            className="text-text-secondary"
            aria-hidden="true"
          />
        </div>

        <h1
          id="maintenance-title"
          className="mt-5 text-xl font-semibold text-text"
        >
          System Maintenance
        </h1>

        <p className="mt-3 text-sm leading-6 text-text-secondary">
          The Digaf Help Desk is temporarily unavailable while system
          maintenance is being performed.
        </p>

        <p className="mt-2 text-sm text-text-muted">Please try again later.</p>
      </section>
    </main>
  );
}

export default Maintenance;
