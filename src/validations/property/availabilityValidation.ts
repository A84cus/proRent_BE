import { z } from "zod";
import { AvailabilityItem } from "../../interfaces/property";

/**
 * Validation schema for a single availability item
 */
export const availabilityItemSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  isAvailable: z.boolean(),
}) satisfies z.ZodType<AvailabilityItem>;

/**
 * Validation schema for bulk availability setting
 */
export const setBulkAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Room ID is required"),
  }),
  body: z.object({
    availability: z
      .array(availabilityItemSchema)
      .min(1, "Availability array cannot be empty"),
  }),
});

/**
 * Validation schema for monthly availability query
 */
export const getMonthlyAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Room ID is required"),
  }),
  query: z.object({
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
      .refine((month) => {
        const [yearStr, monthStr] = month.split("-");
        const year = parseInt(yearStr, 10);
        const monthNum = parseInt(monthStr, 10);
        return year >= 2000 && year <= 2100 && monthNum >= 1 && monthNum <= 12;
      }, "Invalid year or month range"),
  }),
});

export type SetBulkAvailabilityRequest = z.infer<
  typeof setBulkAvailabilitySchema
>;
export type GetMonthlyAvailabilityRequest = z.infer<
  typeof getMonthlyAvailabilitySchema
>;
