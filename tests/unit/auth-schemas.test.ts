import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation/schemas";
import { mapAuthErrorMessage } from "@/features/authentication/utils";

describe("Authentication Schemas & Validation", () => {
  it("validates valid login credentials", () => {
    const valid = loginSchema.safeParse({
      email: "student@university.ac.id",
      password: "securepassword123",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects invalid email in login", () => {
    const invalid = loginSchema.safeParse({
      email: "invalid-email",
      password: "securepassword123",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects short password in login", () => {
    const invalid = loginSchema.safeParse({
      email: "student@university.ac.id",
      password: "short",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates valid registration details", () => {
    const valid = registerSchema.safeParse({
      email: "mahasiswa@kampus.ac.id",
      password: "passwordkuat123",
      fullName: "Budi Santoso",
      studyProgram: "S1 Ilmu Komputer",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.role).toBe("student");
    }
  });

  it("validates registration with explicit role and separated study program", () => {
    const valid = registerSchema.safeParse({
      email: "volunteer@kampus.ac.id",
      password: "passwordkuat123",
      fullName: "Siti Rahma",
      studyProgram: "S1 Matematika",
      role: "volunteer",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.role).toBe("volunteer");
      expect(valid.data.studyProgram).toBe("S1 Matematika");
    }
  });

  it("rejects admin role during public registration", () => {
    const invalid = registerSchema.safeParse({
      email: "admin@kampus.ac.id",
      password: "passwordkuat123",
      fullName: "Admin Palsu",
      role: "admin",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates forgot password email", () => {
    const valid = forgotPasswordSchema.safeParse({
      email: "test@domain.com",
    });
    expect(valid.success).toBe(true);

    const invalid = forgotPasswordSchema.safeParse({
      email: "not-an-email",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates matching passwords in reset password schema", () => {
    const valid = resetPasswordSchema.safeParse({
      password: "newStrongPassword123",
      confirmPassword: "newStrongPassword123",
    });
    expect(valid.success).toBe(true);

    const mismatch = resetPasswordSchema.safeParse({
      password: "newStrongPassword123",
      confirmPassword: "differentPassword123",
    });
    expect(mismatch.success).toBe(false);
  });

  it("correctly maps common Supabase error messages to Indonesian", () => {
    expect(mapAuthErrorMessage("Invalid login credentials")).toContain(
      "Email atau kata sandi tidak sesuai"
    );
    expect(mapAuthErrorMessage("Email not confirmed")).toContain(
      "Alamat email belum diverifikasi"
    );
    expect(mapAuthErrorMessage("User already registered")).toContain(
      "Alamat email ini sudah terdaftar"
    );
    expect(mapAuthErrorMessage("Password should be at least 6 characters")).toContain(
      "Kata sandi minimal 8 karakter"
    );
    expect(
      mapAuthErrorMessage("PKCE code verifier not found in storage")
    ).toContain("PKCE code verifier mismatch");
  });
});
