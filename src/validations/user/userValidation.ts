import { z } from "zod";

// User validation schemas
export const userIdSchema = z.string().uuid("Invalid user ID format");

export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]{10,}$/, "Invalid phone number format")
    .optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().min(1, "Address is required").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export const userRequiredFieldsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
});

// Types
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type UserRequiredFieldsInput = z.infer<typeof userRequiredFieldsSchema>;

// User validation functions
export function validateUserId(req: any): {
  isValid: boolean;
  userId?: string;
  error?: string;
} {
  const userId = req.user?.userId;

  if (!userId) {
    return {
      isValid: false,
      error: "User not authenticated",
    };
  }

  return {
    isValid: true,
    userId,
  };
}

export function validateRequiredFields(
  fields: Record<string, any>,
  requiredFields: string[]
) {
  const missingFields = requiredFields.filter((field) => !fields[field]);

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

export function sanitizeInput(data: any) {
  const sanitized: any = {};

  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (typeof data[key] === "string") {
        sanitized[key] = data[key].trim();
      } else {
        sanitized[key] = data[key];
      }
    }
  });

  return sanitized;
}
