import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { NODE_ENV } from '../../config/index'; // Import your env config
import { RESERVATION_ERROR_MESSAGES, RESERVATION_SUCCESS_MESSAGES } from '../../constants/controllers/reservation';
import { SYSTEM_ERROR_MESSAGES, USER_ERROR_MESSAGES } from '../../constants';
import { Role } from '@prisma/client';

export function getUserIdFromRequest (req: Request): string {
   const userId = req.user?.userId;
   if (!userId) {
      throw new Error('AUTH_REQUIRED');
   }
   return userId;
}

export function getRoleFromRequest (req: Request): Role {
   const role = req.user?.role;
   if (!role) {
      throw new Error(USER_ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
   }
   return role;
}

export function prepareInputData (req: Request, userId: string): any {
   return {
      ...req.body,
      userId
   };
}

export function handleError (res: Response, error: any): Response {
   console.error('Error in createReservationController:', error);

   if (error instanceof ZodError) {
      return res.status(400).json({
         error: RESERVATION_ERROR_MESSAGES.INVALID_INPUT_DATA,
         details: NODE_ENV === 'development' ? error : undefined
      });
   }

   if (error.message === 'AUTH_REQUIRED') {
      return res.status(401).json({ error: RESERVATION_ERROR_MESSAGES.AUTH_REQUIRED });
   }

   if (error.message?.includes('Xendit payment setup failed')) {
      return res.status(500).json({ error: error.message });
   }

   if (error.message) {
      return res.status(400).json({ error: error.message });
   }
   return res.status(500).json({
      error: RESERVATION_ERROR_MESSAGES.CREATE_RESERVATION_ERROR
   });
}
