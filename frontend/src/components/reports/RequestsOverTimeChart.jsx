import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatDateLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function RequestsOverTimeChart({ data = [] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-medium text-text">Requests Over Time</h3>

      <div className="mt-4 h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            No data for this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />

              <Tooltip labelFormatter={formatDateLabel} />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#a06af0"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default RequestsOverTimeChart;
