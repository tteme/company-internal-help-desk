import "dotenv/config";
import { DateTime } from "luxon";

import {
  calculateBusinessMinutes,
  addBusinessMinutes,
  calculateResolutionSla,
} from "./src/services/sla-calculator.service.js";

const TIME_ZONE = "Africa/Addis_Ababa";

const formatDate = (date) =>
  DateTime.fromJSDate(date).setZone(TIME_ZONE).toFormat("yyyy-MM-dd HH:mm");

const createDate = (value) =>
  DateTime.fromISO(value, {
    zone: TIME_ZONE,
  }).toJSDate();

const test = async () => {
  console.log("========================================");
  console.log("SLA CALCULATOR TEST");
  console.log("========================================");

  // --------------------------------------------------
  // TEST 1: Business minutes during normal working time
  // Monday 09:00 → Monday 11:00 = 120 minutes
  // --------------------------------------------------

  const test1Start = createDate("2026-09-07T09:00");
  const test1End = createDate("2026-09-07T11:00");

  const test1 = await calculateBusinessMinutes(test1Start, test1End);

  console.log("\nTEST 1");
  console.log("Monday 09:00 → 11:00");
  console.log(`Expected: 120 minutes`);
  console.log(`Actual:   ${test1} minutes`);

  // --------------------------------------------------
  // TEST 2: Lunch break
  // Monday 11:30 → 14:00
  //
  // 11:30 → 12:30 = 60
  // 12:30 → 13:30 = lunch
  // 13:30 → 14:00 = 30
  //
  // Total = 90 minutes
  // --------------------------------------------------

  const test2Start = createDate("2026-09-07T11:30");
  const test2End = createDate("2026-09-07T14:00");

  const test2 = await calculateBusinessMinutes(test2Start, test2End);

  console.log("\nTEST 2");
  console.log("Monday 11:30 → 14:00");
  console.log(`Expected: 90 minutes`);
  console.log(`Actual:   ${test2} minutes`);

  // --------------------------------------------------
  // TEST 3: Sunday should not count
  // Sunday 10:00 → Monday 10:00
  //
  // Sunday = 0
  // Monday 08:30 → 10:00 = 90
  //
  // Total = 90 minutes
  // --------------------------------------------------

  const test3Start = createDate("2026-09-06T10:00");
  const test3End = createDate("2026-09-07T10:00");

  const test3 = await calculateBusinessMinutes(test3Start, test3End);

  console.log("\nTEST 3");
  console.log("Sunday 10:00 → Monday 10:00");
  console.log(`Expected: 90 minutes`);
  console.log(`Actual:   ${test3} minutes`);

  // --------------------------------------------------
  // TEST 4: Add 120 working minutes
  // Monday 09:00 + 120 working minutes
  // Expected = Monday 11:00
  // --------------------------------------------------

  const test4Start = createDate("2026-09-07T09:00");

  const test4 = await addBusinessMinutes(test4Start, 120);

  console.log("\nTEST 4");
  console.log("Monday 09:00 + 120 working minutes");
  console.log(`Expected: 2026-09-07 11:00`);
  console.log(`Actual:   ${formatDate(test4)}`);

  // --------------------------------------------------
  // TEST 5: Cross lunch break
  //
  // Monday 11:30 + 90 working minutes
  //
  // 60 minutes before lunch
  // 30 minutes after lunch
  //
  // Expected = Monday 14:00
  // --------------------------------------------------

  const test5Start = createDate("2026-09-07T11:30");

  const test5 = await addBusinessMinutes(test5Start, 90);

  console.log("\nTEST 5");
  console.log("Monday 11:30 + 90 working minutes");
  console.log(`Expected: 2026-09-07 14:00`);
  console.log(`Actual:   ${formatDate(test5)}`);

  // --------------------------------------------------
  // TEST 6: Full resolution SLA
  //
  // Monday 08:30
  // + 960 working minutes
  //
  // Expected:
  // Monday = 480 minutes
  // Tuesday = 480 minutes
  // Deadline = Tuesday 17:30
  // --------------------------------------------------

  const test6Start = createDate("2026-09-07T08:30");

  const test6 = await calculateResolutionSla({
    startedAt: test6Start,
    resolutionTimeMinutes: 960,
    warningPercentage: 80,
  });

  console.log("\nTEST 6");
  console.log("Resolution SLA");
  console.log("Start: Monday 08:30");
  console.log("SLA: 960 working minutes");
  console.log("Expected deadline: Tuesday 17:30");
  console.log(`Actual deadline:   ${formatDate(test6.resolutionDueAt)}`);

  // --------------------------------------------------
  // TEST 7: SLA warning
  //
  // 960 × 80% = 768 minutes
  //
  // Monday:
  // 480 minutes
  //
  // Tuesday:
  // remaining 288 minutes
  //
  // 13:30 + 288 minutes = 18:18
  //
  // But 17:30 is the end of Tuesday.
  //
  // Therefore:
  // Tuesday remaining working time = 240
  // Wednesday remaining = 48
  //
  // Expected warning = Wednesday 09:18
  // --------------------------------------------------

  console.log("\nTEST 7");
  console.log("SLA warning at 80%");

  console.log("Expected warning: Tuesday 14:18");
  console.log(`Actual warning:   ${formatDate(test6.warningAt)}`);

  console.log("\n========================================");
  console.log("SLA CALCULATOR TEST COMPLETED");
  console.log("========================================");
};

test().catch((error) => {
  console.error("\n❌ SLA calculator test failed:");
  console.error(error);
  process.exit(1);
});
