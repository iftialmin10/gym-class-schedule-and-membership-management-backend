import { Request, Response, NextFunction } from "express";
import { ErrorResponse, ValidationError } from "../types";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const validateUserRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !validateEmail(email)) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: { field: "email", message: "Invalid email format." },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (!password || !validatePassword(password)) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: {
        field: "password",
        message: "Password must be at least 6 characters",
      },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (!firstName || firstName.trim().length < 2) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: {
        field: "firstName",
        message: "First name must be at least 2 characters",
      },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (!lastName || lastName.trim().length < 2) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: {
        field: "lastName",
        message: "Last name must be at least 2 characters",
      },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (!role || !["ADMIN", "TRAINER", "TRAINEE"].includes(role)) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: {
        field: "role",
        message: "Valid role (ADMIN, TRAINER, TRAINEE) is required",
      },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: { field: "email", message: "Invalid email format." },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (!password) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: { field: "password", message: "Password is required" },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  next();
};

export const validateClassSchedule = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, date, startTime, endTime, trainerId } = req.body;

  if (!title || title.trim().length < 3) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: {
        field: "title",
        message: "Title must be at least 3 characters",
      },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (!date || !validateDate(date)) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: { field: "date", message: "Valid date is required" },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (!startTime || !validateTimeFormat(startTime)) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: {
        field: "startTime",
        message: "Valid start time (HH:MM) is required",
      },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (!endTime || !validateTimeFormat(endTime)) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: {
        field: "endTime",
        message: "Valid end time (HH:MM) is required",
      },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (!trainerId || trainerId.trim().length === 0) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: { field: "trainerId", message: "Trainer ID is required" },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (
    startTime &&
    endTime &&
    validateTimeFormat(startTime) &&
    validateTimeFormat(endTime)
  ) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (diffHours !== 2) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: "Validation error occurred.",
        errorDetails: {
          field: "duration",
          message: "Class duration must be exactly 2 hours",
        },
        statusCode: 400,
      };
      return res.status(400).json(errorResponse);
    }
  }

  next();
};

export const validateBooking = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { classScheduleId } = req.body;

  if (!classScheduleId || classScheduleId.trim().length === 0) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: {
        field: "classScheduleId",
        message: "Class schedule ID is required",
      },
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  next();
};
