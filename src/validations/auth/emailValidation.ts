import { z } from "zod";

// Email validation schemas
export const emailSchema = z.string().email("Invalid email format");

export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const emailChangeSchema = z
  .object({
    newEmail: emailSchema,
    confirmEmail: emailSchema,
  })
  .refine((data) => data.newEmail === data.confirmEmail, {
    message: "Email and confirmation email don't match",
    path: ["confirmEmail"],
  });

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

// Types
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type EmailChangeInput = z.infer<typeof emailChangeSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

// Email validation functions
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmailChangeRequest(
  newEmail: string,
  currentEmail: string
) {
  const errors: string[] = [];

  if (!newEmail) {
    errors.push("New email is required");
    return { isValid: false, errors };
  }

  if (!validateEmailFormat(newEmail)) {
    errors.push("Invalid email format");
  }

  if (currentEmail === newEmail) {
    errors.push("New email must be different from current email");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
