import "dotenv/config";
import app from "./src/app.js";
import { startSlaMonitor } from "./src/services/sla-monitor.scheduler.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  startSlaMonitor();
});
