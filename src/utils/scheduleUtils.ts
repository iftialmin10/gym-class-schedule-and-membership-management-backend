import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

export const checkDailyScheduleLimit = async (
  date: string
): Promise<boolean> => {
  const scheduleDate = new Date(date);
  const startOfDay = new Date(scheduleDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(scheduleDate.setHours(23, 59, 59, 999));

  const count = await prisma.classSchedule.count({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  return count < 5;
};

export const checkScheduleCapacity = async (
  scheduleId: string
): Promise<boolean> => {
  const schedule = await prisma.classSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      bookings: true,
    },
  });

  if (!schedule) return false;

  return schedule.bookings.length < schedule.maxTrainees;
};

export const checkTimeConflict = async (
  date: string,
  startTime: string,
  endTime: string,
  excludeScheduleId?: string
): Promise<boolean> => {
  const scheduleDate = new Date(date);
  const startOfDay = new Date(scheduleDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(scheduleDate.setHours(23, 59, 59, 999));

  const whereClause: any = {
    date: {
      gte: startOfDay,
      lte: endOfDay,
    },
    OR: [
      {
        AND: [
          { startTime: { lte: startTime } },
          { endTime: { gt: startTime } },
        ],
      },
      {
        AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
      },
      {
        AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
      },
    ],
  };

  if (excludeScheduleId) {
    whereClause.NOT = { id: excludeScheduleId };
  }

  const conflictingSchedule = await prisma.classSchedule.findFirst({
    where: whereClause,
  });

  return !conflictingSchedule;
};

export const checkTraineeTimeConflict = async (
  traineeId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> => {
  const scheduleDate = new Date(date);
  const startOfDay = new Date(scheduleDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(scheduleDate.setHours(23, 59, 59, 999));

  const whereClause: any = {
    traineeId,
    classSchedule: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
  };

  if (excludeBookingId) {
    whereClause.NOT = { id: excludeBookingId };
  }

  const conflictingBooking = await prisma.booking.findFirst({
    where: whereClause,
  });

  return !conflictingBooking;
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const isPastSchedule = (date: string, startTime: string): boolean => {
  const scheduleDateTime = new Date(date);
  const [hours, minutes] = startTime.split(":").map(Number);
  scheduleDateTime.setHours(hours, minutes, 0, 0);

  return scheduleDateTime < new Date();
};
