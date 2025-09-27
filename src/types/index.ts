import { Request } from "express";
import { UserRole } from "../generated/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateClassScheduleRequest {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  trainerId: string;
}

export interface UpdateClassScheduleRequest {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  trainerId?: string;
}

export interface BookingRequest {
  classScheduleId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errorDetails?: ValidationError | string;
  statusCode: number;
}

export interface SuccessResponse<T = any> {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
}

export type ApiResponseType<T = any> = SuccessResponse<T> | ErrorResponse;
