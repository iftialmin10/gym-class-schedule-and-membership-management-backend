import { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { ApiResponseType } from "../types";

const prisma = new PrismaClient();

export const getMySchedules = async (req: Request, res: Response) => {
  try {
    const trainerId = (req as any).user.id;

    const schedules = await prisma.classSchedule.findMany({
      where: { trainerId },
      include: {
        bookings: {
          include: {
            trainee: {
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
        date: "asc",
      },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Your class schedules retrieved successfully",
      data: schedules,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to retrieve your schedules",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const getScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trainerId = (req as any).user.id;

    const schedule = await prisma.classSchedule.findFirst({
      where: {
        id,
        trainerId,
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
          include: {
            trainee: {
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

    if (!schedule) {
      const response: ApiResponseType = {
        success: false,
        message: "Schedule not found or you are not assigned to this schedule",
        statusCode: 404,
      };
      return res.status(404).json(response);
    }

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Schedule retrieved successfully",
      data: schedule,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to retrieve schedule",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const getUpcomingSchedules = async (req: Request, res: Response) => {
  try {
    const trainerId = (req as any).user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingSchedules = await prisma.classSchedule.findMany({
      where: {
        trainerId,
        date: {
          gte: today,
        },
      },
      include: {
        bookings: {
          include: {
            trainee: {
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
        date: "asc",
      },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Upcoming schedules retrieved successfully",
      data: upcomingSchedules,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to retrieve upcoming schedules",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};
