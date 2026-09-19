import { useEffect, useState } from "react";

import { getRequests } from "../../services/request.service";
import StatCard from "./StatCard";
import RecentRequests from "./RecentRequests";
import SlaOverview from "./SlaOverview";

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        setIsLoading(true);
        setError("");

        const response = await getRequests();

        setRequests(response.data);
      } catch (error) {
        setError(error.message || "Failed to load requests.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRequests();
  }, []);

  const openRequests = requests.filter(
    (request) => request.status === "OPEN" || request.status === "ASSIGNED",
  ).length;

  const inProgressRequests = requests.filter(
    (request) => request.status === "IN_PROGRESS",
  ).length;

  const escalatedRequests = requests.filter(
    (request) => request.status === "ESCALATED",
  ).length;

  const resolvedRequests = requests.filter(
    (request) => request.status === "RESOLVED" || request.status === "CLOSED",
  ).length;

  const recentRequests = requests.slice(0, 5);

  if (isLoading) {
    return (
      <section>
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Overview of help desk activity.
          </p>
        </header>

        <p className="mt-6 text-sm text-text-secondary">Loading dashboard...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Overview of help desk activity.
          </p>
        </header>

        <p
          role="alert"
          className="mt-6 rounded-md border border-danger bg-danger-light p-4 text-sm text-danger"
        >
          {error}
        </p>
      </section>
    );
  }

  const now = new Date();

  const slaSummary = requests.reduce(
    (summary, request) => {
      if (!request.sla) {
        return summary;
      }

      const inactiveStatuses = ["RESOLVED", "CLOSED", "REJECTED"];

      if (inactiveStatuses.includes(request.status)) {
        return summary;
      }

      if (request.sla.resolutionBreached) {
        summary.breached += 1;
        return summary;
      }

      if (request.sla.warningAt && new Date(request.sla.warningAt) <= now) {
        summary.warning += 1;
        return summary;
      }

      summary.onTrack += 1;

      return summary;
    },
    {
      onTrack: 0,
      warning: 0,
      breached: 0,
    },
  );

  return (
    <section>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Overview of help desk activity.
        </p>
      </header>

      <section
        aria-label="Help desk statistics"
        className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
      >
        <StatCard
          label="Open Requests"
          value={openRequests}
          description="Currently awaiting action"
          indicator="bg-info"
        />

        <StatCard
          label="In Progress"
          value={inProgressRequests}
          description="Currently being handled"
          indicator="bg-accent"
        />

        <StatCard
          label="Escalated"
          value={escalatedRequests}
          description="Requires department head attention"
          indicator="bg-danger"
        />

        <StatCard
          label="Resolved"
          value={resolvedRequests}
          description="Resolved or closed"
          indicator="bg-success"
        />
      </section>

      <section
        aria-label="Dashboard details"
        className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
      >
        <RecentRequests requests={recentRequests} />

        <SlaOverview summary={slaSummary} />
      </section>
    </section>
  );
}

export default Dashboard;
