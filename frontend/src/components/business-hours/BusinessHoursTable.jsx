import { Pencil } from "lucide-react";

const DAY_LABELS = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function formatTime(time) {
  if (!time) {
    return "—";
  }

  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minuteString} ${period}`;
}

function BusinessHoursTable({ businessHours = [], onEdit }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted">
            <tr>
              <th className="px-4 py-3 font-medium text-text-muted">Day</th>
              <th className="px-4 py-3 font-medium text-text-muted">
                Working Hours
              </th>
              <th className="px-4 py-3 font-medium text-text-muted">Break</th>
              <th className="px-4 py-3 font-medium text-text-muted">Status</th>
              <th className="px-4 py-3 font-medium text-text-muted">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {businessHours.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-text-muted"
                >
                  No business hours configured.
                </td>
              </tr>
            ) : (
              businessHours.map((day) => (
                <tr
                  key={day.day}
                  className="transition-colors hover:bg-surface-muted/50"
                >
                  {/* Day */}
                  <td className="px-4 py-3 font-medium text-text">
                    {DAY_LABELS[day.day] || day.day}
                  </td>

                  {/* Working Hours */}
                  <td className="px-4 py-3 text-text-muted">
                    {day.isWorking
                      ? `${formatTime(day.startTime)} – ${formatTime(day.endTime)}`
                      : "—"}
                  </td>

                  {/* Break */}
                  <td className="px-4 py-3 text-text-muted">
                    {day.isWorking && day.breakStartTime && day.breakEndTime
                      ? `${formatTime(day.breakStartTime)} – ${formatTime(day.breakEndTime)}`
                      : "—"}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {day.isWorking ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        Working Day
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        Non-Working Day
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(day)}
                        title="Edit business hours"
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BusinessHoursTable;
