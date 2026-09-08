import { runSlaMonitor } from "./sla-monitor.service.js";

let monitorRunning = false;

/**
 * Start the SLA monitor.
 *
 * The monitor runs once every minute.
 */
export const startSlaMonitor = () => {
  console.log("⏱️ SLA monitor scheduler started. Checking every 60 seconds.");

  const execute = async () => {
    // Prevent overlapping executions in the same
    // Node.js process.
    if (monitorRunning) {
      console.log(
        "⏳ Previous SLA monitor cycle is still running. Skipping this cycle.",
      );
      return;
    }

    monitorRunning = true;

    try {
      await runSlaMonitor();
    } catch (error) {
      console.error("❌ SLA monitor failed:", error);
    } finally {
      monitorRunning = false;
    }
  };

  // Run immediately when server starts.
  execute();

  // Then every 60 seconds.
  setInterval(execute, 60 * 1000);
};
