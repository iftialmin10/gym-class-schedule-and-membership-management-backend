# Gym Class Scheduling and Membership Management System

## Project Overview

A comprehensive Node.js/TypeScript API for managing gym operations with role-based access control. The system manages gym class scheduling, trainer assignments, and trainee bookings with strict business rules and capacity management.

### Key Features

- **Role-based Authentication**: Admin, Trainer, and Trainee roles with specific permissions
- **Class Scheduling**: Admins can create and manage class schedules (max 5 per day)
- **Booking System**: Trainees can book classes with capacity limits (max 10 per class)
- **JWT Authentication**: Secure token-based authentication
- **Comprehensive Error Handling**: Robust error handling with proper HTTP status codes
- **Input Validation**: Request validation middleware for all endpoints

### Business Rules

1. **Class Scheduling**: Maximum 5 class schedules per day, each lasting exactly 2 hours
2. **Booking System**: Maximum 10 trainees per class schedule, no double booking
3. **Role Permissions**: Admins manage trainers and schedules, trainers view assignments, trainees book classes

## Relation Diagram

![Database Schema](prisma-erd.png)

The diagram above shows the relationships between the three main entities in the system:

- **User**: Represents admin, trainer, and trainee roles
- **ClassSchedule**: Represents gym class schedules with trainer assignments
- **Booking**: Represents trainee bookings for specific class schedules

### Key Relationships:

- One **User** (trainer) can lead multiple **ClassSchedule** records
- One **ClassSchedule** can have multiple **Booking** records
- One **User** (trainee) can make multiple **Booking** records
- Each **Booking** belongs to exactly one **ClassSchedule** and one **User** (trainee)

## Technology Stack

- **Backend Framework**: Node.js with Express.js
- **Programming Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Custom middleware
- **CORS**: Cross-origin resource sharing
- **Development Tools**: Nodemon, ts-node
- **Build Tools**: TypeScript compiler

## API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint    | Description         | Auth Required |
| ------ | ----------- | ------------------- | ------------- |
| POST   | `/register` | Register a new user | No            |
| POST   | `/login`    | User login          | No            |
| GET    | `/profile`  | Get user profile    | Yes           |

### Admin Endpoints (`/api/admin`)

| Method | Endpoint         | Description             | Auth Required |
| ------ | ---------------- | ----------------------- | ------------- |
| POST   | `/trainers`      | Create a new trainer    | Admin         |
| GET    | `/trainers`      | Get all trainers        | Admin         |
| POST   | `/schedules`     | Create a class schedule | Admin         |
| GET    | `/schedules`     | Get all class schedules | Admin         |
| PUT    | `/schedules/:id` | Update a class schedule | Admin         |
| DELETE | `/schedules/:id` | Delete a class schedule | Admin         |

### Trainer Endpoints (`/api/trainer`)

| Method | Endpoint              | Description                   | Auth Required |
| ------ | --------------------- | ----------------------------- | ------------- |
| GET    | `/schedules`          | Get assigned schedules        | Trainer       |
| GET    | `/schedules/upcoming` | Get upcoming schedules        | Trainer       |
| GET    | `/schedules/:id`      | Get specific schedule details | Trainer       |

### Trainee Endpoints (`/api/trainee`)

| Method | Endpoint               | Description                         | Auth Required |
| ------ | ---------------------- | ----------------------------------- | ------------- |
| GET    | `/schedules/available` | Get available schedules for booking | Trainee       |
| POST   | `/bookings`            | Book a class                        | Trainee       |
| GET    | `/bookings`            | Get personal bookings               | Trainee       |
| DELETE | `/bookings/:id`        | Cancel a booking                    | Trainee       |
| PUT    | `/profile`             | Update profile                      | Trainee       |

### Response Format

#### Success Response

```json
{
  "success": true,
  "statusCode": 200|201,
  "message": "Success message",
  "data": {}
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errorDetails": "string" | { "field": "string", "message": "string" },
  "statusCode": 400|401|403|404|500
}
```

## Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  trainerSchedules ClassSchedule[] @relation("TrainerSchedules")
  bookings         Booking[]
}
```

### ClassSchedule Model

```prisma
model ClassSchedule {
  id          String   @id @default(cuid())
  title       String
  description String?
  date        DateTime
  startTime   String   // Format: "HH:MM"
  endTime     String   // Format: "HH:MM"
  maxTrainees Int      @default(10)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  trainerId String
  trainer   User     @relation("TrainerSchedules", fields: [trainerId], references: [id])
  bookings  Booking[]
}
```

### Booking Model

```prisma
model Booking {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  traineeId       String
  trainee         User         @relation(fields: [traineeId], references: [id])
  classScheduleId String
  classSchedule   ClassSchedule @relation(fields: [classScheduleId], references: [id])

  @@unique([traineeId, classScheduleId])
}
```

### UserRole Enum

```prisma
enum UserRole {
  ADMIN
  TRAINER
  TRAINEE
}
```

## Admin Credentials

### Test Accounts (Pre-seeded)

#### Admin Account

- **Email**: `admin@gym.com`
- **Password**: `admin123`
- **Role**: ADMIN

#### Trainer Accounts

- **Email**: `trainer1@gym.com`
- **Password**: `trainer123`
- **Role**: TRAINER

- **Email**: `trainer2@gym.com`
- **Password**: `trainer123`
- **Role**: TRAINER

#### Trainee Accounts

- **Email**: `trainee1@gym.com`
- **Password**: `trainee123`
- **Role**: TRAINEE

- **Email**: `trainee2@gym.com`
- **Password**: `trainee123`
- **Role**: TRAINEE

## Instructions to Run Locally

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd gym-management

# Install dependencies
npm install
```

### Step 2: Environment Setup

```bash
# Copy environment template
# Edit .env file with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/gym_management"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=5000
NODE_ENV=development
```

### Step 3: Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with test data
npm run seed
```

### Step 4: Start the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

### Step 5: Verify Installation

```bash
# Health check
curl http://localhost:5000/

# Expected response:
{
  "success": true,
  "statusCode": 200,
  "message": "Gym Management API is running",
  "data": {
    "timestamp": "2024-01-10T10:00:00.000Z"
  }

```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run seed        # Seed database with test data
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
```

### Testing the API

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@gym.com", "password": "admin123"}'

# Use the returned token for authenticated requests
curl -X GET http://localhost:5000/api/admin/trainers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Project Structure

```
src/
├── controllers/          # Route handlers
│   ├── authController.ts
│   ├── adminController.ts
│   ├── trainerController.ts
│   └── traineeController.ts
├── middleware/           # Custom middleware
│   ├── auth.ts
│   └── validation.ts
├── routes/              # Route definitions
│   ├── authRoutes.ts
│   ├── adminRoutes.ts
│   ├── trainerRoutes.ts
│   ├── traineeRoutes.ts
│   └── index.ts
├── types/               # TypeScript interfaces
│   └── index.ts
├── utils/               # Utility functions
│   └── scheduleUtils.ts
├── config/              # Configuration
│   └── index.ts
├── generated/           # Prisma generated files
│   └── prisma/
└── app.ts               # Main application file
```

### Troubleshooting

- **Database connection issues**: Verify PostgreSQL is running and credentials are correct
- **Port conflicts**: Change PORT in .env file if 5000 is occupied
- **Prisma errors**: Run `npm run db:generate` after schema changes
- **JWT errors**: Ensure JWT_SECRET is set in .env file

### Live Hosting Link

- **Railway-Server-Link**: https://gym-class-schedule-and-membership-management-bac-production.up.railway.app/
- **Render-Server-Link**: https://gym-class-schedule-and-membership.onrender.com/
