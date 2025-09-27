import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "nothing-secret-key",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://username:password@localhost:5432/gym_management",
  nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
