import { Router } from "express";
import {
  createTrainer,
  getAllTrainers,
  createClassSchedule,
  getAllClassSchedules,
  updateClassSchedule,
  deleteClassSchedule,
} from "../controllers/adminController";
import { authenticateToken, authorizeRole } from "../middleware/auth";
import {
  validateUserRegistration,
  validateClassSchedule,
} from "../middleware/validation";
import { UserRole } from "../generated/prisma";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole([UserRole.ADMIN]));

router.post("/trainers", validateUserRegistration, createTrainer);
router.get("/trainers", getAllTrainers);

router.post("/schedules", validateClassSchedule, createClassSchedule);
router.get("/schedules", getAllClassSchedules);
router.put("/schedules/:id", updateClassSchedule);
router.delete("/schedules/:id", deleteClassSchedule);

export default router;
