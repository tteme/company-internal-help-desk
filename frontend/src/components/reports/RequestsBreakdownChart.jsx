import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function RequestsBreakdownChart({ title, data = [], dataKey, nameKey }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-medium text-text">{title}</h3>

      <div className="mt-4 h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            No data for this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />

              <YAxis
                type="category"
                dataKey={nameKey}
                width={110}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />

              <Tooltip />

              <Bar dataKey={dataKey} fill="#a06af0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default RequestsBreakdownChart;
