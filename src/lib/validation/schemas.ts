import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter.")
    .max(128, "Kata sandi maksimal 128 karakter."),
});

export const registerSchema = loginSchema.extend({
  fullName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter.")
    .max(100, "Nama lengkap maksimal 100 karakter."),
  studyProgram: z
    .string()
    .trim()
    .max(120, "Program studi maksimal 120 karakter.")
    .optional(),
  role: z
    .enum(["student", "volunteer"])
    .default("student"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter.")
      .max(128, "Kata sandi maksimal 128 karakter."),
    confirmPassword: z
      .string()
      .min(8, "Konfirmasi kata sandi minimal 8 karakter.")
      .max(128, "Konfirmasi kata sandi maksimal 128 karakter."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok dengan kata sandi baru.",
    path: ["confirmPassword"],
  });

export const courseCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Course code must be at least 2 characters.")
    .max(24, "Course code must be under 24 characters.")
    .regex(/^[A-Za-z0-9-]+$/, "Course code may only contain letters, numbers, and hyphens."),
  title: z
    .string()
    .trim()
    .min(3, "Course title must be at least 3 characters.")
    .max(160, "Course title must be under 160 characters."),
  discipline: z
    .string()
    .trim()
    .min(2, "Discipline is required.")
    .max(80, "Discipline must be under 80 characters."),
  description: z.string().trim().max(1000).optional(),
});

export const documentUploadMetaSchema = z.object({
  courseId: z.string().trim().min(1, "Select a valid course."),
  title: z
    .string()
    .trim()
    .min(2, "Document title must be at least 2 characters.")
    .max(200, "Document title must be under 200 characters."),
  language: z.enum(["en", "id"]).default("en"),
});

export const blockUpdateSchema = z.object({
  contentText: z
    .string()
    .trim()
    .min(1, "Block content cannot be empty.")
    .max(50000, "Block content exceeds maximum length."),
  spokenText: z.string().trim().max(50000).optional(),
  markVerified: z.boolean().default(true),
  reviewNote: z.string().trim().max(2000).optional(),
  latex: z.string().trim().max(4000).optional(),
});

export const reviewSubmitSchema = z.object({
  status: z.enum(["in_review", "needs_revision", "verified"]),
  notes: z.string().trim().max(2000).optional(),
});

export const documentShareSchema = z.object({
  sharedWithEmail: z.string().trim().email("Enter a valid recipient email address."),
  permission: z.enum(["view", "comment", "edit"]).default("view"),
});

export const accessibilityPreferencesSchema = z.object({
  readingFont: z.enum(["atkinson", "inter", "lexend"]),
  fontSizePx: z.number().int().min(14).max(28),
  lineHeight: z.number().min(1.3).max(2.4),
  letterSpacingEm: z.number().min(0).max(0.12),
  readingWidth: z.enum(["narrow", "comfortable", "wide"]),
  contrastMode: z.enum(["standard", "high"]),
  readingSurface: z.enum(["default", "warm"]),
  narrationSpeed: z.number().min(0.5).max(2.5),
  motionPreference: z.enum(["system", "reduce"]),
  language: z.enum(["en", "id"]),
});

export const chatRequestSchema = z.object({
  documentId: z.string().min(1, "A valid documentId is required for grounded Q&A."),
  documentTitle: z.string().optional(),
  language: z.enum(["en", "id"]).default("id"),
  messages: z.array(z.unknown()).min(1, "At least one message is required.").max(50),
  blocks: z
    .array(
      z.object({
        id: z.string().default("blk"),
        pageNumber: z.number().default(1),
        readingOrder: z.number().default(1),
        blockType: z.string().default("paragraph"),
        sectionHeading: z.string().nullable().optional(),
        contentText: z.string().default(""),
        spokenText: z.string().nullable().optional(),
      })
    )
    .optional(),
});
