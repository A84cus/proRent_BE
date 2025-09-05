import { z } from "zod";
import { RateType } from "@prisma/client";
import {
  PeakRateCreateData,
  PeakRateUpdateData,
} from "../../interfaces/property";

/**
 * Validation schema for peak rate creation
 */
export const createPeakRateSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Room ID is required"),
  }),
  body: z.object({
    startDate: z.string().min(1, "Start date is required").trim(),
    endDate: z.string().min(1, "End date is required").trim(),
    rateType: z.nativeEnum(RateType, {
      message: "Rate type must be FIXED or PERCENTAGE",
    }),
    value: z.number().positive("Value must be greater than 0"),
    description: z
      .string()
      .optional()
      .transform((val) => val?.trim()),
  }),
}) satisfies z.ZodType<{ params: { id: string }; body: PeakRateCreateData }>;

/**
 * Validation schema for peak rate update
 */
export const updatePeakRateSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Room ID is required"),
    date: z.string().min(1, "Date is required"),
  }),
  body: z
    .object({
      startDate: z.string().trim().optional(),
      endDate: z.string().trim().optional(),
      rateType: z.nativeEnum(RateType).optional(),
      value: z.number().positive("Value must be greater than 0").optional(),
      description: z
        .string()
        .optional()
        .transform((val) => val?.trim()),
    })
    .refine(
      (data) =>
        data.startDate !== undefined ||
        data.endDate !== undefined ||
        data.rateType !== undefined ||
        data.value !== undefined ||
        data.description !== undefined,
      {
        message: "At least one field must be provided for update",
      }
    ),
});

/**
 * Validation schema for peak rate removal
 */
export const removePeakRateSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Room ID is required"),
    date: z.string().min(1, "Date is required"),
  }),
});

export type CreatePeakRateRequest = z.infer<typeof createPeakRateSchema>;
export type UpdatePeakRateRequest = z.infer<typeof updatePeakRateSchema>;
export type RemovePeakRateRequest = z.infer<typeof removePeakRateSchema>;
