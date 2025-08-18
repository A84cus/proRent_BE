import { z } from "zod";

// File upload validation schemas
export const imageUploadSchema = z.object({
  mimetype: z
    .string()
    .refine(
      (type) =>
        ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(type),
      "Only JPEG, PNG, and WebP images are allowed"
    ),
  size: z.number().max(5 * 1024 * 1024, "File size must not exceed 5MB"),
});

export const avatarUploadSchema = z.object({
  file: z.object({
    mimetype: z
      .string()
      .refine(
        (type) =>
          ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(type),
        "Avatar must be JPEG, PNG, or WebP format"
      ),
    size: z
      .number()
      .max(2 * 1024 * 1024, "Avatar file size must not exceed 2MB"),
  }),
});

export const propertyImageUploadSchema = z.object({
  files: z
    .array(
      z.object({
        mimetype: z
          .string()
          .refine(
            (type) =>
              ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
                type
              ),
            "Property images must be JPEG, PNG, or WebP format"
          ),
        size: z
          .number()
          .max(10 * 1024 * 1024, "Each property image must not exceed 10MB"),
      })
    )
    .max(10, "Maximum 10 images allowed per property"),
});

// Types
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
export type PropertyImageUploadInput = z.infer<
  typeof propertyImageUploadSchema
>;

// File validation functions
export function validateFileType(
  file: any,
  allowedTypes: string[]
): { isValid: boolean; error?: string } {
  if (!file || !file.mimetype) {
    return {
      isValid: false,
      error: "No file provided or invalid file format",
    };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `File type ${
        file.mimetype
      } is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { isValid: true };
}

export function validateFileSize(
  file: any,
  maxSize: number
): { isValid: boolean; error?: string } {
  if (!file || !file.size) {
    return {
      isValid: false,
      error: "No file provided or invalid file size",
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { isValid: true };
}

export function validateMultipleFiles(
  files: any[],
  maxCount: number,
  allowedTypes: string[],
  maxSizePerFile: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!files || files.length === 0) {
    errors.push("No files provided");
    return { isValid: false, errors };
  }

  if (files.length > maxCount) {
    errors.push(`Maximum ${maxCount} files allowed`);
  }

  files.forEach((file, index) => {
    const typeValidation = validateFileType(file, allowedTypes);
    if (!typeValidation.isValid) {
      errors.push(`File ${index + 1}: ${typeValidation.error}`);
    }

    const sizeValidation = validateFileSize(file, maxSizePerFile);
    if (!sizeValidation.isValid) {
      errors.push(`File ${index + 1}: ${sizeValidation.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
