import { Request, Response } from "express";
import { PrismaClient, UserRole } from "../generated/prisma";
import {
  CreateUserRequest,
  CreateClassScheduleRequest,
  UpdateClassScheduleRequest,
  ApiResponseType,
} from "../types";

const prisma = new PrismaClient();

export const createTrainer = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName }: CreateUserRequest =
      req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const response: ApiResponseType = {
        success: false,
        message: "User with this email already exists",
        statusCode: 400,
      };
      return res.status(400).json(response);
    }

    const bcrypt = require("bcrypt");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const trainer = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: UserRole.TRAINER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 201,
      message: "Trainer created successfully",
      data: trainer,
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to create trainer",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const getAllTrainers = async (req: Request, res: Response) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: UserRole.TRAINER },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Trainers retrieved successfully",
      data: trainers,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to retrieve trainers",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const createClassSchedule = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      trainerId,
    }: CreateClassScheduleRequest = req.body;

    const trainer = await prisma.user.findUnique({
      where: { id: trainerId, role: UserRole.TRAINER },
    });

    if (!trainer) {
      const response: ApiResponseType = {
        success: false,
        message: "Trainer not found",
        statusCode: 404,
      };
      return res.status(404).json(response);
    }

    const scheduleDate = new Date(date);
    const startOfDay = new Date(scheduleDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(scheduleDate.setHours(23, 59, 59, 999));

    const existingSchedulesCount = await prisma.classSchedule.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingSchedulesCount >= 5) {
      const response: ApiResponseType = {
        success: false,
        message: "Maximum of 5 class schedules allowed per day",
        statusCode: 400,
      };
      return res.status(400).json(response);
    }

    const conflictingSchedule = await prisma.classSchedule.findFirst({
      where: {
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
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingSchedule) {
      const response: ApiResponseType = {
        success: false,
        message: "Time conflict with existing schedule",
        statusCode: 400,
      };
      return res.status(400).json(response);
    }

    const classSchedule = await prisma.classSchedule.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
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
      },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 201,
      message: "Class schedule created successfully",
      data: classSchedule,
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to create class schedule",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const getAllClassSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await prisma.classSchedule.findMany({
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
      orderBy: {
        date: "asc",
      },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Class schedules retrieved successfully",
      data: schedules,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to retrieve class schedules",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const updateClassSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateClassScheduleRequest = req.body;

    const existingSchedule = await prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      const response: ApiResponseType = {
        success: false,
        message: "Class schedule not found",
        statusCode: 404,
      };
      return res.status(404).json(response);
    }

    const updatedSchedule = await prisma.classSchedule.update({
      where: { id },
      data: updateData,
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
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Class schedule updated successfully",
      data: updatedSchedule,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to update class schedule",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const deleteClassSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingSchedule = await prisma.classSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      const response: ApiResponseType = {
        success: false,
        message: "Class schedule not found",
        statusCode: 404,
      };
      return res.status(404).json(response);
    }

    await prisma.classSchedule.delete({
      where: { id },
    });

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Class schedule deleted successfully",
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to delete class schedule",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};
