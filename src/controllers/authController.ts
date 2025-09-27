import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, UserRole } from "../generated/prisma";
import { CreateUserRequest, LoginRequest, ApiResponseType } from "../types";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role }: CreateUserRequest =
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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as UserRole,
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

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    const response: ApiResponseType = {
      success: true,
      statusCode: 201,
      message: "User registered successfully",
      data: { user, token },
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Registration failed",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const response: ApiResponseType = {
        success: false,
        message: "Invalid email or password",
        statusCode: 401,
      };
      return res.status(401).json(response);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const response: ApiResponseType = {
        success: false,
        message: "Invalid email or password",
        statusCode: 401,
      };
      return res.status(401).json(response);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Login failed",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      const response: ApiResponseType = {
        success: false,
        message: "User not found",
        statusCode: 404,
      };
      return res.status(404).json(response);
    }

    const response: ApiResponseType = {
      success: true,
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: user,
    };

    res.json(response);
  } catch (error: any) {
    const response: ApiResponseType = {
      success: false,
      message: error.message || "Failed to retrieve profile",
      statusCode: 500,
    };
    res.status(500).json(response);
  }
};
