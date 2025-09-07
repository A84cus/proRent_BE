// src/middleware/system/rawBodyMiddleware.ts

import { Request, Response, NextFunction } from 'express';

export function rawBodyMiddleware (req: Request, res: Response, next: NextFunction) {
   // Array to hold chunks of data
   const chunks: Buffer[] = [];

   // Listen for data events
   req.on('data', chunk => {
      chunks.push(chunk);
   });

   // Listen for end event
   req.on('end', () => {
      // Concatenate all chunks into a single buffer
      const rawBody = Buffer.concat(chunks);
      // Attach it to the request object
      (req as any).rawBody = rawBody;
      next();
   });

   // Listen for error event
   req.on('error', err => {
      console.error('Error reading raw body:', err);
      next(err);
   });
}
