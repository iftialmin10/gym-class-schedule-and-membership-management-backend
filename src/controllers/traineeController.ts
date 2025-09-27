import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { BookingRequest, ApiResponseType } from "../types";

const prisma = new PrismaClient();

export const getAvailableSchedules = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableSchedules = await prisma.classSchedule.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      include: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        bookings: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const schedulesWithAvailability = availableSchedules.map((schedule) => ({
      ...schedule,
      availableSlots: schedule.maxTrainees - schedule.bookings.length,
      isAvailable: schedule.maxTrainees - schedule.bookings.length > 0,
    }));

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Available schedules retrieved successfully",
      data: schedulesWithAvailability,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to retrieve available schedules",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const bookClass = async (req: Request, res: Response) => {
  try {
    const { classScheduleId }: BookingRequest = req.body;
    const traineeId = (req as any).user.id;

    const schedule = await prisma.classSchedule.findUnique({
      where: { id: classScheduleId },
      include: {
        bookings: true,
      },
    });

    if (!schedule) {
      const response: ApiResponseType = {
        success: false,
        message: "Class schedule not found",
        statusCode: 404,
      };
      return res.status(404).json(response);
    }

    const now = new Date();
    const scheduleDateTime = new Date(schedule.date);
    const [hours, minutes] = schedule.startTime.split(":").map(Number);
    scheduleDateTime.setHours(hours, minutes, 0, 0);

    if (scheduleDateTime < now) {
      const response: ApiResponseType = {
        success: false,
        message: "Cannot book past schedules",
        statusCode: 400,
      };
      return res.status(400).json(response);
    }

    if (schedule.bookings.length >= schedule.maxTrainees) {
      const response: ApiResponseType = {
        success: false,
        message:
          "Class schedule is full. Maximum 10 trainees allowed per schedule.",
        statusCode: 400,
      };
      return res.status(400).json(response);
    }

    const existingBooking = await prisma.booking.findUnique({
      where: {
        traineeId_classScheduleId: {
          traineeId,
          classScheduleId,
        },
      },
    });

    if (existingBooking) {
      const response: ApiResponseType = {
        success: false,
        message: "You have already booked this class",
        statusCode: 400,
      };
      return res.status(400).json(response);
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        traineeId,
        classSchedule: {
          date: schedule.date,
          OR: [
            {
              AND: [
                { startTime: { lte: schedule.startTime } },
                { endTime: { gt: schedule.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: schedule.endTime } },
                { endTime: { gte: schedule.endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: schedule.startTime } },
                { endTime: { lte: schedule.endTime } },
              ],
            },
          ],
        },
      },
    });

    if (conflictingBooking) {
      const response: ApiResponseType = {
        success: false,
        message: "You already have a booking at this time",
        statusCode: 400,
      };
      return res.status(400).json(response);
    }

    const booking = await prisma.booking.create({
      data: {
        traineeId,
        classScheduleId,
      },
      include: {
        classSchedule: {
          include: {
            trainer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 201,
      message: "Class booked successfully",
      data: booking,
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to book class",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const traineeId = (req as any).user.id;

    const bookings = await prisma.booking.findMany({
      where: { traineeId },
      include: {
        classSchedule: {
          include: {
            trainer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Your bookings retrieved successfully",
      data: bookings,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to retrieve your bookings",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const traineeId = (req as any).user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        traineeId,
      },
      include: {
        classSchedule: true,
      },
    });

    if (!booking) {
      const response: ApiResponseType = {
        success: false,
        message: "Booking not found or you are not authorized to cancel it",
        statusCode: 404,
      };
      return res.status(404).json(response);
    }

    const now = new Date();
    const scheduleDateTime = new Date(booking.classSchedule.date);
    const [hours, minutes] = booking.classSchedule.startTime
      .split(":")
      .map(Number);
    scheduleDateTime.setHours(hours, minutes, 0, 0);

    if (scheduleDateTime < now) {
      const response: ApiResponseType = {
        success: false,
        message: "Cannot cancel past bookings",
        statusCode: 400,
      };
      return res.status(400).json(response);
    }

    await prisma.booking.delete({
      where: { id },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Booking cancelled successfully",
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to cancel booking",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const traineeId = (req as any).user.id;
    const { firstName, lastName, email } = req.body;

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: traineeId },
        },
      });

      if (existingUser) {
        const response: ApiResponseType = {
          success: false,
          message: "Email is already taken",
          statusCode: 400,
        };
        return res.status(400).json(response);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: traineeId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: updatedUser,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to update profile",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};
