import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import authService from '../service/authService';
import logger from '../utils/logger';

const prisma = new PrismaClient();
type Role = 'USER' | 'OWNER';

// Extend Request interface to include user
declare global {
   namespace Express {
      interface Request {
         user?: {
            userId: string;
            role: Role;
         };
      }
   }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
         });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      const decoded = authService.verifyToken(token);

      // Get user from database to ensure user still exists
      const user = await authService.getUserById(decoded.userId);

      if (!user) {
         return res.status(401).json({
            success: false,
            message: 'Access denied. User not found.'
         });
      }

      if (!user.isVerified) {
         return res.status(401).json({
            success: false,
            message: 'Access denied. Please verify your email.'
         });
      }

      req.user = {
         userId: user.id,
         role: user.role
      };

      next();
   } catch (error) {
      logger.error('Authentication error:', error);
      return res.status(401).json({
         success: false,
         message: 'Access denied. Invalid token.'
      });
   }
};

// Authorization middleware for specific roles
export const authorize = (...roles: Role[]) => {
   return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
         return res.status(401).json({
            success: false,
            message: 'Access denied. Please authenticate first.'
         });
      }

      if (!roles.includes(req.user.role)) {
         return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.'
         });
      }

      next();
   };
};

// Combined middleware for auth.role:user and auth.role:tenant
export const authUser = [ authenticate, authorize('USER') ];
export const authTenant = [ authenticate, authorize('OWNER') ];
export const authAny = [ authenticate ]; // Any authenticated user
