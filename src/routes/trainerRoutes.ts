import { Router } from "express";
import {
  getMySchedules,
  getScheduleById,
  getUpcomingSchedules,
} from "../controllers/trainerController";
import { authenticateToken, authorizeRole } from "../middleware/auth";
import { UserRole } from "../generated/prisma";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole([UserRole.TRAINER]));

router.get("/schedules", getMySchedules);
router.get("/schedules/upcoming", getUpcomingSchedules);
router.get("/schedules/:id", getScheduleById);

export default router;
