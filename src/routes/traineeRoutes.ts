import { Router } from "express";
import {
  getAvailableSchedules,
  bookClass,
  getMyBookings,
  cancelBooking,
  updateProfile,
} from "../controllers/traineeController";
import { authenticateToken, authorizeRole } from "../middleware/auth";
import { validateBooking } from "../middleware/validation";
import { UserRole } from "../generated/prisma";

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole([UserRole.TRAINEE]));

router.get("/schedules/available", getAvailableSchedules);
router.post("/bookings", validateBooking, bookClass);
router.get("/bookings", getMyBookings);
router.delete("/bookings/:id", cancelBooking);

router.put("/profile", updateProfile);

export default router;
