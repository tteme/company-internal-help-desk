import prisma from "../config/database.js";

// ============================================================
// BUSINESS HOURS SERVICE
// ============================================================

/**
 * Get all business hours.
 */
export const getBusinessHours = async () => {
  const businessHours = await prisma.businessHours.findMany();

  const dayOrder = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  return businessHours.sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day),
  );
};
/**
 * Get business hours for a specific day.
 */
export const getBusinessHoursByDay = async (day) => {
  return prisma.businessHours.findUnique({
    where: {
      day,
    },
  });
};

/**
 * Update business hours for a specific day.
 */
export const updateBusinessHours = async (day, data) => {
  // ==========================================================
  // 1. CHECK THAT THE DAY EXISTS
  // ==========================================================

  const existingHours = await prisma.businessHours.findUnique({
    where: {
      day,
    },
  });

  if (!existingHours) {
    throw new Error("Business hours configuration not found.");
  }

  // ==========================================================
  // 2. NORMALIZE THE UPDATE DATA
  // ==========================================================

  const updateData = {};

  if (data.startTime !== undefined) {
    updateData.startTime = data.startTime;
  }

  if (data.breakStartTime !== undefined) {
    updateData.breakStartTime = data.breakStartTime;
  }

  if (data.breakEndTime !== undefined) {
    updateData.breakEndTime = data.breakEndTime;
  }

  if (data.endTime !== undefined) {
    updateData.endTime = data.endTime;
  }

  if (data.isWorking !== undefined) {
    updateData.isWorking = data.isWorking;
  }

  // ==========================================================
  // 3. PREVENT EMPTY UPDATES
  // ==========================================================

  if (Object.keys(updateData).length === 0) {
    throw new Error("No business hours fields were provided for update.");
  }

  // ==========================================================
  // 4. VALIDATE BUSINESS HOURS CONFIGURATION
  // ==========================================================

  const startTime =
    updateData.startTime !== undefined
      ? updateData.startTime
      : existingHours.startTime;

  const breakStartTime =
    updateData.breakStartTime !== undefined
      ? updateData.breakStartTime
      : existingHours.breakStartTime;

  const breakEndTime =
    updateData.breakEndTime !== undefined
      ? updateData.breakEndTime
      : existingHours.breakEndTime;

  const endTime =
    updateData.endTime !== undefined
      ? updateData.endTime
      : existingHours.endTime;

  const isWorking =
    updateData.isWorking !== undefined
      ? updateData.isWorking
      : existingHours.isWorking;

  if (startTime >= endTime) {
    throw new Error("Start time must be before end time.");
  }

  if (isWorking) {
    if (breakStartTime && !breakEndTime) {
      throw new Error(
        "Break end time is required when break start time is provided.",
      );
    }

    if (!breakStartTime && breakEndTime) {
      throw new Error(
        "Break start time is required when break end time is provided.",
      );
    }

    if (breakStartTime && breakEndTime) {
      if (breakStartTime >= breakEndTime) {
        throw new Error("Break start time must be before break end time.");
      }

      if (breakStartTime <= startTime || breakEndTime >= endTime) {
        throw new Error("Break time must fall within business hours.");
      }
    }
  }

  // ==========================================================
  // 5. CLEAR BREAK TIMES FOR NON-WORKING DAYS
  // ==========================================================

  if (!isWorking) {
    updateData.breakStartTime = null;
    updateData.breakEndTime = null;
  }

  // ==========================================================
  // 6. UPDATE DATABASE
  // ==========================================================

  return prisma.businessHours.update({
    where: {
      day,
    },
    data: updateData,
  });
};
