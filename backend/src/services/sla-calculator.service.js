import { DateTime } from "luxon";
import prisma from "../config/database.js";

const TIME_ZONE = "Africa/Addis_Ababa";

/**
 * Convert HH:mm into minutes from midnight.
 */
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Get the configured business hours for a specific date.
 */
const getBusinessHoursForDate = async (date) => {
  const dayName = date.setZone(TIME_ZONE).toFormat("cccc").toUpperCase();

  return prisma.businessHours.findUnique({
    where: {
      day: dayName,
    },
  });
};

/**
 * Return the working intervals for a particular date.
 *
 * Example:
 * 08:30–12:30
 * 13:30–17:30
 */
const getWorkingIntervals = async (date) => {
  const businessHours = await getBusinessHoursForDate(date);

  if (!businessHours || !businessHours.isWorking) {
    return [];
  }

  const year = date.year;
  const month = date.month;
  const day = date.day;

  const startMinutes = timeToMinutes(businessHours.startTime);
  const endMinutes = timeToMinutes(businessHours.endTime);

  const startOfDay = DateTime.fromObject(
    {
      year,
      month,
      day,
      hour: 0,
      minute: 0,
    },
    { zone: TIME_ZONE },
  );

  const intervals = [];

  if (businessHours.breakStartTime && businessHours.breakEndTime) {
    const breakStartMinutes = timeToMinutes(businessHours.breakStartTime);

    const breakEndMinutes = timeToMinutes(businessHours.breakEndTime);

    intervals.push({
      start: startOfDay.plus({
        minutes: startMinutes,
      }),
      end: startOfDay.plus({
        minutes: breakStartMinutes,
      }),
    });

    intervals.push({
      start: startOfDay.plus({
        minutes: breakEndMinutes,
      }),
      end: startOfDay.plus({
        minutes: endMinutes,
      }),
    });
  } else {
    intervals.push({
      start: startOfDay.plus({
        minutes: startMinutes,
      }),
      end: startOfDay.plus({
        minutes: endMinutes,
      }),
    });
  }

  return intervals;
};

/**
 * Calculate the number of working minutes between two timestamps.
 */
export const calculateBusinessMinutes = async (start, end) => {
  if (end <= start) {
    return 0;
  }

  let cursor = DateTime.fromJSDate(start, {
    zone: TIME_ZONE,
  });

  const endDateTime = DateTime.fromJSDate(end, {
    zone: TIME_ZONE,
  });

  let totalMinutes = 0;

  while (cursor < endDateTime) {
    const intervals = await getWorkingIntervals(cursor);

    for (const interval of intervals) {
      const effectiveStart = cursor > interval.start ? cursor : interval.start;

      const effectiveEnd =
        endDateTime < interval.end ? endDateTime : interval.end;

      if (effectiveEnd > effectiveStart) {
        totalMinutes += effectiveEnd.diff(effectiveStart, "minutes").minutes;
      }
    }

    cursor = cursor.startOf("day").plus({ days: 1 }).setZone(TIME_ZONE);
  }

  return Math.floor(totalMinutes);
};

/**
 * Add a number of working minutes to a timestamp.
 */
export const addBusinessMinutes = async (start, minutes) => {
  if (minutes <= 0) {
    return new Date(start);
  }

  let cursor = DateTime.fromJSDate(start, {
    zone: TIME_ZONE,
  });

  let remainingMinutes = minutes;

  while (remainingMinutes > 0) {
    const intervals = await getWorkingIntervals(cursor);

    for (const interval of intervals) {
      if (cursor >= interval.end) {
        continue;
      }

      if (cursor < interval.start) {
        cursor = interval.start;
      }

      if (cursor >= interval.end) {
        continue;
      }


      const availableMinutes = interval.end.diff(cursor, "minutes").minutes;

      if (remainingMinutes <= availableMinutes) {
        cursor = cursor.plus({
          minutes: remainingMinutes,
        });

        remainingMinutes = 0;
        break;
      }

      remainingMinutes -= availableMinutes;
      cursor = interval.end;
    }

    if (remainingMinutes > 0) {
      cursor = cursor.startOf("day").plus({ days: 1 }).setZone(TIME_ZONE);
    }
  }

  return cursor.toJSDate();
};

/**
 * Calculate SLA warning and resolution deadlines.
 *
 * Current business rule:
 * - Resolution SLA = 960 working minutes
 * - Warning = 80% of SLA = 768 working minutes
 */
export const calculateResolutionSla = async ({
  startedAt,
  resolutionTimeMinutes,
  warningPercentage,
}) => {
  const warningMinutes = Math.floor(
    resolutionTimeMinutes * (warningPercentage / 100),
  );

  const warningAt = await addBusinessMinutes(startedAt, warningMinutes);

  const resolutionDueAt = await addBusinessMinutes(
    startedAt,
    resolutionTimeMinutes,
  );

  return {
    warningAt,
    resolutionDueAt,
  };
};
