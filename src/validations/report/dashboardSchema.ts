// src/schemas/report/dashboardSchema.ts
import { Status } from '@prisma/client';
import { z } from 'zod';

const DateSchema = z.preprocess(arg => {
   if (typeof arg === 'string') {
      return new Date(arg);
   }
   return arg;
}, z.date().nullable().optional());

const ReservationStatusSchema = z.enum(Status);

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
   page: z.number().int().min(1).default(1),
   pageSize: z.number().int().min(1).max(100).default(20),
   sortBy: z.enum([ 'startDate', 'endDate', 'createdAt', 'paymentAmount' ]).optional().default('startDate'),
   sortDir: z.enum([ 'asc', 'desc' ]).optional().default('desc')
});

export const DashboardInputSchema = z.object({
   ownerId: z.string().length(12),
   filters: DashboardFiltersSchema.optional().default(() => ({
      propertyId: '',
      roomTypeId: '',
      startDate: null,
      endDate: null,
      status: [],
      search: ''
   })),
   options: DashboardOptionsSchema.optional().default({
      page: 1,
      pageSize: 20,
      sortBy: 'startDate',
      sortDir: 'desc'
   })
});

export type DashboardInput = z.infer<typeof DashboardInputSchema>;
