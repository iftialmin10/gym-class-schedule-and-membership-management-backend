import { Router } from "express";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";
import trainerRoutes from "./trainerRoutes";
import traineeRoutes from "./traineeRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/trainer", trainerRoutes);
router.use("/trainee", traineeRoutes);

export default router;
