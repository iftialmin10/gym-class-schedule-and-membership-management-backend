import { PrismaClient, UserRole } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gym.com" },
    update: {},
    create: {
      email: "admin@gym.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "Admin",
      role: UserRole.ADMIN,
    },
  });

  const trainer1Password = await bcrypt.hash("trainer123", 10);
  const trainer1 = await prisma.user.upsert({
    where: { email: "trainer1@gym.com" },
    update: {},
    create: {
      email: "trainer1@gym.com",
      password: trainer1Password,
      firstName: "Trainer",
      lastName: "One",
      role: UserRole.TRAINER,
    },
  });

  const trainer2Password = await bcrypt.hash("trainer123", 10);
  const trainer2 = await prisma.user.upsert({
    where: { email: "trainer2@gym.com" },
    update: {},
    create: {
      email: "trainer2@gym.com",
      password: trainer2Password,
      firstName: "Trainer",
      lastName: "Two",
      role: UserRole.TRAINER,
    },
  });

  const trainee1Password = await bcrypt.hash("trainee123", 10);
  const trainee1 = await prisma.user.upsert({
    where: { email: "trainee1@gym.com" },
    update: {},
    create: {
      email: "trainee1@gym.com",
      password: trainee1Password,
      firstName: "Trainee",
      lastName: "One",
      role: UserRole.TRAINEE,
    },
  });

  const trainee2Password = await bcrypt.hash("trainee123", 10);
  const trainee2 = await prisma.user.upsert({
    where: { email: "trainee2@gym.com" },
    update: {},
    create: {
      email: "trainee2@gym.com",
      password: trainee2Password,
      firstName: "Trainee",
      lastName: "Two",
      role: UserRole.TRAINEE,
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const schedule1 = await prisma.classSchedule.create({
    data: {
      title: "Morning Yoga Session",
      description: "Relaxing morning yoga session",
      date: tomorrow,
      startTime: "09:00",
      endTime: "11:00",
      trainerId: trainer1.id,
    },
  });

  const schedule2 = await prisma.classSchedule.create({
    data: {
      title: "Cardio Workout Session",
      description: "High-intensity cardio session",
      date: tomorrow,
      startTime: "14:00",
      endTime: "16:00",
      trainerId: trainer2.id,
    },
  });

  await prisma.booking.create({
    data: {
      traineeId: trainee1.id,
      classScheduleId: schedule1.id,
    },
  });

  await prisma.booking.create({
    data: {
      traineeId: trainee2.id,
      classScheduleId: schedule1.id,
    },
  });
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
