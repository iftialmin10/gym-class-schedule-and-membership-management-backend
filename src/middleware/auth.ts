import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, UserRole } from "../generated/prisma";
import { AuthRequest, ErrorResponse } from "../types";

const prisma = new PrismaClient();

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: "Unauthorized access.",
        errorDetails: "Access token is required",
        statusCode: 401,
      };
      return res.status(401).json(errorResponse);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: "Unauthorized access.",
        errorDetails: "Invalid token or user not found",
        statusCode: 401,
      };
      return res.status(401).json(errorResponse);
    }

    req.user = user;
    next();
  } catch (error) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Unauthorized access.",
      errorDetails: "Invalid or expired token",
      statusCode: 401,
    };
    return res.status(401).json(errorResponse);
  }
};

export const authorizeRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const errorResponse: ErrorResponse = {
        success: false,
        message: "Unauthorized access.",
        errorDetails: "Authentication required",
        statusCode: 401,
      };
      return res.status(401).json(errorResponse);
    }

    if (!roles.includes(req.user.role)) {
      const roleNames = roles.map((role) => role.toLowerCase()).join(" or ");
      const errorResponse: ErrorResponse = {
        success: false,
        message: "Unauthorized access.",
        errorDetails: `You must be a ${roleNames} to perform this action.`,
        statusCode: 403,
      };
      return res.status(403).json(errorResponse);
    }

    next();
  };
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error.code === "P2002") {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: "Duplicate entry. This record already exists.",
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (error.code === "P2025") {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Record not found",
      errorDetails: "The requested resource does not exist",
      statusCode: 404,
    };
    return res.status(404).json(errorResponse);
  }

  if (error.name === "ValidationError") {
    const firstError = error.details?.[0];
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Validation error occurred.",
      errorDetails: firstError
        ? {
            field: firstError.path.join("."),
            message: firstError.message,
          }
        : "Validation failed",
      statusCode: 400,
    };
    return res.status(400).json(errorResponse);
  }

  if (error.name === "JsonWebTokenError") {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Unauthorized access.",
      errorDetails: "Invalid token",
      statusCode: 401,
    };
    return res.status(401).json(errorResponse);
  }

  if (error.name === "TokenExpiredError") {
    const errorResponse: ErrorResponse = {
      success: false,
      message: "Unauthorized access.",
      errorDetails: "Token expired",
      statusCode: 401,
    };
    return res.status(401).json(errorResponse);
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message: error.message || "Internal server error",
    errorDetails: "An unexpected error occurred",
    statusCode: error.statusCode || 500,
  };

  res.status(errorResponse.statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errorDetails: "The requested endpoint does not exist",
    statusCode: 404,
  };
  res.status(404).json(errorResponse);
};
