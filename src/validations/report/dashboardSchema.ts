// src/schemas/report/dashboardSchema.ts
import { Status } from '@prisma/client';
import { z } from 'zod';

const DateSchema = z
   .union([ z.string().trim(), z.date(), z.null(), z.undefined() ])
   .transform((arg): Date | null => {
      if (arg === null || arg === undefined || arg === '') {
         return null;
      }
      if (arg instanceof Date) {
         return isNaN(arg.getTime()) ? null : arg;
      }
      if (typeof arg === 'string') {
         const date = new Date(arg);
         return isNaN(date.getTime()) ? null : date;
      }
      return null;
   })
   .nullable()
   .optional();

const ReservationStatusSchema = z.enum(Status);

const ReservationPageInputSchema: z.ZodType<number | Record<string, number>> = z
   .union([ z.number().int().min(1), z.record(z.string().min(1), z.number().int().min(1)) ])
   .optional()
   .default(1);

export const DashboardFiltersSchema = z.object({
   propertyId: z.string().length(12).optional(),
   roomTypeId: z.string().length(12).optional(),
   startDate: DateSchema,
   endDate: DateSchema,
   status: z.array(ReservationStatusSchema).optional(),
   search: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .transform(s => s?.toLowerCase())
});

export const DashboardOptionsSchema = z.object({
   page: z.preprocess(val => {
      if (val === undefined || val === null || val === '') {
         return undefined;
      }
      const num = Number(val);
      return isNaN(num) || !Number.isInteger(num) || num < 1 ? undefined : num;
   }, z.number().int().min(1).default(1)),
   pageSize: z.preprocess(val => {
      if (val === undefined || val === null || val === '') {
         return undefined;
      }
      const num = Number(val);
      return isNaN(num) || !Number.isInteger(num) || num < 1 ? undefined : Math.min(num, 100);
   }, z.number().int().min(1).max(100).default(20)),
   sortBy: z.enum([ 'startDate', 'endDate', 'createdAt', 'paymentAmount' ]).optional().default('startDate'),
   sortDir: z.enum([ 'asc', 'desc' ]).optional().default('desc'),
   reservationPage: ReservationPageInputSchema,
   reservationPageSize: z.preprocess(val => {
      if (val === undefined || val === null || val === '') {
         return undefined;
      }
      const num = Number(val);
      return isNaN(num) || !Number.isInteger(num) || num < 1 ? undefined : Math.min(num, 100);
   }, z.number().int().min(1).max(100).default(10)),
   fetchAllData: z.preprocess(val => {
      // Handle string "true"/"false" from query params robustly
      if (typeof val === 'string') {
         const lowerVal = val.toLowerCase();
         if (lowerVal === 'true') {
            return true;
         }
         if (lowerVal === 'false' || lowerVal === '') {
            return false;
         }
      }
      // Handle boolean values directly
      if (typeof val === 'boolean') {return val;}
      // Default or invalid value
      return undefined;
   }, z.boolean().optional().default(false))
});

export const DashboardInputSchema = z.object({
   ownerId: z.string().length(12),
   filters: DashboardFiltersSchema.optional().default(() => ({
      propertyId: '',
      roomTypeId: '',
      startDate: undefined,
      endDate: undefined,
      status: [],
      search: ''
   })),
   options: DashboardOptionsSchema.optional().default({
      page: 1,
      pageSize: 20,
      reservationPage: 1,
      reservationPageSize: 10,
      sortBy: 'startDate',
      sortDir: 'desc',
      fetchAllData: false
   })
});

export type DashboardInput = z.infer<typeof DashboardInputSchema>;
