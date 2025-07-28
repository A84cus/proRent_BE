// middleware/loggerMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
   const start = Date.now();

   // Log request
   Logger.http(`${req.method} ${req.path} - ${req.ip}`);

   // Log response when it finishes
   res.on('finish', () => {
      const duration = Date.now() - start;
      Logger.http(`${res.statusCode} ${req.method} ${req.path} - ${duration}ms`);
   });

   next();
};

export default loggerMiddleware;
