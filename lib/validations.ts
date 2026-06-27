import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  role: z.enum(["STUDENT", "ADMIN"]),
  // Student fields
  rollNumber: z.string().optional(),
  department: z.string().optional(),
  semester: z.coerce.number().optional(),
  batch: z.string().optional(),
  // Admin fields
  employeeId: z.string().optional(),
  designation: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const createNoticeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.enum(["ACADEMIC", "EVENT", "EXAMINATION", "GENERAL", "EMERGENCY"]),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  subjectId: z.string().min(1, "Subject is required"),
  dueDate: z.string().min(1, "Due date is required"),
  totalMarks: z.coerce.number().min(1).default(100),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export const createNoteSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  content: z.string().min(1, "Content cannot be empty"),
  category: z.enum(["LECTURE", "STUDY", "PERSONAL", "PROJECT", "RESEARCH", "OTHER"]),
  tags: z.string().optional(),
});

export const studentSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  rollNumber: z.string().min(1),
  department: z.string().min(1),
  semester: z.coerce.number().min(1).max(8),
  batch: z.string().min(1),
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  credits: z.coerce.number().min(1).max(6),
  department: z.string().min(1),
  semester: z.coerce.number().min(1).max(8),
});

export const timetableSchema = z.object({
  subjectId: z.string().min(1),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  room: z.string().min(1),
  semester: z.coerce.number().min(1).max(8),
  batch: z.string().min(1),
  department: z.string().min(1),
});
